import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { connectToDatabase, insertCommit, getCommits, getUniqueRepos, getUniqueBranches, Commit } from './database';
import { initialize as initializeI18n, t } from './i18n';

/**
 * 全局变量，用于标记下一次提交是否由 AI 生成。
 * @type {boolean}
 */
let isAiGenerated = false;

/**
 * VS Code 状态栏项目，用于显示和切换 AI 生成标记。
 * @type {vscode.StatusBarItem}
 */
let statusBarItem: vscode.StatusBarItem;

/**
 * 插件的激活函数，在 VS Code 启动或首次使用插件功能时调用。
 * @param {vscode.ExtensionContext} context - 插件的上下文，包含订阅和资源路径等。
 */
export function activate(context: vscode.ExtensionContext) {
    // 初始化国际化
    initializeI18n(context);

    console.log('[AIlog] Extension is now active.');

    // 连接数据库
    connectToDatabase();

    // 创建并配置状态栏项目
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ailog.toggleAiGenerated';
    updateStatusBar();
    statusBarItem.show();

    // 注册切换 AI 标记状态的命令
    const toggleAiCommand = vscode.commands.registerCommand('ailog.toggleAiGenerated', () => {
        isAiGenerated = !isAiGenerated;
        updateStatusBar();
    });

    // 注册显示仪表盘的命令
    const dashboardCommand = vscode.commands.registerCommand('ailog.showDashboard', () => {
        createDashboardPanel(context);
    });

    // 注册安装 Git 钩子的命令
    const installHookCommand = vscode.commands.registerCommand('ailog.installGitHook', installGitHook);

    // 注册由 Git 钩子调用的、用于处理提交的内部命令
    const processCommitCommand = vscode.commands.registerCommand('ailog.processCommit', async () => {
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
                        code_write_speed_delta: 0, // 占位符，未来可扩展
                        notes: latestCommit.message
                    };
                    await insertCommit(commitData);
                    console.log('Commit data saved');
                    // 提交后重置 AI 标记状态
                    isAiGenerated = false;
                    updateStatusBar();
                }
            } catch (error) {
                console.error('Failed to process commit:', error);
            }
        }
    });

    // 将所有命令和状态栏项目添加到订阅中，以便在插件停用时自动释放资源
    context.subscriptions.push(toggleAiCommand, dashboardCommand, installHookCommand, processCommitCommand, statusBarItem);

    // 首次激活时显示提示信息，引导用户安装 Git 钩子
    vscode.window.showInformationMessage(
        t('messages.initialization', t('command.installGitHook')),
        t('messages.installHookButton')
    ).then(selection => {
        if (selection === t('messages.installHookButton')) {
            vscode.commands.executeCommand('ailog.installGitHook');
        }
    });
}

/**
 * 在当前工作区的 .git/hooks 目录下创建 post-commit 钩子脚本。
 * 这个钩子会在每次提交后自动执行 `ailog.processCommit` 命令。
 */
function installGitHook() {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(t('messages.noProjectFolder'));
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const gitDir = path.join(workspaceRoot, '.git');

    if (!fs.existsSync(gitDir)) {
        vscode.window.showErrorMessage(t('messages.notGitRepo'));
        return;
    }

    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir);
    }

    const postCommitHookPath = path.join(hooksDir, 'post-commit');
    // Git 钩子脚本内容，它通过 VS Code 的 CLI 来调用插件的内部命令
    const hookScript = '#!/bin/sh\n' + 'exec code --command ailog.processCommit\n';

    fs.writeFileSync(postCommitHookPath, hookScript, { mode: 0o755 }); // 赋予执行权限
    vscode.window.showInformationMessage(t('messages.hookInstalled'));
}


/**
 * 更新状态栏项目的文本和提示，以反映当前的 AI 标记状态。
 */
function updateStatusBar() {
    statusBarItem.text = t('statusBar.aiGenerated', isAiGenerated ? '✅' : '❌');
    statusBarItem.tooltip = t('statusBar.tooltip');
}

/**
 * 创建并显示仪表盘的 Webview 面板。
 * @param {vscode.ExtensionContext} context - 插件的上下文。
 */
function createDashboardPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'commitDashboard',
        t('dashboard.title'),
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            // 设置允许访问的本地资源根路径
            localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, 'src'),
                vscode.Uri.joinPath(context.extensionUri, 'node_modules'),
                vscode.Uri.joinPath(context.extensionUri, 'l10n')
            ]
        }
    );

    panel.webview.html = getWebviewContent(context, panel.webview);

    // 处理来自 Webview 的消息
    panel.webview.onDidReceiveMessage(async message => {
        switch (message.command) {
            case 'getCommits':
                const repo = message.repo || undefined;
                const branch = message.branch || undefined;
                const commits = await getCommits(repo, branch);
                panel.webview.postMessage({ command: 'loadCommits', commits });
                return;
            case 'getRepos':
                const repos = await getUniqueRepos();
                panel.webview.postMessage({ command: 'loadRepos', repos });
                return;
            case 'getBranches':
                const selectedRepo = message.repo || undefined;
                const branches = await getUniqueBranches(selectedRepo);
                panel.webview.postMessage({ command: 'loadBranches', branches });
                return;
        }
    });
}

/**
 * 读取 dashboard.html 文件的内容，并替换其中的占位符。
 * @param {vscode.ExtensionContext} context - 插件的上下文。
 * @param {vscode.Webview} webview - 当前的 Webview 实例。
 * @returns {string} - 处理过的、可用于 Webview 的 HTML 字符串。
 */
function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
    const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'dashboard.html');
    let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

    // 将 chart.js 的本地文件路径转换为 Webview 可用的 URI
    const chartjsUri = webview.asWebviewUri(vscode.Uri.joinPath(
        context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'
    ));

    // 替换 HTML 中的所有 {{key}} 占位符
    htmlContent = htmlContent.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const aKey = key.trim();
        if (aKey === 'chartjsUri') {
            return chartjsUri.toString();
        }
        return t(aKey);
    });

    return htmlContent;
}

/**
 * 插件的停用函数，在 VS Code 关闭时调用。
 */
export function deactivate() {
    console.log('[AIlog] Extension deactivated.');
}
