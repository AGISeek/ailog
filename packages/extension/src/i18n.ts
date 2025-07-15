import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 用于存储当前语言翻译的键值对对象。
 * @type {{ [key: string]: string }}
 */
let translations: { [key: string]: string };

/**
 * 初始化国际化模块。
 * 它会检测 VS Code 的当前语言，加载相应的翻译文件。
 * 如果是中文环境，则加载 'zh-cn.json'，否则默认加载 'en.json'。
 * @param {vscode.ExtensionContext} context - VS Code 插件的上下文。
 */
export function initialize(context: vscode.ExtensionContext) {
    const lang = vscode.env.language;
    const targetLang = lang.toLowerCase().startsWith('zh') ? 'zh-cn' : 'en';
    const filePath = path.join(context.extensionPath, 'l10n', `${targetLang}.json`);

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        translations = JSON.parse(fileContent);
    } catch (e) {
        // 如果目标语言文件加载失败（例如文件不存在或损坏），则回退到英文
        const fallbackPath = path.join(context.extensionPath, 'l10n', 'en.json');
        const fileContent = fs.readFileSync(fallbackPath, 'utf8');
        translations = JSON.parse(fileContent);
    }
}

/**
 * 根据给定的键获取翻译后的字符串。
 * 支持使用 {0}, {1} 等占位符进行参数替换。
 * @param {string} key - 需要翻译的键。
 * @param {...any[]} args - 用于替换占位符的可变参数。
 * @returns {string} - 翻译后的字符串。如果找不到对应的键，则返回原始的键。
 */
export function t(key: string, ...args: any[]): string {
    const message = translations[key] || key;
    if (args && args.length > 0) {
        return message.replace(/\{(\d+)\}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }
    return message;
}
