import * as vscode from 'vscode';
import { connectToDatabase } from './database';
import { initialize as initializeI18n, t } from './i18n';
import { ExtensionManager } from './managers/extensionManager';
import { CommandManager } from './managers/commandManager';
import { DocumentChangeManager } from './managers/documentChangeManager';

/**
 * 主扩展入口点 - 简化版本，遵循单一职责原则
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('[AIlog] Extension activation started');

    // 初始化基础服务
    initializeI18n(context);
    connectToDatabase();

    // 初始化核心管理器
    const extensionManager = new ExtensionManager(context);
    const commandManager = new CommandManager(context, extensionManager);
    const documentChangeManager = new DocumentChangeManager(
        extensionManager.getAIDetectionService(),
        extensionManager.getNotificationService(),
        extensionManager.getState.bind(extensionManager),
        extensionManager.updateState.bind(extensionManager)
    );

    // 注册所有命令
    commandManager.registerAllCommands();

    // 显示初始化提示
    showInitializationMessage();

    // 注册清理函数
    context.subscriptions.push(
        { dispose: () => extensionManager.dispose() },
        { dispose: () => commandManager.dispose() },
        { dispose: () => documentChangeManager.dispose() }
    );

    console.log('[AIlog] Extension activated successfully');
}

function showInitializationMessage(): void {
    vscode.window.showInformationMessage(
        t('messages.initialization', t('command.installGitHook')),
        t('messages.installHookButton')
    ).then(selection => {
        if (selection === t('messages.installHookButton')) {
            vscode.commands.executeCommand('ailog.installGitHook');
        }
    });
}

export function deactivate() {
    console.log('[AIlog] Extension deactivated');
}