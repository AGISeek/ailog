import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

// #############################################################################
// ##                                                                         ##
// ##  的核心逻辑：VS Code 插件                                                 ##
// ##                                                                         ##
// #############################################################################

/**
 * 这是一个简化的AI活动检测器。
 * 在真实场景中，我们不会直接监听`cursor.accept`等命令，因为这很脆弱。
 * 相反，我们监听文本变化，并使用启发式方法来猜测这是否是AI操作。
 *
 * 启发式方法:
 * 1.  **代码块体积 (Chunk Size)**: 一次性插入大量代码 (>10行)。
 * 2.  **插入速度 (Velocity)**: 在极短时间内（<150毫秒）发生多次修改。
 *
 * 这是对您在上下文中描述的“代码静态特征分析”的直接实现。
 */

// 用于跟踪最近的文本更改事件，以计算速度
let lastChangeTimestamp = 0;
let recentChanges = 0;

function logAIActivity(document: vscode.TextDocument) {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }
    // 我们只关心工作区内的文件
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return;
    }

    const logFilePath = path.join(workspaceFolder.uri.fsPath, '.git', 'ai_activity.log');
    const logDirectory = path.dirname(logFilePath);

    // 确保.git/hooks目录存在
    if (!fs.existsSync(logDirectory)) {
        // 如果没有.git目录，说明不是一个git仓库，直接返回
        return;
    }

    const logEntry = {
        fsPath: document.uri.fsPath,
        timestamp: Date.now()
    };

    // 将活动记录为JSON行，追加到日志文件中
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
    console.log(`[Watch Cursor] AI activity detected and logged for: ${document.uri.fsPath}`);
}


function onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
    // 守卫：只处理真实的文件系统文档，忽略虚拟文档（如git commit输入框）
    if (event.document.uri.scheme !== 'file') {
        return;
    }

    // 忽略由插件自身或其他工具（如格式化）引起的、非用户输入的更改
    if (event.contentChanges.length === 0) {
        return;
    }

    const now = Date.now();
    const timeSinceLastChange = now - lastChangeTimestamp;
    lastChangeTimestamp = now;

    // --- 启发式检测逻辑 ---

    // 1. 速度检测：如果在150毫秒内发生多次更改，则有可能是AI操作
    if (timeSinceLastChange < 150) {
        recentChanges++;
        if (recentChanges > 2) { // 连续3次或以上的快速更改
            console.log(`[Watch Cursor] High velocity change detected.`);
            logAIActivity(event.document);
            recentChanges = 0; // 重置计数器
            return;
        }
    } else {
        recentChanges = 0; // 如果间隔时间长，则重置计数器
    }

    // 2. 体积检测：检查单次插入的行数
    for (const change of event.contentChanges) {
        const addedLines = change.text.split('\n').length;
        // 如果一次性增加了超过10行代码，我们有理由相信这是AI生成的
        if (addedLines > 10) {
            console.log(`[Watch Cursor] Large chunk insertion detected (${addedLines} lines).`);
            logAIActivity(event.document);
            return; // 记录一次即可
        }
    }
}

// #############################################################################
// ##                                                                         ##
// ##  安装与激活                                                             ##
// ##                                                                         ##
// #############################################################################

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

    // install_hook.sh 脚本应该与 extension.js 在同一目录中
    const scriptPath = path.join(__dirname, '..', 'install_hook.sh');

    if (!fs.existsSync(scriptPath)) {
         vscode.window.showErrorMessage(`Installation script not found at ${scriptPath}.`);
         return;
    }

    // 赋予脚本执行权限并在项目根目录运行它
    try {
        child_process.execSync(`chmod +x "${scriptPath}"`, { cwd: workspaceRoot });
        const output = child_process.execSync(`"${scriptPath}"`, { cwd: workspaceRoot });
        vscode.window.showInformationMessage(output.toString());
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to install Git hook: ${error.message}`);
    }
}


export function activate(context: vscode.ExtensionContext) {
    console.log('[Watch Cursor] Extension is now active.');

    // 注册安装命令
    const installCommand = vscode.commands.registerCommand('watch-cursor.installGitHook', installGitHook);
    context.subscriptions.push(installCommand);

    // 注册核心的文本更改监听器
    const disposable = vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument);
    context.subscriptions.push(disposable);

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
