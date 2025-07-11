import * as vscode from 'vscode';
import { AIDetectionResult, DetectionConfig } from '../../types';
import { PatternAnalyzer } from './patternAnalyzer';
import { SyntaxAnalyzer } from './syntaxAnalyzer';
import { BoilerplateAnalyzer } from './boilerplateAnalyzer';
import { CommentAnalyzer } from './commentAnalyzer';
import { ChunkAnalyzer } from './chunkAnalyzer';
import { TimeProximityAnalyzer } from './timeProximityAnalyzer';
import { ConfigService } from '../configService';

/**
 * AI检测服务类
 * 
 * 协调各个分析器进行AI代码检测。这是整个检测系统的核心协调器，
 * 负责整合多个分析器的结果，综合评估代码变更是否由AI生成。
 * 
 * 检测算法包括以下维度：
 * - 代码块大小分析
 * - 语法完整性分析
 * - 样板代码模式分析
 * - 注释质量分析
 * - 时间邻近性分析
 * - 代码模式匹配分析
 * 
 * @class AIDetectionService
 */
export class AIDetectionService {
    /** 代码模式分析器实例 */
    private readonly patternAnalyzer = new PatternAnalyzer();
    /** 语法分析器实例 */
    private readonly syntaxAnalyzer = new SyntaxAnalyzer();
    /** 样板代码分析器实例 */
    private readonly boilerplateAnalyzer = new BoilerplateAnalyzer();
    /** 注释分析器实例 */
    private readonly commentAnalyzer = new CommentAnalyzer();
    /** 代码块分析器实例 */
    private readonly chunkAnalyzer = new ChunkAnalyzer();
    /** 时间邻近性分析器实例 */
    private readonly timeProximityAnalyzer: TimeProximityAnalyzer;

    /** 默认检测配置参数 */
    private readonly defaultConfig: DetectionConfig = {
        confidenceThreshold: 70,
        chunkSizeThreshold: 100,
        timeProximityWindow: 5000,
        enableTimeProximity: true,
        enablePatternMatching: true
    };

    /**
     * 构造函数
     * 
     * 初始化AI检测服务，设置日志路径和检测配置。
     * 
     * @param logPath - 活动日志文件路径
     * @param config - 检测配置参数
     */
    constructor(
        logPath: string,
        private configService: ConfigService,
        private config: DetectionConfig = {} as DetectionConfig
    ) {
        this.config = { ...this.defaultConfig, ...config };
        this.timeProximityAnalyzer = new TimeProximityAnalyzer(logPath);
        
        // 监听配置变更
        this.configService.onDidChangeConfiguration(() => {
            this.updateConfig();
        });
        
        // 初始化配置
        this.updateConfig();
    }

    /**
     * 主要的AI检测方法
     * 
     * 分析文档变更事件，通过综合多个分析器的结果来判断
     * 代码变更是否由AI生成。
     * 
     * @param event - VS Code文档变更事件
     * @returns AI检测结果
     */
    public detectAI(event: vscode.TextDocumentChangeEvent): AIDetectionResult {
        const result: AIDetectionResult = {
            isAiGenerated: false,
            confidence: 0,
            reasons: [],
            metadata: {
                chunkSize: 0,
                patternMatches: 0,
                hasBoilerplate: false,
                hasQualityComments: false,
                timeProximity: 0,
                languageType: event.document.languageId
            }
        };

        /** 综合检测得分 */
        let totalScore = 0;
        /** 检测原因列表 */
        const reasons: string[] = [];

        for (const change of event.contentChanges) {
            if (change.text.length < this.config.chunkSizeThreshold) {
                continue;
            }

            const analysisResult = this.analyzeTextChange(change.text, event.document.uri.fsPath);
            totalScore += analysisResult.score;
            reasons.push(...analysisResult.reasons);
            
            // 更新元数据
            result.metadata.chunkSize = Math.max(result.metadata.chunkSize, change.text.length);
            result.metadata.patternMatches = Math.max(result.metadata.patternMatches, analysisResult.patternMatches);
            result.metadata.hasBoilerplate = result.metadata.hasBoilerplate || analysisResult.hasBoilerplate;
            result.metadata.hasQualityComments = result.metadata.hasQualityComments || analysisResult.hasQualityComments;
            result.metadata.timeProximity = Math.max(result.metadata.timeProximity, analysisResult.timeProximity);
        }

        result.confidence = Math.min(totalScore, 100);
        result.isAiGenerated = result.confidence >= this.config.confidenceThreshold;
        result.reasons = [...new Set(reasons)]; // 去重

        return result;
    }

    /**
     * 分析单个文本变更
     * 
     * 对单个文本变更进行综合分析，使用所有已启用的分析器。
     * 
     * @param text - 文本变更内容
     * @param filePath - 文件路径
     * @returns 包含得分和各项分析结果的对象
     * @private
     */
    private analyzeTextChange(text: string, filePath: string): {
        score: number;
        reasons: string[];
        patternMatches: number;
        hasBoilerplate: boolean;
        hasQualityComments: boolean;
        timeProximity: number;
    } {
        /** 单个文本变更的综合得分 */
        let score = 0;
        /** 单个文本变更的检测原因列表 */
        const reasons: string[] = [];

        // 1. 代码块大小分析
        const chunkAnalysis = this.chunkAnalyzer.analyzeChunkSize(text);
        score += chunkAnalysis.score;
        if (chunkAnalysis.score > 0) {
            reasons.push(`${chunkAnalysis.category} (${chunkAnalysis.size} characters)`);
        }

        // 2. 语法完整性分析
        /** 编程语言类型 */
        const languageType = this.syntaxAnalyzer.getLanguageFromExtension(filePath);
        const syntaxScore = this.syntaxAnalyzer.analyzeSyntacticCompleteness(text, languageType);
        score += syntaxScore;
        if (syntaxScore > 0) {
            reasons.push('Syntactic structure complete');
        }

        // 3. 样板代码分析
        const boilerplateAnalysis = this.boilerplateAnalyzer.analyzeBoilerplate(text);
        score += boilerplateAnalysis.score;
        /** 是否包含样板代码模式 */
        const hasBoilerplate = boilerplateAnalysis.score > 0;
        if (hasBoilerplate) {
            reasons.push(`Boilerplate patterns: ${boilerplateAnalysis.matches.join(', ')}`);
        }

        // 4. 注释质量分析
        const commentAnalysis = this.commentAnalyzer.analyzeCommentQuality(text);
        score += commentAnalysis.score;
        /** 是否包含高质量注释 */
        const hasQualityComments = commentAnalysis.score > 0;
        if (hasQualityComments) {
            reasons.push('High quality comments');
        }

        // 5. 时间邻近性分析
        /** 时间邻近性得分 */
        let timeProximity = 0;
        if (this.config.enableTimeProximity) {
            const timeAnalysis = this.timeProximityAnalyzer.analyzeTimeProximity(filePath);
            score += timeAnalysis.score;
            timeProximity = timeAnalysis.score;
            if (timeAnalysis.score > 0) {
                reasons.push(`Time proximity match (${timeAnalysis.matchedActivity?.command})`);
            }
        }

        // 6. 模式匹配分析
        /** 模式匹配得分 */
        let patternMatches = 0;
        if (this.config.enablePatternMatching) {
            const patternScore = this.patternAnalyzer.analyzePatterns(text);
            score += patternScore;
            patternMatches = patternScore;
            if (patternScore > 0) {
                const matchedPatterns = this.patternAnalyzer.getMatchedPatterns(text);
                reasons.push(`Pattern matches: ${matchedPatterns.join(', ')}`);
            }
        }

        return {
            score,
            reasons,
            patternMatches,
            hasBoilerplate,
            hasQualityComments,
            timeProximity
        };
    }

    /**
     * 记录AI活动
     * 
     * 记录AI命令的执行活动，用于时间邻近性分析。
     * 
     * @param file - 受影响的文件路径
     * @param command - 执行的AI命令
     */
    public recordActivity(file: string, command: string): void {
        this.timeProximityAnalyzer.recordActivity(file, command);
    }

    /**
     * 清理过期的活动记录
     * 
     * 定期清理过期的活动日志，保持日志文件的合理大小。
     */
    public cleanupOldActivities(): void {
        this.timeProximityAnalyzer.cleanupOldActivities();
    }

    /**
     * 更新检测配置
     * 
     * 从配置服务获取最新的检测配置并更新内部配置。
     * 
     * @private
     */
    private updateConfig(): void {
        const newConfig = this.configService.getDetectionConfig();
        this.config = { ...this.defaultConfig, ...newConfig };
    }
}