import * as vscode from 'vscode';
import { ExtensionState } from '../../types';
import { t } from '../../i18n';

/**
 * 状态栏服务类
 * 
 * 负责管理VS Code状态栏中的AI检测状态显示。
 * 提供用户界面来显示当前的AI检测状态，并允许用户进行交互。
 * 
 * 状态栏显示两种模式：
 * - 手动模式：用户手动切换AI生成状态
 * - 实时模式：自动检测并显示AI生成状态
 * 
 * @class StatusBarService
 */
export class StatusBarService {
    /** VS Code状态栏项目实例 */
    private statusBarItem: vscode.StatusBarItem;

    /**
     * 构造函数
     * 
     * 初始化状态栏项目，设置其位置、优先级和关联的命令。
     */
    constructor() {
        // 创建状态栏项目，位于右侧，优先级为100
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 
            100
        );
        
        // 设置点击时执行的命令
        this.statusBarItem.command = 'ailog.toggleAiGenerated';
        
        // 显示状态栏项目
        this.statusBarItem.show();
    }

    /**
     * 更新状态栏显示
     * 
     * 根据当前的扩展状态更新状态栏的文本和提示信息。
     * 支持手动模式和实时检测模式的不同显示样式。
     * 
     * @param state - 当前的扩展状态
     */
    public updateStatus(state: ExtensionState): void {
        const { isAiGenerated, enableRealtimeDetection } = state;
        
        let text: string;
        let tooltip: string;
        
        if (enableRealtimeDetection) {
            // 实时检测模式：显示机器人图标
            text = t('statusBar.aiGenerated', isAiGenerated ? '🤖✅' : '🤖❌');
            tooltip = t('statusBar.realtimeTooltip');
        } else {
            // 手动模式：显示简单的勾选状态
            text = t('statusBar.aiGenerated', isAiGenerated ? '✅' : '❌');
            tooltip = t('statusBar.tooltip');
        }
        
        this.statusBarItem.text = text;
        this.statusBarItem.tooltip = tooltip;
    }

    /**
     * 释放资源
     * 
     * 清理状态栏项目，释放相关资源。
     * 在扩展停用时调用。
     */
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}