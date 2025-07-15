/**
 * 代码块分析器类
 * 
 * 负责分析代码块的大小和复杂度特征。AI生成的代码通常
 * 具有以下特征：
 * - 较大的代码块大小（超过100个字符）
 * - 相对较高的代码复杂度
 * - 完整的代码结构
 * 
 * @class ChunkAnalyzer
 */
export class ChunkAnalyzer {
    /**
     * 分析代码块的大小并返回得分
     * 
     * 根据代码块的大小分类并评分。较大的代码块通常
     * 表示更完整的功能实现，更可能是AI生成的。
     * 
     * @param text - 要分析的代码文本
     * @returns 包含得分、大小和类别的对象
     */
    public analyzeChunkSize(text: string): { score: number; size: number; category: string } {
        /** 代码块的字符数量 */
        const size = text.length;
        let score = 0;
        let category = '';

        if (size > 500) {
            score = 30;
            category = 'Large code block';
        } else if (size > 200) {
            score = 20;
            category = 'Medium code block';
        } else if (size > 100) {
            score = 10;
            category = 'Small code block';
        } else {
            category = 'Tiny code block';
        }

        return { score, size, category };
    }

    /**
     * 判断是否为大型代码块
     * 
     * 简单的布尔判断，检查代码块大小是否超过指定阈值。
     * 
     * @param text - 要检查的代码文本
     * @param threshold - 大小阈值（默认100个字符）
     * @returns 如果超过阈值则返回 true
     */
    public isLargeChunk(text: string, threshold: number = 100): boolean {
        return text.length > threshold;
    }

    /**
     * 分析代码块的详细特征
     * 
     * 提供代码块的综合分析，包括行数、平均行长度、
     * 长行检查和复杂度评估。
     * 
     * @param text - 要分析的代码文本
     * @returns 包含各种特征指标的对象
     */
    public analyzeChunkCharacteristics(text: string): {
        lineCount: number;
        averageLineLength: number;
        hasLongLines: boolean;
        complexity: 'low' | 'medium' | 'high';
    } {
        const lines = text.split('\n');
        /** 代码总行数 */
        const lineCount = lines.length;
        const totalLength = lines.reduce((sum, line) => sum + line.length, 0);
        /** 平均行长度 */
        const averageLineLength = totalLength / lineCount;
        /** 是否包含超过100个字符的长行 */
        const hasLongLines = lines.some(line => line.length > 100);
        
        // 简单的复杂度评估
        /** 花括号数量（作为代码块复杂度指标） */
        const bracketCount = (text.match(/[{}]/g) || []).length;
        /** 函数定义数量（作为代码块复杂度指标） */
        const functionCount = (text.match(/function|=>/g) || []).length;
        /** 复杂度级别（基于花括号和函数数量） */
        const complexity = bracketCount + functionCount > 10 ? 'high' : 
                          bracketCount + functionCount > 5 ? 'medium' : 'low';

        return {
            lineCount,
            averageLineLength,
            hasLongLines,
            complexity
        };
    }
}