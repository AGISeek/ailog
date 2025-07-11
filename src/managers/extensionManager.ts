import * as vscode from 'vscode';
import * as path from 'path';
import { ExtensionState } from '../types';
import { AIDetectionService } from '../services/detection/aiDetectionService';
import { StatusBarService } from '../services/ui/statusBarService';
import { NotificationService } from '../services/ui/notificationService';
import { DashboardService } from '../services/ui/dashboardService';
import { GitAnalysisService } from '../services/git/gitAnalysisService';
import { GitHookService } from '../services/git/gitHookService';
import { GitCommitService } from '../services/git/gitCommitService';
import { ConfigService } from '../services/configService';

/**
 * 扩展管理器 - 负责协调各个服务的初始化和交互
 */
export class ExtensionManager {
    private state: ExtensionState;
    private configService!: ConfigService;
    private statusBarService!: StatusBarService;
    private notificationService!: NotificationService;
    private dashboardService!: DashboardService;
    private aiDetectionService!: AIDetectionService;
    private gitAnalysisService!: GitAnalysisService;
    private gitHookService!: GitHookService;
    private gitCommitService!: GitCommitService;

    constructor(private context: vscode.ExtensionContext) {
        this.state = {
            isAiGenerated: false,
            enableRealtimeDetection: false
        };

        this.initializeServices();
    }

    private initializeServices(): void {
        // 配置服务
        this.configService = new ConfigService();
        
        // UI服务
        this.statusBarService = new StatusBarService();
        this.notificationService = new NotificationService();
        this.dashboardService = new DashboardService();

        // 检测服务
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (workspaceRoot) {
            const logPath = path.join(workspaceRoot, '.git', 'ai_activity.log');
            this.aiDetectionService = new AIDetectionService(logPath, this.configService);
            this.gitAnalysisService = new GitAnalysisService(workspaceRoot, logPath);
            this.gitHookService = new GitHookService(workspaceRoot);
            this.gitCommitService = new GitCommitService(workspaceRoot, this.configService);
        }

        // 初始化状态栏
        this.statusBarService.updateStatus(this.state);
    }

    public getState(): ExtensionState {
        return { ...this.state };
    }

    public updateState(updater: (state: ExtensionState) => ExtensionState): void {
        this.state = updater(this.state);
        this.statusBarService.updateStatus(this.state);
    }

    public getStatusBarService(): StatusBarService {
        return this.statusBarService;
    }

    public getNotificationService(): NotificationService {
        return this.notificationService;
    }

    public getDashboardService(): DashboardService {
        return this.dashboardService;
    }

    public getAIDetectionService(): AIDetectionService {
        return this.aiDetectionService;
    }

    public getGitAnalysisService(): GitAnalysisService {
        return this.gitAnalysisService;
    }

    public getGitHookService(): GitHookService {
        return this.gitHookService;
    }

    public getGitCommitService(): GitCommitService {
        return this.gitCommitService;
    }

    public getConfigService(): ConfigService {
        return this.configService;
    }

    public dispose(): void {
        this.statusBarService.dispose();
        this.configService.dispose();
    }
}