# Watch Cursor - AI 代码归因助手

本 VS Code 插件旨在帮助您追踪由 Cursor AI 生成的代码，并遵循“人在环”（Human-in-the-loop）原则，在您提交 Git Commit 时对这些代码进行归因。

## 工作原理

本解决方案包含两个核心部分：

1.  **VS Code 插件**:
    -   它在后台静默运行，监听您在编辑器中的文本修改。
    -   通过启发式算法（例如代码插入的速度和规模）来检测可能由 Cursor AI 完成的操作。
    -   当检测到高置信度的 AI 修改时，它会将【文件路径】和【时间戳】记录到一个位于项目根目录下的临时日志文件 `.git/ai_activity.log` 中。

2.  **Git 钩子 (Git Hook)**:
    -   这是一个 `prepare-commit-msg` 类型的钩子，需要您手动安装到您的本地代码仓库中。
    -   当您运行 `git commit` 时，此钩子会自动触发。
    -   它会检查您本次暂存（Staged）了哪些文件。
    -   它将暂存的文件列表与 `.git/ai_activity.log` 日志进行比对。
    -   如果发现匹配项，它会在您的终端中发起一个交互式提问，询问您是否希望将 `Co-authored-by: Cursor AI` 的署名添加到本次的 Commit Message 中。
    -   每次提交后，日志文件会被自动清空，以确保下次检测的准确性。

这套机制确保了归因的**准确性**（最终决定权在您手中）和流程的**无感化**（您只需回答 Y/n）。

## 安装与使用指南

### 第1步：安装项目依赖

请确保您已安装 Node.js 和 npm。在本项目根目录下打开终端，并运行：

```bash
npm install
```

### 第2步：运行插件

1.  在 VS Code 中打开 `watch-cursor` 这个项目文件夹。
2.  按下 `F5` 键，这将打开一个新的 **“扩展开发主机”** 窗口。本插件将在这个新窗口中生效。

### 第3步：安装 Git 钩子

1.  在刚刚打开的 **“扩展开发主机”** 窗口中，打开一个您希望启用此功能的、基于 Git 的项目。
2.  打开命令面板 (macOS: `Cmd+Shift+P`, Windows: `Ctrl+Shift+P`)。
3.  输入 `Watch Cursor` 并选择命令 **"Watch Cursor: Install Git Hook for AI Attribution"**。
4.  您应该会看到一条提示消息，确认钩子已成功安装。

### 第4步：测试工作流

1.  在您安装了钩子的项目中，使用 Cursor 生成一段代码（例如一个新函数或一个类）。
2.  保存文件。
3.  使用 `git add <file_path>` 命令暂存该文件。
4.  使用 `git commit` 提交您的更改。
5.  此时，您的终端应该会显示以下提示：
    ```
    [AI Assistant] AI-generated code detected in this commit.
    > Do you want to add 'Co-authored-by: Cursor AI' to this commit? (Y/n)
    ```
6.  按下 `Y` 或直接按 `Enter` 键。您的 Commit 编辑器将会打开，并且 `Co-authored-by` 的署名信息已经被自动添加进去了。

至此，全部设置完成。插件现在会持续监控您的编码活动，并在您提交 AI 辅助生成的代码时，由钩子提醒您进行归因。
