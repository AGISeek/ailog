/**
 * 模式分析器类
 * 
 * 负责分析代码中的AI生成模式，通过识别常见的代码模式来判断
 * 代码是否可能由AI生成。AI生成的代码通常包含特定的模式组合。
 * 
 * @class PatternAnalyzer
 */
export class PatternAnalyzer {
    /**
     * AI生成代码的常见模式正则表达式数组
     * 
     * 这些模式是基于对AI生成代码的观察总结出来的，
     * 包括注释、函数定义、导入导出等常见结构。
     */
    private readonly aiPatterns = [
        /\/\*\*[\s\S]*?\*\//g, // 多行注释（JSDoc格式）
        /\/\/.*$/gm, // 单行注释
        /function\s+\w+\s*\(/g, // 函数定义
        /const\s+\w+\s*=/g, // 常量定义
        /import\s+.*from/g, // 导入语句
        /interface\s+\w+\s*\{/g, // 接口定义
        /type\s+\w+\s*=/g, // 类型定义
        /export\s+(default\s+)?/g // 导出语句
    ];

    /**
     * 分析文本中的AI模式并返回得分
     * 
     * 通过匹配预定义的模式来评估文本可能是AI生成的概率。
     * 匹配的模式越多，得分越高。
     * 
     * @param text - 要分析的代码文本
     * @returns 基于模式匹配的得分 (0-25)
     */
    public analyzePatterns(text: string): number {
        let matches = 0;
        
        // 统计匹配的模式数量
        this.aiPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                matches++;
            }
        });

        // 根据匹配数量返回相应得分
        if (matches >= 4) return 25;
        if (matches >= 3) return 20;
        if (matches >= 2) return 15;
        return 0;
    }

    /**
     * 获取匹配的模式名称列表
     * 
     * 返回人类可读的模式名称，用于生成检测报告。
     * 
     * @param text - 要分析的代码文本
     * @returns 匹配的模式名称数组
     */
    public getMatchedPatterns(text: string): string[] {
        const matched: string[] = [];
        
        // 逐个检查模式并记录匹配的名称
        if (/\/\*\*[\s\S]*?\*\//g.test(text)) matched.push('Multi-line comments');
        if (/\/\/.*$/gm.test(text)) matched.push('Single-line comments');
        if (/function\s+\w+\s*\(/g.test(text)) matched.push('Function definitions');
        if (/const\s+\w+\s*=/g.test(text)) matched.push('Constant definitions');
        if (/import\s+.*from/g.test(text)) matched.push('Import statements');
        if (/interface\s+\w+\s*\{/g.test(text)) matched.push('Interface definitions');
        if (/type\s+\w+\s*=/g.test(text)) matched.push('Type definitions');
        if (/export\s+(default\s+)?/g.test(text)) matched.push('Export statements');

        return matched;
    }
}