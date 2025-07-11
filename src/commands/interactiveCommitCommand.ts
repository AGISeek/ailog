import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { GitAnalysisService } from '../services/git/gitAnalysisService';
import { NotificationService } from '../services/ui/notificationService';
import { ConfigService } from '../services/configService';
import { t } from '../i18n';

/**
 * 交互式提交检查命令处理器
 */
export class InteractiveCommitCommand {
    public static readonly ID = 'ailog.interactiveCommitCheck';

    constructor(
        private gitAnalysisService: GitAnalysisService,
        private notificationService: NotificationService,
        private configService: ConfigService
    ) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(InteractiveCommitCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    private async execute(): Promise<void> {
        try {
            const commitInfo = await this.gitAnalysisService.analyzeCommitChanges();
            
            if (commitInfo.hasAiContent) {
                const report = this.generateReport(commitInfo);
                const shouldAddAttribution = await this.notificationService.showCommitAttributionDialog(report);
                
                if (shouldAddAttribution) {
                    this.setAIAttributionFlag();
                    this.notificationService.showSuccess(t('messages.aiAttributionSet'));
                } else {
                    this.notificationService.showSuccess(t('messages.aiAttributionSkipped'));
                }
            } else {
                this.notificationService.showSuccess(t('messages.noAiDetected'));
            }
        } catch (error) {
            console.error('Interactive commit check failed:', error);
            this.notificationService.showError(t('messages.commitCheckFailed'));
        }
    }

    private generateReport(commitInfo: any): string {
        const reportLines = ['=== AI Code Detection Report ==='];
        
        commitInfo.aiDetectionResults.forEach((result: any, index: number) => {
            if (result.isAiGenerated) {
                reportLines.push(`\nFile ${index + 1}: ${commitInfo.files[index]}`);
                reportLines.push(`Confidence: ${result.confidence}%`);
                reportLines.push(`Detection reasons: ${result.reasons.join(', ')}`);
            }
        });

        reportLines.push('\n=== Recommended Actions ===');
        reportLines.push('Recommend adding AI attribution information to commit message');
        reportLines.push(this.configService.getAiAttributionExample());

        return reportLines.join('\n');
    }

    private setAIAttributionFlag(): void {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return;
        }

        const flagFile = path.join(
            vscode.workspace.workspaceFolders[0].uri.fsPath, 
            '.git', 
            'AI_ATTRIBUTION_REQUESTED'
        );
        
        try {
            fs.writeFileSync(flagFile, new Date().toISOString());
        } catch (error) {
            console.error('Failed to set AI attribution flag:', error);
        }
    }
}