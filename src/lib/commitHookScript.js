#!/usr/bin/env node

/**
 * AIlog Git Commit Hook Script
 * 独立的Node.js脚本，用于在Git提交时进行AI检测
 * 
 * 这个脚本作为VS Code命令的后备方案，当VS Code不可用时使用
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// 工作目录
const workDir = process.cwd();
const gitDir = path.join(workDir, '.git');
const aiActivityLogPath = path.join(gitDir, 'ai_activity.log');
const aiAttributionFlagPath = path.join(gitDir, 'AI_ATTRIBUTION_REQUESTED');

/**
 * 分析staged的文件变更
 */
function analyzeStagedChanges() {
    try {
        // 获取staged的文件
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
            .trim()
            .split('\n')
            .filter(file => file.trim());

        if (stagedFiles.length === 0) {
            console.log('没有staged的文件');
            return { hasAiContent: false, details: [] };
        }

        let hasAiContent = false;
        const details = [];

        // 分析每个文件
        for (const file of stagedFiles) {
            const analysisResult = analyzeFile(file);
            if (analysisResult.isAiGenerated) {
                hasAiContent = true;
                details.push({
                    file: file,
                    confidence: analysisResult.confidence,
                    reasons: analysisResult.reasons
                });
            }
        }

        return { hasAiContent, details };
    } catch (error) {
        console.error('分析staged文件失败:', error.message);
        return { hasAiContent: false, details: [] };
    }
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
    try {
        // 获取文件diff
        const diff = execSync(`git diff --cached -- "${filePath}"`, { encoding: 'utf8' });
        
        if (!diff || diff.length === 0) {
            return { isAiGenerated: false, confidence: 0, reasons: [] };
        }

        // 提取添加的行
        const addedLines = diff.split('\n')
            .filter(line => line.startsWith('+') && !line.startsWith('+++'))
            .map(line => line.substring(1));

        if (addedLines.length === 0) {
            return { isAiGenerated: false, confidence: 0, reasons: [] };
        }

        const addedText = addedLines.join('\n');
        
        // 执行AI检测
        return detectAIInText(addedText, filePath);
    } catch (error) {
        console.error(`分析文件 ${filePath} 失败:`, error.message);
        return { isAiGenerated: false, confidence: 0, reasons: [] };
    }
}

/**
 * 检测文本中的AI生成代码
 */
function detectAIInText(text, filePath) {
    let score = 0;
    const reasons = [];

    // 1. 代码块大小
    const textLength = text.length;
    if (textLength > 500) {
        score += 30;
        reasons.push(`大块代码添加 (${textLength} 字符)`);
    } else if (textLength > 200) {
        score += 20;
        reasons.push(`中等代码块 (${textLength} 字符)`);
    } else if (textLength > 100) {
        score += 10;
        reasons.push(`较小代码块 (${textLength} 字符)`);
    }

    // 2. 语法完整性
    if (hasCompleteStructures(text, getLanguageFromPath(filePath))) {
        score += 25;
        reasons.push('语法结构完整');
    }

    // 3. 样板代码模式
    if (hasBoilerplatePatterns(text)) {
        score += 20;
        reasons.push('包含样板代码模式');
    }

    // 4. 注释质量
    if (hasHighQualityComments(text)) {
        score += 15;
        reasons.push('包含高质量注释');
    }

    // 5. 时间邻近性
    const timeScore = checkTimeProximity(filePath);
    if (timeScore > 0) {
        score += timeScore;
        reasons.push('时间邻近性匹配');
    }

    // 6. 经典AI模式
    const patternScore = checkAIPatterns(text);
    if (patternScore > 0) {
        score += patternScore;
        reasons.push('匹配AI生成模式');
    }

    const confidence = Math.min(score, 100);
    const isAiGenerated = confidence >= 70;

    return { isAiGenerated, confidence, reasons };
}

/**
 * 检查完整的语法结构
 */
function hasCompleteStructures(text, language) {
    const patterns = {
        javascript: [
            /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\}/,
            /class\s+\w+\s*\{[\s\S]*\}/,
            /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*\}/,
        ],
        typescript: [
            /function\s+\w+\s*\([^)]*\)\s*:\s*\w+\s*\{[\s\S]*\}/,
            /interface\s+\w+\s*\{[\s\S]*\}/,
            /type\s+\w+\s*=[\s\S]*;/,
        ],
        python: [
            /def\s+\w+\s*\([^)]*\)\s*:\s*[\s\S]*/,
            /class\s+\w+\s*\([^)]*\)\s*:\s*[\s\S]*/,
        ]
    };

    const langPatterns = patterns[language] || [];
    return langPatterns.some(pattern => pattern.test(text));
}

/**
 * 检查样板代码模式
 */
function hasBoilerplatePatterns(text) {
    const patterns = [
        /import\s+React[\s\S]*?export\s+default\s+\w+/,
        /async\s+function\s+\w+[\s\S]*?try\s*\{[\s\S]*?catch\s*\([^)]*\)\s*\{[\s\S]*?\}/,
        /class\s+\w+\s*\{[\s\S]*?constructor\s*\([^)]*\)\s*\{[\s\S]*?\}/,
    ];

    return patterns.some(pattern => pattern.test(text));
}

/**
 * 检查高质量注释
 */
function hasHighQualityComments(text) {
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//;
    return jsdocPattern.test(text);
}

/**
 * 检查时间邻近性
 */
function checkTimeProximity(filePath) {
    try {
        if (!fs.existsSync(aiActivityLogPath)) {
            return 0;
        }

        const logData = fs.readFileSync(aiActivityLogPath, 'utf8');
        const activities = logData.split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));

        const now = Date.now();
        const recentActivity = activities.find(activity => 
            activity.file === filePath && 
            (now - activity.timestamp) < 300000 // 5分钟内
        );

        return recentActivity ? 40 : 0;
    } catch (error) {
        return 0;
    }
}

/**
 * 检查AI模式
 */
function checkAIPatterns(text) {
    const patterns = [
        /\/\*\*[\s\S]*?\*\//g,
        /function\s+\w+\s*\(/g,
        /const\s+\w+\s*=/g,
        /import\s+.*from/g,
        /interface\s+\w+\s*\{/g,
        /type\s+\w+\s*=/g,
        /export\s+(default\s+)?/g
    ];

    let matches = 0;
    patterns.forEach(pattern => {
        if (pattern.test(text)) matches++;
    });

    if (matches >= 4) return 25;
    if (matches >= 3) return 20;
    if (matches >= 2) return 15;
    return 0;
}

/**
 * 从文件路径获取语言类型
 */
function getLanguageFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
    };

    return languageMap[ext] || 'plaintext';
}

/**
 * 交互式询问用户
 */
function askUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase().trim());
        });
    });
}

/**
 * 主函数
 */
async function main() {
    console.log('=== AIlog Git Commit Hook ===');
    
    // 检查是否已经设置了AI归属标记
    if (fs.existsSync(aiAttributionFlagPath)) {
        console.log('AI归属标记已设置，跳过检测');
        fs.unlinkSync(aiAttributionFlagPath); // 清除标记
        return;
    }

    const analysis = analyzeStagedChanges();
    
    if (!analysis.hasAiContent) {
        console.log('未检测到AI生成的代码');
        return;
    }

    console.log('\n=== AI代码检测报告 ===');
    analysis.details.forEach((detail, index) => {
        console.log(`\n文件 ${index + 1}: ${detail.file}`);
        console.log(`置信度: ${detail.confidence}%`);
        console.log(`检测原因: ${detail.reasons.join(', ')}`);
    });

    console.log('\n=== 建议操作 ===');
    console.log('建议在提交消息中添加AI归属信息');
    console.log('例如: Co-authored-by: Cursor AI <cursor-ai@company.com>');

    const answer = await askUser('\n是否添加AI归属信息? (y/n): ');
    
    if (answer === 'y' || answer === 'yes') {
        // 创建标记文件，供post-commit钩子使用
        fs.writeFileSync(aiAttributionFlagPath, new Date().toISOString());
        console.log('AI归属标记已设置');
    } else {
        console.log('已跳过AI归属标记');
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('脚本执行失败:', error);
        process.exit(1);
    });
}