import * as vscode from 'vscode';
import { ConfigService } from '../services/configService';
import { NotificationService } from '../services/ui/notificationService';
import { t } from '../i18n';

/**
 * 配置AI归属命令处理器
 * 
 * 提供用户友好的界面来配置AI归属信息，包括AI工具名称和邮箱地址。
 * 支持快速设置常见的AI工具配置。
 * 
 * @class ConfigureAiAttributionCommand
 */
export class ConfigureAiAttributionCommand {
    public static readonly ID = 'ailog.configureAiAttribution';

    /**
     * 构造函数
     * 
     * @param configService - 配置服务实例
     * @param notificationService - 通知服务实例
     */
    constructor(
        private configService: ConfigService,
        private notificationService: NotificationService
    ) {}

    /**
     * 注册命令
     * 
     * @param context - VS Code扩展上下文
     */
    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(ConfigureAiAttributionCommand.ID, () => {
            this.execute();
        });

        context.subscriptions.push(command);
    }

    /**
     * 执行配置命令
     * 
     * 显示配置界面，让用户选择预设的AI工具或自定义配置。
     * 
     * @private
     */
    private async execute(): Promise<void> {
        try {
            // 显示配置选项
            const choice = await this.showConfigOptions();
            
            if (choice) {
                await this.handleConfigChoice(choice);
            }
        } catch (error) {
            console.error('Failed to configure AI attribution:', error);
            this.notificationService.showError('配置AI归属信息失败');
        }
    }

    /**
     * 显示配置选项
     * 
     * @returns 用户选择的配置选项
     * @private
     */
    private async showConfigOptions(): Promise<string | undefined> {
        const currentName = this.configService.getAiAttributionName();
        const currentEmail = this.configService.getAiAttributionEmail();
        
        const options = [
            {
                label: '$(edit) 自定义配置',
                description: '手动输入AI工具名称和邮箱',
                value: 'custom'
            },
            {
                label: '$(robot) Cursor AI',
                description: 'cursor-ai@company.com',
                value: 'cursor'
            },
            {
                label: '$(robot) GitHub Copilot',
                description: 'copilot@github.com',
                value: 'copilot'
            },
            {
                label: '$(robot) OpenAI ChatGPT',
                description: 'chatgpt@openai.com',
                value: 'chatgpt'
            },
            {
                label: '$(robot) Claude AI',
                description: 'claude@anthropic.com',
                value: 'claude'
            },
            {
                label: '$(eye) 查看当前设置',
                description: `当前: ${currentName} <${currentEmail}>`,
                value: 'view'
            }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: '选择AI工具或配置选项',
            title: 'AI归属配置'
        });

        return selected?.value;
    }

    /**
     * 处理用户的配置选择
     * 
     * @param choice - 用户选择的配置选项
     * @private
     */
    private async handleConfigChoice(choice: string): Promise<void> {
        switch (choice) {
            case 'custom':
                await this.showCustomConfig();
                break;
            case 'cursor':
                await this.setPresetConfig('Cursor AI', 'cursor-ai@company.com');
                break;
            case 'copilot':
                await this.setPresetConfig('GitHub Copilot', 'copilot@github.com');
                break;
            case 'chatgpt':
                await this.setPresetConfig('OpenAI ChatGPT', 'chatgpt@openai.com');
                break;
            case 'claude':
                await this.setPresetConfig('Claude AI', 'claude@anthropic.com');
                break;
            case 'view':
                this.showCurrentConfig();
                break;
        }
    }

    /**
     * 显示自定义配置界面
     * 
     * @private
     */
    private async showCustomConfig(): Promise<void> {
        // 输入AI工具名称
        const name = await vscode.window.showInputBox({
            prompt: '请输入AI工具名称',
            placeHolder: '例如: Cursor AI',
            value: this.configService.getAiAttributionName(),
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'AI工具名称不能为空';
                }
                return null;
            }
        });

        if (!name) {
            return;
        }

        // 输入邮箱地址
        const email = await vscode.window.showInputBox({
            prompt: '请输入邮箱地址',
            placeHolder: '例如: cursor-ai@company.com',
            value: this.configService.getAiAttributionEmail(),
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return '邮箱地址不能为空';
                }
                // 简单的邮箱格式验证
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return '请输入有效的邮箱地址';
                }
                return null;
            }
        });

        if (!email) {
            return;
        }

        // 保存配置
        await this.setPresetConfig(name.trim(), email.trim());
    }

    /**
     * 设置预设配置
     * 
     * @param name - AI工具名称
     * @param email - 邮箱地址
     * @private
     */
    private async setPresetConfig(name: string, email: string): Promise<void> {
        await this.configService.setAiAttributionName(name);
        await this.configService.setAiAttributionEmail(email);
        
        this.notificationService.showSuccess(
            `AI归属配置已更新: ${name} <${email}>`
        );
    }

    /**
     * 显示当前配置
     * 
     * @private
     */
    private showCurrentConfig(): void {
        const name = this.configService.getAiAttributionName();
        const email = this.configService.getAiAttributionEmail();
        const example = this.configService.getAiAttributionExample();
        
        vscode.window.showInformationMessage(
            `当前AI归属配置:\n名称: ${name}\n邮箱: ${email}\n\n${example}`,
            { modal: true }
        );
    }
}