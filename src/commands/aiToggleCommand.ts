import * as vscode from 'vscode';
import { ExtensionState } from '../types';

/**
 * AI状态切换命令处理器
 */
export class AIToggleCommand {
    public static readonly ID = 'ailog.toggleAiGenerated';

    constructor(
        private updateState: (updater: (state: ExtensionState) => ExtensionState) => void
    ) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(AIToggleCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    private execute(): void {
        this.updateState(state => {
            if (state.enableRealtimeDetection) {
                return {
                    enableRealtimeDetection: false,
                    isAiGenerated: false
                };
            } else {
                return {
                    ...state,
                    isAiGenerated: !state.isAiGenerated
                };
            }
        });
    }
}