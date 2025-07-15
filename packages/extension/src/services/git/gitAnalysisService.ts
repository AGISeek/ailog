import simpleGit, { SimpleGit } from 'simple-git';
import { CommitInfo, AIDetectionResult } from '../../types';
import { SyntaxAnalyzer } from '../detection/syntaxAnalyzer';
import { ChunkAnalyzer } from '../detection/chunkAnalyzer';
import { BoilerplateAnalyzer } from '../detection/boilerplateAnalyzer';
import { CommentAnalyzer } from '../detection/commentAnalyzer';
import { PatternAnalyzer } from '../detection/patternAnalyzer';
import { TimeProximityAnalyzer } from '../detection/timeProximityAnalyzer';

/**
 * Git分析服务 - 负责分析Git提交中的代码变更
 */
export class GitAnalysisService {
    private git: SimpleGit;
    private syntaxAnalyzer = new SyntaxAnalyzer();
    private chunkAnalyzer = new ChunkAnalyzer();
    private boilerplateAnalyzer = new BoilerplateAnalyzer();
    private commentAnalyzer = new CommentAnalyzer();
    private patternAnalyzer = new PatternAnalyzer();
    private timeProximityAnalyzer: TimeProximityAnalyzer;

    constructor(workspaceRoot: string, logPath: string) {
        this.git = simpleGit(workspaceRoot);
        this.timeProximityAnalyzer = new TimeProximityAnalyzer(logPath);
    }

    public async analyzeCommitChanges(): Promise<CommitInfo> {
        try {
            const status = await this.git.status();
            const stagedFiles = status.staged;
            
            if (stagedFiles.length === 0) {
                return {
                    files: [],
                    message: '',
                    hasAiContent: false,
                    aiDetectionResults: []
                };
            }

            const aiDetectionResults: AIDetectionResult[] = [];
            let hasAiContent = false;

            for (const file of stagedFiles) {
                const diffResult = await this.analyzeStagedFile(file);
                if (diffResult) {
                    aiDetectionResults.push(diffResult);
                    if (diffResult.isAiGenerated) {
                        hasAiContent = true;
                    }
                }
            }

            return {
                files: stagedFiles,
                message: '',
                hasAiContent,
                aiDetectionResults
            };
        } catch (error) {
            console.error('Failed to analyze commit changes:', error);
            return {
                files: [],
                message: '',
                hasAiContent: false,
                aiDetectionResults: []
            };
        }
    }

    private async analyzeStagedFile(filePath: string): Promise<AIDetectionResult | null> {
        try {
            const diff = await this.git.diff(['--cached', filePath]);
            
            if (!diff || diff.length === 0) {
                return null;
            }

            const addedLines = this.extractAddedLines(diff);
            if (addedLines.length === 0) {
                return null;
            }

            const addedText = addedLines.join('\n');
            return this.detectAIInText(addedText, filePath);
        } catch (error) {
            console.error(`Failed to analyze staged file ${filePath}:`, error);
            return null;
        }
    }

    private extractAddedLines(diff: string): string[] {
        const lines = diff.split('\n');
        const addedLines: string[] = [];
        
        for (const line of lines) {
            if (line.startsWith('+') && !line.startsWith('+++')) {
                addedLines.push(line.substring(1));
            }
        }
        
        return addedLines;
    }

    private detectAIInText(text: string, filePath: string): AIDetectionResult {
        const result: AIDetectionResult = {
            isAiGenerated: false,
            confidence: 0,
            reasons: [],
            metadata: {
                chunkSize: text.length,
                patternMatches: 0,
                hasBoilerplate: false,
                hasQualityComments: false,
                timeProximity: 0,
                languageType: this.syntaxAnalyzer.getLanguageFromExtension(filePath)
            }
        };

        let totalScore = 0;
        const reasons: string[] = [];

        // 1. 代码块大小分析
        const chunkAnalysis = this.chunkAnalyzer.analyzeChunkSize(text);
        totalScore += chunkAnalysis.score;
        if (chunkAnalysis.score > 0) {
            reasons.push(`${chunkAnalysis.category} (${chunkAnalysis.size} characters)`);
        }

        // 2. 语法完整性分析
        const syntaxScore = this.syntaxAnalyzer.analyzeSyntacticCompleteness(text, result.metadata.languageType);
        totalScore += syntaxScore;
        if (syntaxScore > 0) {
            reasons.push('Syntactic structure complete');
        }

        // 3. 样板代码分析
        const boilerplateAnalysis = this.boilerplateAnalyzer.analyzeBoilerplate(text);
        totalScore += boilerplateAnalysis.score;
        result.metadata.hasBoilerplate = boilerplateAnalysis.score > 0;
        if (boilerplateAnalysis.score > 0) {
            reasons.push(`Boilerplate patterns: ${boilerplateAnalysis.matches.join(', ')}`);
        }

        // 4. 注释质量分析
        const commentAnalysis = this.commentAnalyzer.analyzeCommentQuality(text);
        totalScore += commentAnalysis.score;
        result.metadata.hasQualityComments = commentAnalysis.score > 0;
        if (commentAnalysis.score > 0) {
            reasons.push('High quality comments');
        }

        // 5. 时间邻近性分析
        const timeAnalysis = this.timeProximityAnalyzer.analyzeTimeProximity(filePath);
        totalScore += timeAnalysis.score;
        result.metadata.timeProximity = timeAnalysis.score;
        if (timeAnalysis.score > 0) {
            reasons.push(`Time proximity match (${timeAnalysis.matchedActivity?.command})`);
        }

        // 6. 模式匹配分析
        const patternScore = this.patternAnalyzer.analyzePatterns(text);
        totalScore += patternScore;
        result.metadata.patternMatches = patternScore;
        if (patternScore > 0) {
            const matchedPatterns = this.patternAnalyzer.getMatchedPatterns(text);
            reasons.push(`Pattern matches: ${matchedPatterns.join(', ')}`);
        }

        result.confidence = Math.min(totalScore, 100);
        result.isAiGenerated = result.confidence >= 70;
        result.reasons = reasons;

        return result;
    }
}