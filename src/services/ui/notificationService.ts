import * as vscode from 'vscode';
import { AIDetectionResult } from '../../types';
import { t } from '../../i18n';

/**
 * 通知服务类
 * 
 * 负责显示各种通知和对话框。统一管理用户交互中的消息显示，
 * 包括成功、错误、警告和信息通知。
 * 
 * 支持的通知类型：
 * - AI检测结果通知
 * - 提交归属确认对话框
 * - 报告文档显示
 * - 成功、错误、警告消息
 * 
 * @class NotificationService
 */
export class NotificationService {
    /**
     * 显示AI检测结果通知
     * 
     * 当检测到AI生成的代码时，显示通知并提供相关操作选项。
     * 
     * @param result - AI检测结果对象
     * @returns 用户的选择结果（手动模式、查看详情或无操作）
     */
    public async showAIDetectionNotification(
        result: AIDetectionResult
    ): Promise<'manual' | 'details' | undefined> {
        const detailMessage = `${t('messages.confidence')}: ${result.confidence}%\n${t('messages.detectionReasons')}: ${result.reasons.join(', ')}`;
        
        const choice = await vscode.window.showInformationMessage(
            t('messages.aiDetected'),
            {
                modal: false,
                detail: detailMessage
            },
            t('messages.enableManualMode'),
            t('messages.viewDetails')
        );

        if (choice === t('messages.enableManualMode')) {
            return 'manual';
        } else if (choice === t('messages.viewDetails')) {
            return 'details';
        }
        
        return undefined;
    }

    /**
     * 显示提交归属确认对话框
     * 
     * 在提交前询问用户是否要将提交标记为AI生成。
     * 支持显示详细报告并递归询问。
     * 
     * @param reportContent - 检测报告内容
     * @returns 用户是否确认标记为AI生成
     */
    public async showCommitAttributionDialog(
        reportContent: string
    ): Promise<boolean> {
        const choice = await vscode.window.showInformationMessage(
            t('messages.commitAttributionPrompt'),
            {
                modal: true,
                detail: reportContent
            },
            t('messages.yes'),
            t('messages.no'),
            t('messages.viewDetails')
        );

        if (choice === t('messages.viewDetails')) {
            await this.showReportDocument(reportContent);
            // 递归调用，再次询问
            return this.showCommitAttributionDialog(reportContent);
        }

        return choice === t('messages.yes');
    }

    /**
     * 显示报告文档
     * 
     * 在新的文档窗口中显示检测报告内容。
     * 
     * @param content - 要显示的报告内容
     */
    public async showReportDocument(content: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'plaintext'
        });
        
        await vscode.window.showTextDocument(document);
    }

    /**
     * 显示成功消息
     * 
     * @param message - 成功消息文本
     */
    public showSuccess(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    /**
     * 显示错误消息
     * 
     * @param message - 错误消息文本
     */
    public showError(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    /**
     * 显示警告消息
     * 
     * @param message - 警告消息文本
     */
    public showWarning(message: string): void {
        vscode.window.showWarningMessage(message);
    }
}