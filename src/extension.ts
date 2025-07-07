import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { connectToDatabase, insertCommit, getCommits, Commit } from './database';

let isAiGenerated = false;
let statusBarItem: vscode.StatusBarItem;




function installGitHook() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Please open a project folder to install the Git hook.');
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const gitDir = path.join(workspaceRoot, '.git');

    if (!fs.existsSync(gitDir)) {
        vscode.window.showErrorMessage('This does not seem to be a Git repository. Please run "git init" first.');
        return;
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir);
    }

    const postCommitHookPath = path.join(hooksDir, 'post-commit');
    const hookScript = '#!/bin/sh\n' + 'exec code --command watch-cursor.processCommit\n';

    fs.writeFileSync(postCommitHookPath, hookScript, { mode: 0o755 });
    vscode.window.showInformationMessage('Git post-commit hook installed successfully.');
}


function updateStatusBar() {
    statusBarItem.text = `AI Generated: ${isAiGenerated ? '✅' : '❌'}`;
    statusBarItem.tooltip = 'Click to toggle if the commit is AI generated';
}

function createDashboardPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'commitDashboard',
        'Commit Dashboard',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, 'src'),
                vscode.Uri.joinPath(context.extensionUri, 'node_modules')
            ]
        }
    );

    panel.webview.html = getWebviewContent(context, panel.webview);

    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'getCommits':
                const repo = message.repo || undefined;
                const branch = message.branch || undefined;
                const commits = await getCommits(repo, branch);
                panel.webview.postMessage({ command: 'loadCommits', commits });
                return;
        }
    });
}

function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'dashboard.html');
    let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

    const chartjsUri = webview.asWebviewUri(vscode.Uri.joinPath(
        context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'
    ));

    htmlContent = htmlContent.replace(
        '"https://cdn.jsdelivr.net/npm/chart.js"',
        `"${chartjsUri.toString()}"`
    );

    return htmlContent;
}



export function activate(context: vscode.ExtensionContext) {
    console.log('[Watch Cursor] Extension is now active.');

    connectToDatabase();

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'watch-cursor.toggleAiGenerated';
    updateStatusBar();
    statusBarItem.show();

    const toggleAiCommand = vscode.commands.registerCommand('watch-cursor.toggleAiGenerated', () => {
        isAiGenerated = !isAiGenerated;
        updateStatusBar();
    });

    const dashboardCommand = vscode.commands.registerCommand('watch-cursor.showDashboard', () => {
        createDashboardPanel(context);
    });

    const installHookCommand = vscode.commands.registerCommand('watch-cursor.installGitHook', installGitHook);

    const processCommitCommand = vscode.commands.registerCommand('watch-cursor.processCommit', async () => {
        if (vscode.workspace.workspaceFolders) {
            const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const git: SimpleGit = simpleGit(workspaceRoot);
            try {
                const log = await git.log({ n: 1 });
                const latestCommit = log.latest;
                if (latestCommit) {
                    const repo = path.basename(workspaceRoot);
                    const branch = await git.branch();
                    const diffSummary = await git.diffSummary(['HEAD^', 'HEAD']);

                    const commitData: Commit = {
                        commit_time: new Date(latestCommit.date).getTime(),
                        commit_hash: latestCommit.hash,
                        repo: repo,
                        branch: branch.current,
                        committer: latestCommit.author_name,
                        is_ai_generated: isAiGenerated,
                        code_volume_delta: diffSummary.insertions - diffSummary.deletions,
                        code_write_speed_delta: 0, // Placeholder
                        notes: latestCommit.message
                    };
                    await insertCommit(commitData);
                    console.log('Commit data saved');
                    isAiGenerated = false; // Reset after commit
                    updateStatusBar();
                }
            } catch (error) {
                console.error('Failed to process commit:', error);
            }
        }
    });

    context.subscriptions.push(toggleAiCommand, dashboardCommand, installHookCommand, processCommitCommand, statusBarItem);

    vscode.window.showInformationMessage(
        'Watch Cursor is active. Run "Watch Cursor: Install Git Hook" from the Command Palette to complete setup.',
        'Install Hook'
    ).then(selection => {
        if (selection === 'Install Hook') {
            vscode.commands.executeCommand('watch-cursor.installGitHook');
        }
    });
}


export function deactivate() {
    console.log('[Watch Cursor] Extension deactivated.');
}
