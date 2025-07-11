import * as vscode from 'vscode';
import * as fs from 'fs';
import { getCommits, getUniqueRepos, getUniqueBranches } from '../../database';
import { t } from '../../i18n';

/**
 * 仪表板服务类
 * 
 * 负责管理仪表板的创建和数据交互。提供数据可视化界面，
 * 允许用户查看和分析提交的AI数据统计。
 * 
 * 仪表板功能包括：
 * - 显示提交的AI数据统计和图表
 * - 按仓库和分支过滤数据
 * - 实时数据加载和更新
 * - 国际化支持
 * 
 * @class DashboardService
 */
export class DashboardService {
    /**
     * 创建仪表板面板
     * 
     * 创建一个新的仪表板网页视图面板，并设置相关的消息处理程序。
     * 
     * @param context - VS Code扩展上下文
     * @returns 创建的网页视图面板实例
     */
    public createDashboardPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
        const panel = vscode.window.createWebviewPanel(
            'commitDashboard',
            t('dashboard.title'),
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'src'),
                    vscode.Uri.joinPath(context.extensionUri, 'node_modules'),
                    vscode.Uri.joinPath(context.extensionUri, 'l10n')
                ]
            }
        );

        panel.webview.html = this.getWebviewContent(context, panel.webview);

        // 处理来自 Webview 的消息
        panel.webview.onDidReceiveMessage(async message => {
            await this.handleWebviewMessage(panel, message);
        });

        return panel;
    }

    /**
     * 处理来自网页视图的消息
     * 
     * 处理仪表板网页视图发送的各种消息，包括数据请求和过滤操作。
     * 
     * @param panel - 网页视图面板实例
     * @param message - 来自网页视图的消息对象
     * @private
     */
    private async handleWebviewMessage(
        panel: vscode.WebviewPanel, 
        message: any
    ): Promise<void> {
        switch (message.command) {
            case 'getCommits':
                const repo = message.repo || undefined;
                const branch = message.branch || undefined;
                const commits = await getCommits(repo, branch);
                panel.webview.postMessage({ command: 'loadCommits', commits });
                break;
                
            case 'getRepos':
                const repos = await getUniqueRepos();
                panel.webview.postMessage({ command: 'loadRepos', repos });
                break;
                
            case 'getBranches':
                const selectedRepo = message.repo || undefined;
                const branches = await getUniqueBranches(selectedRepo);
                panel.webview.postMessage({ command: 'loadBranches', branches });
                break;
        }
    }

    /**
     * 生成网页视图的HTML内容
     * 
     * 读取仪表板HTML模板文件，并替换其中的占位符。
     * 处理国际化文本和资源路径的转换。
     * 
     * @param context - VS Code扩展上下文
     * @param webview - 网页视图实例
     * @returns 处理后的HTML内容字符串
     * @private
     */
    private getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
        const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'src', 'dashboard.html');
        let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        // 将 chart.js 的本地文件路径转换为 Webview 可用的 URI
        const chartjsUri = webview.asWebviewUri(vscode.Uri.joinPath(
            context.extensionUri, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'
        ));

        // 替换 HTML 中的所有 {{key}} 占位符
        htmlContent = htmlContent.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const aKey = key.trim();
            if (aKey === 'chartjsUri') {
                return chartjsUri.toString();
            }
            return t(aKey);
        });

        return htmlContent;
    }
}