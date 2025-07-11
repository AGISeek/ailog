import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { t } from '../../i18n';

/**
 * Git钩子服务类
 * 
 * 负责管理Git钩子的安装和配置。自动在项目的Git仓库中
 * 安装必要的钩子脚本，实现提交前检查和提交后处理。
 * 
 * 支持的Git钩子：
 * - pre-commit: 提交前的AI检查和用户确认
 * - post-commit: 提交后的数据收集和存储
 * 
 * @class GitHookService
 */
export class GitHookService {
    /** Git目录路径 */
    private gitDir: string;
    /** Git钩子目录路径 */
    private hooksDir: string;

    /**
     * 构造函数
     * 
     * 初始化Git钩子服务，设置相关目录路径。
     * 
     * @param workspaceRoot - 工作区根目录路径
     */
    constructor(workspaceRoot: string) {
        this.gitDir = path.join(workspaceRoot, '.git');
        this.hooksDir = path.join(this.gitDir, 'hooks');
    }

    /**
     * 安装Git钩子
     * 
     * 安装pre-commit和post-commit钩子到当前仓库。
     * 包括验证仓库、创建目录和编写钩子脚本。
     */
    public installGitHooks(): void {
        if (!this.validateGitRepository()) {
            return;
        }

        this.ensureHooksDirectory();
        this.installPreCommitHook();
        this.installPostCommitHook();
        
        vscode.window.showInformationMessage(t('messages.hookInstalled'));
    }

    /**
     * 验证Git仓库的有效性
     * 
     * 检查当前目录是否为有效的Git仓库。
     * 
     * @returns 如果是有效的Git仓库则返回 true
     * @private
     */
    private validateGitRepository(): boolean {
        if (!fs.existsSync(this.gitDir)) {
            vscode.window.showErrorMessage(t('messages.notGitRepo'));
            return false;
        }
        return true;
    }

    /**
     * 确保钩子目录存在
     * 
     * 如果钩子目录不存在则创建它。
     * 
     * @private
     */
    private ensureHooksDirectory(): void {
        if (!fs.existsSync(this.hooksDir)) {
            fs.mkdirSync(this.hooksDir, { recursive: true });
        }
    }

    /**
     * 安装pre-commit钩子
     * 
     * 创建并安装pre-commit钩子脚本，用于提交前的AI检查。
     * 
     * @private
     */
    private installPreCommitHook(): void {
        const preCommitHookPath = path.join(this.hooksDir, 'pre-commit');
        const preCommitScript = this.createPreCommitScript();
        
        fs.writeFileSync(preCommitHookPath, preCommitScript, { mode: 0o755 });
    }

    /**
     * 安装post-commit钩子
     * 
     * 创建并安装post-commit钩子脚本，用于提交后的数据处理。
     * 
     * @private
     */
    private installPostCommitHook(): void {
        const postCommitHookPath = path.join(this.hooksDir, 'post-commit');
        const postCommitScript = this.createPostCommitScript();
        
        fs.writeFileSync(postCommitHookPath, postCommitScript, { mode: 0o755 });
    }

    /**
     * 创建pre-commit钩子脚本内容
     * 
     * 生成pre-commit钩子的shell脚本内容，包括环境检查和命令执行。
     * 
     * @returns pre-commit钩子脚本内容
     * @private
     */
    private createPreCommitScript(): string {
        return `#!/bin/sh
# AIlog Interactive Pre-commit Hook

# 检查是否是VS Code环境
if command -v code >/dev/null 2>&1; then
    # 使用VS Code执行AI检测命令
    exec code --command ailog.interactiveCommitCheck
else
    # 后备方案：使用Node.js脚本
    node_script_path="$(dirname "$0")/../../src/lib/commitHookScript.js"
    if [ -f "$node_script_path" ]; then
        node "$node_script_path"
    else
        echo "Warning: AI attribution check unavailable"
        exit 0
    fi
fi
`;
    }

    /**
     * 创建post-commit钩子脚本内容
     * 
     * 生成post-commit钩子的shell脚本内容，用于提交后的数据处理。
     * 
     * @returns post-commit钩子脚本内容
     * @private
     */
    private createPostCommitScript(): string {
        return `#!/bin/sh
# AIlog Post-commit Hook
exec code --command ailog.processCommit
`;
    }

    /**
     * 检查钩子安装状态
     * 
     * 检查pre-commit和post-commit钩子是否已安装。
     * 
     * @returns 包含两个钩子安装状态的对象
     */
    public checkHookStatus(): { preCommit: boolean; postCommit: boolean } {
        const preCommitPath = path.join(this.hooksDir, 'pre-commit');
        const postCommitPath = path.join(this.hooksDir, 'post-commit');
        
        return {
            preCommit: fs.existsSync(preCommitPath),
            postCommit: fs.existsSync(postCommitPath)
        };
    }
}