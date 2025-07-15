import * as vscode from 'vscode';
import { DetectionConfig } from '../types';

/**
 * 配置服务类
 * 
 * 负责管理扩展的所有配置选项，包括AI归属设置和检测配置。
 * 提供类型安全的配置访问和自动配置更新监听。
 * 
 * 主要功能：
 * - AI归属名称和邮箱配置
 * - 检测算法配置参数
 * - 实时配置更新监听
 * - 默认值管理
 * 
 * @class ConfigService
 */
export class ConfigService {
    /** 配置节点名称 */
    private static readonly CONFIG_SECTION = 'ailog';
    
    /** 配置变更事件发射器 */
    private readonly onDidChangeConfigurationEmitter = new vscode.EventEmitter<void>();
    
    /** 配置变更事件 */
    public readonly onDidChangeConfiguration = this.onDidChangeConfigurationEmitter.event;

    /**
     * 构造函数
     * 
     * 初始化配置服务，设置配置变更监听器。
     */
    constructor() {
        // 监听配置变更
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(ConfigService.CONFIG_SECTION)) {
                this.onDidChangeConfigurationEmitter.fire();
            }
        });
    }

    /**
     * 获取AI归属名称
     * 
     * 返回用于提交归属的AI工具名称。
     * 
     * @returns AI工具名称
     */
    public getAiAttributionName(): string {
        return this.getConfiguration().get<string>('aiAttribution.name', 'Cursor AI');
    }

    /**
     * 获取AI归属邮箱
     * 
     * 返回用于提交归属的AI工具邮箱地址。
     * 
     * @returns AI工具邮箱地址
     */
    public getAiAttributionEmail(): string {
        return this.getConfiguration().get<string>('aiAttribution.email', 'cursor-ai@company.com');
    }

    /**
     * 获取完整的AI归属字符串
     * 
     * 返回格式化的AI归属字符串，用于添加到提交消息中。
     * 格式：Co-authored-by: AI名称 <邮箱地址>
     * 
     * @returns 格式化的AI归属字符串
     */
    public getAiAttributionString(): string {
        const name = this.getAiAttributionName();
        const email = this.getAiAttributionEmail();
        return `Co-authored-by: ${name} <${email}>`;
    }

    /**
     * 获取AI归属示例字符串
     * 
     * 返回用于在UI中显示的AI归属示例。
     * 
     * @returns AI归属示例字符串
     */
    public getAiAttributionExample(): string {
        return `Example: ${this.getAiAttributionString()}`;
    }

    /**
     * 获取检测配置
     * 
     * 返回AI检测算法的配置参数。
     * 
     * @returns 检测配置对象
     */
    public getDetectionConfig(): DetectionConfig {
        const config = this.getConfiguration();
        
        return {
            confidenceThreshold: config.get<number>('detection.confidenceThreshold', 70),
            chunkSizeThreshold: 100, // 固定值，暂不开放配置
            timeProximityWindow: 5000, // 固定值，暂不开放配置
            enableTimeProximity: config.get<boolean>('detection.enableTimeProximity', true),
            enablePatternMatching: config.get<boolean>('detection.enablePatternMatching', true)
        };
    }

    /**
     * 设置AI归属名称
     * 
     * 更新AI归属名称配置。
     * 
     * @param name - 新的AI工具名称
     */
    public async setAiAttributionName(name: string): Promise<void> {
        await this.getConfiguration().update('aiAttribution.name', name, vscode.ConfigurationTarget.Global);
    }

    /**
     * 设置AI归属邮箱
     * 
     * 更新AI归属邮箱配置。
     * 
     * @param email - 新的AI工具邮箱地址
     */
    public async setAiAttributionEmail(email: string): Promise<void> {
        await this.getConfiguration().update('aiAttribution.email', email, vscode.ConfigurationTarget.Global);
    }

    /**
     * 设置检测置信度阈值
     * 
     * 更新AI检测的置信度阈值配置。
     * 
     * @param threshold - 新的置信度阈值 (0-100)
     */
    public async setConfidenceThreshold(threshold: number): Promise<void> {
        if (threshold < 0 || threshold > 100) {
            throw new Error('Confidence threshold must be between 0 and 100');
        }
        await this.getConfiguration().update('detection.confidenceThreshold', threshold, vscode.ConfigurationTarget.Global);
    }

    /**
     * 设置时间邻近性检测开关
     * 
     * 启用或禁用时间邻近性检测。
     * 
     * @param enabled - 是否启用时间邻近性检测
     */
    public async setTimeProximityEnabled(enabled: boolean): Promise<void> {
        await this.getConfiguration().update('detection.enableTimeProximity', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * 设置模式匹配检测开关
     * 
     * 启用或禁用模式匹配检测。
     * 
     * @param enabled - 是否启用模式匹配检测
     */
    public async setPatternMatchingEnabled(enabled: boolean): Promise<void> {
        await this.getConfiguration().update('detection.enablePatternMatching', enabled, vscode.ConfigurationTarget.Global);
    }

    /**
     * 重置所有配置为默认值
     * 
     * 将所有配置项重置为默认值。
     */
    public async resetToDefaults(): Promise<void> {
        const config = this.getConfiguration();
        await config.update('aiAttribution.name', undefined, vscode.ConfigurationTarget.Global);
        await config.update('aiAttribution.email', undefined, vscode.ConfigurationTarget.Global);
        await config.update('detection.confidenceThreshold', undefined, vscode.ConfigurationTarget.Global);
        await config.update('detection.enableTimeProximity', undefined, vscode.ConfigurationTarget.Global);
        await config.update('detection.enablePatternMatching', undefined, vscode.ConfigurationTarget.Global);
    }

    /**
     * 获取配置对象
     * 
     * 返回VS Code的配置对象。
     * 
     * @returns VS Code配置对象
     * @private
     */
    private getConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration(ConfigService.CONFIG_SECTION);
    }

    /**
     * 释放资源
     * 
     * 清理配置服务使用的资源。
     */
    public dispose(): void {
        this.onDidChangeConfigurationEmitter.dispose();
    }
}