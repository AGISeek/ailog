import * as vscode from 'vscode';
import { ExtensionManager } from './extensionManager';
import { AIToggleCommand } from '../commands/aiToggleCommand';
import { RealtimeDetectionCommand } from '../commands/realtimeDetectionCommand';
import { DashboardCommand } from '../commands/dashboardCommand';
import { GitHookCommand } from '../commands/gitHookCommand';
import { InteractiveCommitCommand } from '../commands/interactiveCommitCommand';
import { ProcessCommitCommand } from '../commands/processCommitCommand';
import { ConfigureAiAttributionCommand } from '../commands/configureAiAttributionCommand';

/**
 * 命令管理器 - 负责注册和管理所有命令
 */
export class CommandManager {
    private commands: any[] = [];

    constructor(
        private context: vscode.ExtensionContext,
        private extensionManager: ExtensionManager
    ) {}

    public registerAllCommands(): void {
        this.registerCommand(new AIToggleCommand(
            this.extensionManager.updateState.bind(this.extensionManager)
        ));

        this.registerCommand(new RealtimeDetectionCommand(
            this.extensionManager.updateState.bind(this.extensionManager),
            this.extensionManager.getNotificationService()
        ));

        this.registerCommand(new DashboardCommand(
            this.extensionManager.getDashboardService()
        ));

        this.registerCommand(new GitHookCommand(
            this.extensionManager.getGitHookService(),
            this.extensionManager.getNotificationService()
        ));

        this.registerCommand(new InteractiveCommitCommand(
            this.extensionManager.getGitAnalysisService(),
            this.extensionManager.getNotificationService(),
            this.extensionManager.getConfigService()
        ));

        this.registerCommand(new ProcessCommitCommand(
            this.extensionManager.getGitCommitService(),
            this.extensionManager.getState.bind(this.extensionManager),
            this.extensionManager.updateState.bind(this.extensionManager)
        ));

        this.registerCommand(new ConfigureAiAttributionCommand(
            this.extensionManager.getConfigService(),
            this.extensionManager.getNotificationService()
        ));
    }

    private registerCommand(command: any): void {
        command.register(this.context);
        this.commands.push(command);
    }

    public dispose(): void {
        this.commands.forEach(command => {
            if (command.dispose) {
                command.dispose();
            }
        });
    }
}