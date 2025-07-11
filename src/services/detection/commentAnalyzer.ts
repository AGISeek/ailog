/**
 * 注释分析器类
 * 
 * 负责分析代码注释的质量和特征。AI生成的代码通常包含
 * 高质量的注释，如JSDoc格式的文档注释和描述性的行内注释。
 * 
 * 注释质量评估基于以下因素：
 * - JSDoc格式的多行注释
 * - 有意义的行内注释
 * - 注释的长度和格式规范
 * 
 * @class CommentAnalyzer
 */
export class CommentAnalyzer {
    /**
     * 分析代码注释的质量
     * 
     * 通过检测JSDoc格式的多行注释和高质量的行内注释来评估
     * 代码注释的质量。AI生成的代码通常具有完整的文档注释。
     * 
     * @param text - 要分析的代码文本
     * @returns 包含得分、JSDoc状态和注释质量状态的对象
     */
    public analyzeCommentQuality(text: string): { score: number; hasJSDoc: boolean; hasQualityComments: boolean } {
        let score = 0;
        let hasJSDoc = false;
        let hasQualityComments = false;
        
        // 检查JSDoc格式的注释
        /** JSDoc格式的多行注释正则表达式 */
        const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
        const jsdocMatches = text.match(jsdocPattern);
        if (jsdocMatches && jsdocMatches.length > 0) {
            score += 15;
            hasJSDoc = true;
        }
        
        // 检查行内注释的质量
        const lines = text.split('\n');
        /** 包含单行注释的行 */
        const commentLines = lines.filter(line => line.trim().startsWith('//'));
        /** 高质量的注释（长度超过10个字符且以大写字母开始） */
        const qualityComments = commentLines.filter(line => {
            const comment = line.trim().substring(2).trim();
            return comment.length > 10 && /^[A-Z]/.test(comment);
        });
        
        if (qualityComments.length > 0) {
            score += 10;
            hasQualityComments = true;
        }
        
        return { score, hasJSDoc, hasQualityComments };
    }

    /**
     * 提取代码中的注释内容
     * 
     * 分别提取JSDoc格式的多行注释和单行注释，
     * 用于进一步的注释内容分析。
     * 
     * @param text - 要提取注释的代码文本
     * @returns 包含JSDoc注释和行内注释数组的对象
     */
    public extractComments(text: string): { jsdoc: string[]; inline: string[] } {
        const jsdocMatches = text.match(/\/\*\*[\s\S]*?\*\//g) || [];
        const inlineMatches = text.match(/\/\/.*$/gm) || [];
        
        return {
            jsdoc: jsdocMatches,
            inline: inlineMatches
        };
    }
}