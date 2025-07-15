import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { Commit } from '../../types';
import { insertCommit } from '../../database';
import { ConfigService } from '../configService';

/**
 * Git提交服务类
 * 
 * 负责处理Git提交的数据收集和存储。在提交后自动收集提交信息，
 * 分析代码变更量，并将数据存储到数据库中。
 * 
 * 主要功能：
 * - 提交数据收集和存储
 * - AI归属标记管理
 * - 提交消息的AI归属注释
 * - 代码变更量统计
 * 
 * @class GitCommitService
 */
export class GitCommitService {
    /** Simple Git实例，用于Git操作 */
    private git: SimpleGit;
    /** 工作区根目录路径 */
    private workspaceRoot: string;

    /**
     * 构造函数
     * 
     * 初始化Git提交服务，设置工作区路径和Git实例。
     * 
     * @param workspaceRoot - 工作区根目录路径
     */
    constructor(workspaceRoot: string, private configService: ConfigService) {
        this.workspaceRoot = workspaceRoot;
        this.git = simpleGit(workspaceRoot);
    }

    /**
     * 处理提交数据
     * 
     * 在提交后自动执行，收集提交信息和代码变更统计，
     * 并将数据存储到数据库中。
     * 
     * @param isAiGenerated - 是否为AI生成的提交
     */
    public async processCommit(isAiGenerated: boolean): Promise<void> {
        try {
            const log = await this.git.log({ n: 1 });
            const latestCommit = log.latest;
            
            if (!latestCommit) {
                console.log('No commit found to process');
                return;
            }

            /** 仓库名称（基于目录名） */
            const repo = path.basename(this.workspaceRoot);
            const branch = await this.git.branch();
            const diffSummary = await this.git.diffSummary(['HEAD^', 'HEAD']);

            // 检查是否需要添加AI归属
            /** 是否应该添加AI归属标记 */
            const shouldAddAIAttribution = this.checkAIAttributionFlag();

            const commitData: Commit = {
                commit_time: new Date(latestCommit.date).getTime(),
                commit_hash: latestCommit.hash,
                repo: repo,
                branch: branch.current || 'main',
                committer: latestCommit.author_name,
                is_ai_generated: isAiGenerated || shouldAddAIAttribution,
                code_volume_delta: diffSummary.insertions - diffSummary.deletions,
                code_write_speed_delta: 0,
                notes: shouldAddAIAttribution ? 
                    this.addAIAttributionToMessage(latestCommit.message) : 
                    latestCommit.message
            };

            await insertCommit(commitData);
            console.log('Commit data saved:', commitData.commit_hash);

            // 清理AI归属标记
            if (shouldAddAIAttribution) {
                this.cleanupAIAttributionFlag();
            }
        } catch (error) {
            console.error('Failed to process commit:', error);
        }
    }

    /**
     * 检查AI归属标记文件
     * 
     * 检查Git目录中是否存在AI归属标记文件。
     * 
     * @returns 如果存在标记文件则返回 true
     * @private
     */
    private checkAIAttributionFlag(): boolean {
        const flagPath = path.join(this.workspaceRoot, '.git', 'AI_ATTRIBUTION_REQUESTED');
        return fs.existsSync(flagPath);
    }

    /**
     * 清理AI归属标记文件
     * 
     * 删除AI归属标记文件，用于在提交后清理临时文件。
     * 
     * @private
     */
    private cleanupAIAttributionFlag(): void {
        const flagPath = path.join(this.workspaceRoot, '.git', 'AI_ATTRIBUTION_REQUESTED');
        try {
            if (fs.existsSync(flagPath)) {
                fs.unlinkSync(flagPath);
            }
        } catch (error) {
            console.error('Failed to cleanup AI attribution flag:', error);
        }
    }

    /**
     * 在提交消息中添加AI归属标记
     * 
     * 在原始提交消息中添加AI归属信息。
     * 
     * @param originalMessage - 原始提交消息
     * @returns 添加了AI归属标记的提交消息
     * @private
     */
    private addAIAttributionToMessage(originalMessage: string): string {
        const aiAttribution = `\n\n${this.configService.getAiAttributionString()}`;
        
        if (originalMessage.includes('Co-authored-by:')) {
            return originalMessage;
        }
        
        return originalMessage + aiAttribution;
    }

    /**
     * 获取最新提交信息
     * 
     * 获取最新一次提交的基本信息。
     * 
     * @returns 包含提交哈希、消息和作者的对象，或null
     */
    public async getLatestCommitInfo(): Promise<{ hash: string; message: string; author: string } | null> {
        try {
            const log = await this.git.log({ n: 1 });
            const latestCommit = log.latest;
            
            if (!latestCommit) {
                return null;
            }

            return {
                hash: latestCommit.hash,
                message: latestCommit.message,
                author: latestCommit.author_name
            };
        } catch (error) {
            console.error('Failed to get latest commit info:', error);
            return null;
        }
    }
}