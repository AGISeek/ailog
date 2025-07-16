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
                    vscode.Uri.joinPath(context.extensionUri, 'dashboard-dist'),
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
            case 'getCommits': {
                const repo = message.repo || undefined;
                const branch = message.branch || undefined;
                const commits = await getCommits(repo, branch);
                panel.webview.postMessage({ command: 'loadCommits', commits });
                break;
            }
                
            case 'getRepos': {
                const repos = await getUniqueRepos();
                panel.webview.postMessage({ command: 'loadRepos', repos });
                break;
            }
                
            case 'getBranches': {
                const selectedRepo = message.repo || undefined;
                const branches = await getUniqueBranches(selectedRepo);
                panel.webview.postMessage({ command: 'loadBranches', branches });
                break;
            }
        }
    }

    /**
     * 生成网页视图的HTML内容
     * 
     * 读取React构建产物的HTML文件，并处理资源路径。
     * React应用将自动处理国际化和主题适配。
     * 
     * @param context - VS Code扩展上下文
     * @param webview - 网页视图实例
     * @returns 处理后的HTML内容字符串
     * @private
     */
    private getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
        // 指向React构建产物
        const reactBuildPath = vscode.Uri.joinPath(context.extensionUri, 'dashboard-dist');
        const htmlPath = vscode.Uri.joinPath(reactBuildPath, 'index.html');
        
        // 检查React构建产物是否存在
        if (!fs.existsSync(htmlPath.fsPath)) {
            // 如果React应用未构建，返回提示信息
            return this.getFallbackContent();
        }

        let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        // 将相对路径转换为Webview可用的URI
        const resourceRoot = webview.asWebviewUri(reactBuildPath);
        
        // 替换HTML中的资源路径
        htmlContent = htmlContent.replace(
            /(href|src)=(["'])\.\/([^"']*)\2/g,
            `$1=$2${resourceRoot}/$3$2`
        );

        return htmlContent;
    }

    /**
     * 生成降级内容（当React应用未构建时）
     * 
     * @returns 降级HTML内容
     * @private
     */
    private getFallbackContent(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t('dashboard.title')}</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family, sans-serif);
                        padding: 40px;
                        text-align: center;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 40px;
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 8px;
                        background-color: var(--vscode-editor-widget-background);
                    }
                    .title {
                        font-size: 24px;
                        margin-bottom: 20px;
                        color: var(--vscode-foreground);
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                        color: var(--vscode-descriptionForeground);
                    }
                    .command {
                        background-color: var(--vscode-textBlockQuote-background);
                        padding: 10px;
                        border-radius: 4px;
                        font-family: monospace;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="title">${t('dashboard.title')}</h1>
                    <div class="message">
                        <p>React仪表盘尚未构建。请执行以下命令来构建React应用：</p>
                        <div class="command">cd src/dashboard-react && npm install && npm run build</div>
                        <p>构建完成后，重新打开仪表盘即可看到全新的React界面。</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}