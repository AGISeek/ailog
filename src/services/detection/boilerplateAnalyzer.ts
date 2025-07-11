/**
 * 样板代码分析器类
 * 
 * 负责检测常见的样板代码模式。AI生成的代码通常包含
 * 完整的样板结构，如React组件、API请求函数、类定义等。
 * 
 * 样板代码检测包括以下类型：
 * - React组件模式
 * - API请求函数模式
 * - 数据结构类模式
 * - Express路由模式
 * - 测试用例模式
 * 
 * @class BoilerplateAnalyzer
 */
export class BoilerplateAnalyzer {
    /**
     * 样板代码模式定义
     * 
     * 包含各种常见的样板代码模式，每个模式都有具体的
     * 名称和正则表达式，用于识别不同类型的样板代码。
     */
    private readonly boilerplatePatterns = [
        {
            name: 'React Component',
            pattern: /import\s+React[\s\S]*?export\s+default\s+\w+/
        },
        {
            name: 'API Request Function',
            pattern: /async\s+function\s+\w+[\s\S]*?try\s*\{[\s\S]*?catch\s*\([^)]*\)\s*\{[\s\S]*?\}/
        },
        {
            name: 'Data Structure Class',
            pattern: /class\s+\w+\s*\{[\s\S]*?constructor\s*\([^)]*\)\s*\{[\s\S]*?\}/
        },
        {
            name: 'Express Route',
            pattern: /app\.(get|post|put|delete)\s*\([^)]*\)\s*,\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}/
        },
        {
            name: 'Test Case',
            pattern: /describe\s*\([^)]*\)\s*,\s*\(\s*\)\s*=>\s*\{[\s\S]*?it\s*\([^)]*\)\s*,[\s\S]*?\}/
        }
    ];

    /**
     * 分析代码中的样板模式
     * 
     * 检查代码是否包含常见的样板代码模式。如果匹配到样板模式，
     * 则返回相应的得分和匹配的模式名称。
     * 
     * @param text - 要分析的代码文本
     * @returns 包含得分和匹配模式名称数组的对象
     */
    public analyzeBoilerplate(text: string): { score: number; matches: string[] } {
        /** 匹配的样板模式名称数组 */
        const matches: string[] = [];
        
        this.boilerplatePatterns.forEach(({ name, pattern }) => {
            if (pattern.test(text)) {
                matches.push(name);
            }
        });

        const score = matches.length > 0 ? 20 : 0;
        return { score, matches };
    }

    /**
     * 检查代码是否包含样板模式
     * 
     * 简单的布尔检查，判断代码是否包含任何样板代码模式。
     * 
     * @param text - 要检查的代码文本
     * @returns 如果包含样板模式则返回 true
     */
    public hasBoilerplatePattern(text: string): boolean {
        return this.boilerplatePatterns.some(({ pattern }) => pattern.test(text));
    }
}