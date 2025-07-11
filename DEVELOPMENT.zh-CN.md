# 智迹 (AIlog) - 开发指南

## 概述

智迹 (AIlog) 是一个复杂的 VS Code 扩展，用于跟踪 AI 生成的提交记录，并通过综合仪表板界面提供高级分析。该扩展具有现代化的 SOLID 架构，具备多维度 AI 检测能力，帮助开发者了解其 AI 辅助编程模式和生产力指标。

## 前置要求

- **Node.js** (v18 或更高版本)
- **VS Code** (v1.85.0 或更高版本)
- **Git 仓库** 用于测试
- **TypeScript** 开发知识

## 开发环境搭建

### 1. 克隆和安装依赖

```bash
git clone https://github.com/your-org/ailog.git
cd ailog
npm install
```

### 2. 开发命令

#### 构建和编译
```bash
npm run compile           # 将 TypeScript 编译为 JavaScript
npm run watch             # 监听文件变化并自动编译
npm run vscode:prepublish # 准备发布（包括编译）
```

#### 代码质量检查
```bash
npm run lint              # 在 src/ 目录运行 ESLint，支持 TypeScript
```

#### 打包
```bash
npm run package           # 使用 vsce 创建 VSIX 包用于分发
```

### 3. 开发工作流程

1. **开始开发**: 运行 `npm run watch` 启用自动编译
2. **启动扩展**: 按 `F5` 打开扩展开发主机
3. **测试功能**: 在开发环境中使用扩展
4. **调试**: 使用 VS Code 内置调试器和断点

## 架构概览

智迹遵循 SOLID 原则，采用清洁、模块化的架构，专为可维护性和可扩展性而设计。

### 项目结构

```
src/
├── commands/                    # 命令处理器（单一职责）
│   ├── showDashboardCommand.ts     # 仪表板命令处理器
│   ├── toggleAiCommand.ts          # AI 切换命令处理器
│   ├── installHookCommand.ts       # Git 钩子安装命令
│   └── processCommitCommand.ts     # 提交处理命令
├── managers/                    # 核心协调逻辑
│   ├── extensionManager.ts         # 主扩展协调器
│   ├── commandManager.ts           # 命令注册和管理
│   └── documentChangeManager.ts    # 文档变更事件处理
├── services/                    # 业务逻辑服务
│   ├── detection/                  # AI 检测算法
│   │   ├── aiDetectionService.ts      # 主检测协调器
│   │   ├── patternAnalyzer.ts         # 代码模式分析
│   │   ├── syntaxAnalyzer.ts          # 语法完整性分析
│   │   ├── commentAnalyzer.ts         # 注释质量分析
│   │   ├── boilerplateAnalyzer.ts     # 样板代码检测
│   │   ├── chunkAnalyzer.ts           # 代码块大小分析
│   │   └── timeProximityAnalyzer.ts   # 时间关联分析
│   ├── git/                        # Git 操作
│   │   ├── gitHookService.ts          # Git 钩子管理
│   │   ├── gitCommitService.ts        # 提交数据处理
│   │   └── gitAnalysisService.ts      # Git 变更分析
│   └── ui/                         # 用户界面服务
│       ├── statusBarService.ts        # 状态栏管理
│       ├── notificationService.ts     # 用户通知
│       └── dashboardService.ts        # 仪表板网页视图管理
├── types/                       # TypeScript 类型定义
│   └── index.ts                     # 共享接口和类型
├── lib/                         # 工具库
│   └── commitHookScript.js          # Git 钩子脚本
├── database.ts                  # SQLite 数据库操作
├── i18n.ts                      # 国际化支持
├── dashboard.html               # 仪表板 UI 模板
└── extension.ts                 # 主扩展入口点
```

## 核心组件

### 1. 扩展管理器 (`src/managers/extensionManager.ts`)
- **目的**: 所有扩展服务的中央协调器
- **职责**: 
  - 服务初始化和生命周期管理
  - 依赖注入协调
  - 扩展状态管理
- **架构**: 实现依赖注入模式

### 2. AI 检测系统 (`src/services/detection/`)

#### AI 检测服务 (`aiDetectionService.ts`)
- **目的**: AI 检测算法的主协调器
- **功能**:
  - 结合多种检测方法的多维度分析
  - 可配置的置信度阈值
  - 带元数据的综合结果报告

#### 检测分析器
- **模式分析器**: 识别 AI 生成的代码模式和结构
- **语法分析器**: 检查语法完整性和格式良好的代码
- **注释分析器**: 评估注释质量和文档模式
- **样板分析器**: 检测常见代码模板和框架
- **代码块分析器**: 分析代码块大小和复杂度
- **时间邻近分析器**: 将代码变更与 AI 工具使用时间相关联

### 3. Git 集成 (`src/services/git/`)

#### Git 钩子服务 (`gitHookService.ts`)
- **目的**: 管理 Git 钩子的安装和配置
- **功能**:
  - 自动安装 pre-commit 和 post-commit 钩子
  - 跨平台 shell 脚本生成
  - 钩子状态监控和验证

#### Git 提交服务 (`gitCommitService.ts`)
- **目的**: 处理提交数据和元数据
- **功能**:
  - 自动提交数据收集
  - AI 归属标记管理
  - 代码量变化计算

### 4. 用户界面 (`src/services/ui/`)

#### 仪表板服务 (`dashboardService.ts`)
- **目的**: 管理仪表板网页视图和数据交互
- **功能**:
  - 实时数据加载和过滤
  - Chart.js 集成用于可视化
  - 国际化支持

#### 状态栏服务 (`statusBarService.ts`)
- **目的**: 管理 VS Code 状态栏集成
- **功能**:
  - 实时 AI 检测状态显示
  - 手动覆盖切换功能
  - 主题感知 UI 更新

## 数据库架构

扩展使用 SQLite 进行本地数据存储，采用以下优化架构：

```sql
CREATE TABLE commits (
    commit_time INTEGER NOT NULL,           -- Unix 时间戳
    commit_hash TEXT PRIMARY KEY,           -- Git 提交哈希
    repo TEXT NOT NULL,                     -- 仓库名称
    branch TEXT NOT NULL,                   -- 分支名称
    committer TEXT NOT NULL,                -- 提交者姓名
    is_ai_generated INTEGER NOT NULL,       -- AI 归属标记 (0/1)
    code_volume_delta INTEGER NOT NULL,     -- 增加行数 - 删除行数
    code_write_speed_delta INTEGER,         -- 速度指标（预留）
    notes TEXT                              -- 提交消息
);

-- 性能索引
CREATE INDEX idx_commits_time ON commits(commit_time);
CREATE INDEX idx_commits_repo ON commits(repo);
CREATE INDEX idx_commits_branch ON commits(branch);
CREATE INDEX idx_commits_ai ON commits(is_ai_generated);
```

## 关键功能实现

### 1. AI 检测管道

```typescript
// 多维度 AI 检测过程
const detectionResult = await aiDetectionService.detectAI(changeEvent);

// 检测包括：
// - 模式匹配（最高 25 分）
// - 语法完整性（最高 25 分）
// - 样板检测（最高 20 分）
// - 注释质量（最高 15 分）
// - 时间邻近性（最高 50 分）
// - 代码块大小分析（最高 30 分）

// 置信度阈值：70/100 用于 AI 分类
```

### 2. Git 钩子集成

扩展安装智能 Git 钩子，具备以下功能：
- **Pre-commit**: 交互式 AI 归属确认
- **Post-commit**: 自动数据收集和存储
- **跨平台**: 带有 VS Code 命令集成的 Shell 脚本
- **后备方案**: 针对没有 VS Code CLI 的环境的 Node.js 脚本

### 3. 仪表板分析

高级仪表板功能：
- **实时数据**: 来自 SQLite 数据库的实时更新
- **交互式图表**: Chart.js 集成，支持自定义主题
- **高级过滤**: 按仓库、分支、时间进行多维度过滤
- **导出功能**: 数据导出用于外部分析

### 4. 国际化

完整的 i18n 支持：
- **语言文件**: 基于 JSON 的翻译系统
- **动态切换**: 基于 VS Code 语言环境的自动语言检测
- **可扩展**: 轻松添加新语言
- **模板支持**: HTML 模板占位符替换

## 开发模式

### 1. SOLID 原则实现

#### 单一职责原则
- 每个服务都有单一、明确定义的目的
- 命令处理器按功能分离
- 分析器专注于特定的检测方面

#### 开闭原则
- 检测系统对扩展开放（新分析器）
- 对修改关闭（稳定接口）
- 服务接口允许新的实现

#### 里氏替换原则
- 服务实现一致的接口
- 分析器遵循共同模式
- 依赖注入启用替换

#### 接口隔离原则
- 针对特定职责的专用接口
- 不强制依赖未使用的方法
- 清洁的 API 边界

#### 依赖倒置原则
- 高级模块依赖于抽象
- 整个系统中的依赖注入
- 组件间松耦合

### 2. 错误处理

全面的错误处理策略：
- **优雅降级**: 扩展在功能减少的情况下继续工作
- **用户反馈**: 清晰的错误消息和恢复建议
- **日志记录**: 详细的控制台日志记录用于调试
- **验证**: 服务边界的输入验证

### 3. 测试策略

虽然目前没有实现自动化测试，但扩展支持：
- **手动测试**: 扩展开发主机环境
- **集成测试**: 真实 Git 仓库测试
- **性能测试**: 大型代码库验证
- **跨平台测试**: Windows、macOS、Linux 兼容性

## 配置和自定义

### 检测配置

```typescript
interface DetectionConfig {
    confidenceThreshold: number;      // AI 检测阈值 (0-100)
    chunkSizeThreshold: number;       // 分析的最小代码块大小
    timeProximityWindow: number;      // 邻近分析的时间窗口（毫秒）
    enableTimeProximity: boolean;     // 启用/禁用基于时间的检测
    enablePatternMatching: boolean;   // 启用/禁用模式匹配
}
```

### 扩展设置

扩展支持各种配置选项：
- **检测敏感度**: 可调整的 AI 检测阈值
- **语言支持**: 启用/禁用特定语言的检测
- **仪表板首选项**: 图表类型和可视化选项
- **数据库位置**: 自定义数据库路径配置

## 性能考虑

### 1. 数据库优化
- **索引查询**: 为常见查询模式设置策略性索引
- **批量操作**: 批量插入以提高性能
- **连接池**: 高效的数据库连接管理

### 2. 内存管理
- **延迟加载**: 仅在需要时初始化服务
- **事件清理**: 正确处理事件监听器
- **网页视图管理**: 高效的网页视图生命周期管理

### 3. 检测效率
- **早期终止**: 跳过小变更的分析
- **缓存**: 缓存重复分析的检测结果
- **增量分析**: 仅分析变更的部分

## 扩展扩展

### 添加新的检测分析器

1. **创建分析器类**:
```typescript
export class NewAnalyzer {
    public analyze(text: string): { score: number; reasons: string[] } {
        // 实现
    }
}
```

2. **在检测服务中注册**:
```typescript
// 添加到 aiDetectionService.ts
private readonly newAnalyzer = new NewAnalyzer();
```

3. **更新检测逻辑**:
```typescript
// 包含在检测管道中
const newScore = this.newAnalyzer.analyze(text);
```

### 添加新命令

1. **创建命令处理器**:
```typescript
export class NewCommand {
    public async execute(): Promise<void> {
        // 实现
    }
}
```

2. **在命令管理器中注册**:
```typescript
// 添加到 commandManager.ts
this.registerCommand('ailog.newCommand', () => new NewCommand().execute());
```

## 故障排除

### 常见开发问题

1. **TypeScript 编译错误**
   - 确保所有导入都正确类型化
   - 检查缺少的类型定义
   - 运行 `npm run compile` 查看详细错误

2. **扩展未加载**
   - 验证 `package.json` 激活事件
   - 检查扩展清单配置
   - 查看扩展开发主机控制台

3. **数据库连接问题**
   - 确保 SQLite3 正确安装
   - 检查数据库文件权限
   - 验证数据库架构初始化

4. **Git 钩子安装失败**
   - 确认 VS Code 具有文件系统权限
   - 验证 Git 仓库正确初始化
   - 检查 Git 钩子目录权限

### 调试配置

启用全面调试：

1. **VS Code 调试控制台**:
```
帮助 > 切换开发者工具 > 控制台
```

2. **扩展调试模式**:
```typescript
// 添加到 extension.ts
console.log('[AIlog] 调试信息:', data);
```

3. **数据库调试查询**:
```typescript
// 添加到 database.ts
console.log('[AIlog] 查询:', query, params);
```

## 未来增强

### 计划功能
- **自动化测试**: Jest/Mocha 测试框架集成
- **云同步**: 可选的云同步以获得团队洞察
- **高级分析**: 基于机器学习的检测改进
- **插件系统**: 第三方分析器的可扩展架构
- **性能指标**: 详细的性能跟踪和优化

### 架构改进
- **微服务**: 服务的进一步分解
- **事件驱动**: 转向事件驱动架构
- **缓存层**: 类似 Redis 的缓存以提高性能
- **API 层**: 外部集成的 RESTful API

## 贡献

我们欢迎对智迹的贡献！请遵循以下指南：

### 代码风格
- 遵循现有的 TypeScript 模式和约定
- 使用有意义的变量和函数名称
- 为所有公共 API 添加全面的 JSDoc 注释
- 保持一致的缩进和格式

### 开发过程
1. **Fork 仓库**: 创建您自己的 fork 进行开发
2. **创建功能分支**: 使用描述性分支名称
3. **遵循 SOLID 原则**: 确保新代码遵循架构模式
4. **全面测试**: 使用扩展开发主机进行测试
5. **更新文档**: 更新相关文档
6. **提交拉取请求**: 提供清晰的变更描述

### 代码审查标准
- **功能性**: 代码是否按预期工作？
- **架构**: 是否遵循 SOLID 原则？
- **文档**: 代码是否有良好的文档？
- **性能**: 是否有性能影响？
- **测试**: 代码是否经过全面测试？

---

本开发指南提供了智迹扩展架构和开发实践的全面概述。有关具体实现细节，请参考源代码和内联文档。