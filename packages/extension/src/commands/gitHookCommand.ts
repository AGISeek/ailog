import * as vscode from 'vscode';
import { GitHookService } from '../services/git/gitHookService';
import { NotificationService } from '../services/ui/notificationService';
import { t } from '../i18n';

/**
 * Git钩子安装命令处理器
 */
export class GitHookCommand {
    public static readonly ID = 'ailog.installGitHook';

    constructor(
        private gitHookService: GitHookService,
        private notificationService: NotificationService
    ) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(GitHookCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    private execute(): void {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            this.notificationService.showError(t('messages.noProjectFolder'));
            return;
        }

        try {
            this.gitHookService.installGitHooks();
        } catch (error) {
            console.error('Failed to install Git hooks:', error);
            this.notificationService.showError(t('messages.hookInstallFail', String(error)));
        }
    }
}