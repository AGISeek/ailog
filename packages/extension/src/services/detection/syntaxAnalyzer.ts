/**
 * 语法分析器类
 * 
 * 负责分析代码的语法完整性。AI生成的代码通常具有完整的语法结构，
 * 而人类编写的代码在提交时可能包含不完整的结构。
 * 
 * @class SyntaxAnalyzer
 */
export class SyntaxAnalyzer {
    /**
     * 不同编程语言的语法完整性检测模式
     * 
     * 每种语言都有其特定的完整结构模式，如完整的函数定义、类定义等。
     * 这些模式用于检测代码是否包含完整的语法结构。
     */
    private readonly languagePatterns = {
        /** JavaScript 语言的完整结构模式 */
        javascript: [
            /^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\}$/m, // 完整函数定义
            /^class\s+\w+\s*\{[\s\S]*\}$/m, // 完整类定义
            /^const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*\}$/m, // 箭头函数
            /^export\s+(default\s+)?[^;]+;?$/m // 导出语句
        ],
        /** TypeScript 语言的完整结构模式 */
        typescript: [
            /^function\s+\w+\s*\([^)]*\)\s*:\s*\w+\s*\{[\s\S]*\}$/m, // 带类型的函数
            /^interface\s+\w+\s*\{[\s\S]*\}$/m, // 接口定义
            /^type\s+\w+\s*=[\s\S]*;$/m, // 类型定义
            /^class\s+\w+\s*\{[\s\S]*\}$/m // 类定义
        ],
        /** Python 语言的完整结构模式 */
        python: [
            /^def\s+\w+\s*\([^)]*\)\s*:\s*[\s\S]*$/m, // 函数定义
            /^class\s+\w+\s*\([^)]*\)\s*:\s*[\s\S]*$/m, // 类定义
            /^import\s+[\w\s,]+$/m, // 导入语句
            /^from\s+[\w.]+\s+import\s+[\w\s,]+$/m // from-import语句
        ]
    };

    /**
     * 分析代码的语法完整性并返回得分
     * 
     * 检测代码是否包含完整的语法结构。AI生成的代码通常
     * 具有完整的语法结构，而人类编写的代码可能包含片段。
     * 
     * @param text - 要分析的代码文本
     * @param languageId - 编程语言标识符
     * @returns 语法完整性得分 (0 或 25)
     */
    public analyzeSyntacticCompleteness(text: string, languageId: string): number {
        const patterns = this.languagePatterns[languageId as keyof typeof this.languagePatterns] || [];
        const matches = patterns.filter(pattern => pattern.test(text)).length;
        
        return matches > 0 ? 25 : 0;
    }

    /**
     * 检查代码是否包含完整的语法结构
     * 
     * 简单的布尔检查，用于快速判断代码是否包含完整结构。
     * 
     * @param text - 要检查的代码文本
     * @param language - 编程语言类型
     * @returns 如果包含完整结构则返回 true
     */
    public hasCompleteStructures(text: string, language: string): boolean {
        const patterns = this.languagePatterns[language as keyof typeof this.languagePatterns] || [];
        return patterns.some(pattern => pattern.test(text));
    }

    /**
     * 根据文件扩展名推断编程语言类型
     * 
     * 通过分析文件扩展名来确定编程语言类型，
     * 用于选择合适的语法分析模式。
     * 
     * @param filePath - 文件路径
     * @returns 编程语言类型字符串
     */
    public getLanguageFromExtension(filePath: string): string {
        const ext = filePath.split('.').pop()?.toLowerCase();
        
        /** 文件扩展名到语言类型的映射表 */
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
            'cs': 'csharp',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'rb': 'ruby',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala'
        };

        return languageMap[ext || ''] || 'plaintext';
    }
}