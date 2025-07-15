import * as vscode from 'vscode';
import { ExtensionState } from '../types';
import { NotificationService } from '../services/ui/notificationService';
import { t } from '../i18n';

/**
 * 实时检测命令处理器
 */
export class RealtimeDetectionCommand {
    public static readonly ID = 'ailog.enableRealtimeDetection';

    constructor(
        private updateState: (updater: (state: ExtensionState) => ExtensionState) => void,
        private notificationService: NotificationService
    ) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(RealtimeDetectionCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    private execute(): void {
        this.updateState(() => ({
            enableRealtimeDetection: true,
            isAiGenerated: false
        }));

        this.notificationService.showSuccess(
            t('messages.realtimeEnabled')
        );
    }
}