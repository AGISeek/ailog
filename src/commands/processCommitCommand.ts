import * as vscode from 'vscode';
import { GitCommitService } from '../services/git/gitCommitService';
import { ExtensionState } from '../types';

/**
 * 处理提交命令处理器
 */
export class ProcessCommitCommand {
    public static readonly ID = 'ailog.processCommit';

    constructor(
        private gitCommitService: GitCommitService,
        private getState: () => ExtensionState,
        private updateState: (updater: (state: ExtensionState) => ExtensionState) => void
    ) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(ProcessCommitCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    private async execute(): Promise<void> {
        try {
            const state = this.getState();
            await this.gitCommitService.processCommit(state.isAiGenerated);
            
            // 提交后重置AI标记状态
            this.updateState(state => ({
                ...state,
                isAiGenerated: false
            }));
            
            console.log('Commit processed successfully');
        } catch (error) {
            console.error('Failed to process commit:', error);
        }
    }
}