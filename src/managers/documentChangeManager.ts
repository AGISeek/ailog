import * as vscode from 'vscode';
import { ExtensionState, AIDetectionResult } from '../types';
import { AIDetectionService } from '../services/detection/aiDetectionService';
import { NotificationService } from '../services/ui/notificationService';

/**
 * 文档变化管理器 - 负责处理文档变化事件和AI检测
 */
export class DocumentChangeManager {
    private disposable: vscode.Disposable;

    constructor(
        private aiDetectionService: AIDetectionService,
        private notificationService: NotificationService,
        private getState: () => ExtensionState,
        private updateState: (updater: (state: ExtensionState) => ExtensionState) => void
    ) {
        this.disposable = vscode.workspace.onDidChangeTextDocument(event => {
            this.handleDocumentChange(event);
        });
    }

    private handleDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const state = this.getState();
        
        if (!state.enableRealtimeDetection) {
            return;
        }

        try {
            const detectionResult = this.aiDetectionService.detectAI(event);
            
            if (detectionResult.isAiGenerated) {
                this.updateState(state => ({
                    ...state,
                    isAiGenerated: true
                }));
                
                this.showDetectionNotification(detectionResult);
            }
        } catch (error) {
            console.error('AI detection failed:', error);
            // 可以在这里添加后备检测逻辑
        }
    }

    private async showDetectionNotification(result: AIDetectionResult): Promise<void> {
        const choice = await this.notificationService.showAIDetectionNotification(result);
        
        if (choice === 'manual') {
            this.updateState(state => ({
                ...state,
                enableRealtimeDetection: false
            }));
        } else if (choice === 'details') {
            await this.showDetailedReport(result);
        }
    }

    private async showDetailedReport(result: AIDetectionResult): Promise<void> {
        const report = this.generateDetailedReport(result);
        await this.notificationService.showReportDocument(report);
    }

    private generateDetailedReport(result: AIDetectionResult): string {
        return [
            '=== AI Code Detection Detailed Report ===',
            '',
            `Confidence: ${result.confidence}%`,
            `Detection Result: ${result.isAiGenerated ? 'Likely AI-generated' : 'Likely not AI-generated'}`,
            '',
            'Detection Reasons:',
            ...result.reasons.map(reason => `• ${reason}`),
            '',
            'Detection Metadata:',
            `• Code block size: ${result.metadata.chunkSize} characters`,
            `• Pattern matches: ${result.metadata.patternMatches}`,
            `• Contains boilerplate: ${result.metadata.hasBoilerplate ? 'Yes' : 'No'}`,
            `• Contains quality comments: ${result.metadata.hasQualityComments ? 'Yes' : 'No'}`,
            `• Time proximity score: ${result.metadata.timeProximity}`,
            `• Language type: ${result.metadata.languageType}`,
            '',
            'Note: This is a heuristic-based detection result, for reference only.'
        ].join('\n');
    }

    public dispose(): void {
        this.disposable.dispose();
    }
}