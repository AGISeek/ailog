/**
 * 共享类型定义
 * 
 * 本文件定义了整个扩展中使用的核心数据结构和接口，
 * 确保类型安全和代码一致性。
 */

/**
 * AI检测结果接口
 * 
 * 表示AI代码检测的完整结果，包含检测置信度、原因和元数据
 */
export interface AIDetectionResult {
    /** 是否被识别为AI生成的代码 */
    isAiGenerated: boolean;
    /** 检测置信度 (0-100) */
    confidence: number;
    /** 检测原因列表 */
    reasons: string[];
    /** 检测元数据 */
    metadata: AIDetectionMetadata;
}

/**
 * AI检测元数据接口
 * 
 * 包含检测过程中收集的详细信息，用于分析和报告
 */
export interface AIDetectionMetadata {
    /** 代码块大小（字符数） */
    chunkSize: number;
    /** 模式匹配得分 */
    patternMatches: number;
    /** 是否包含样板代码 */
    hasBoilerplate: boolean;
    /** 是否包含高质量注释 */
    hasQualityComments: boolean;
    /** 时间邻近性得分 */
    timeProximity: number;
    /** 编程语言类型 */
    languageType: string;
}

/**
 * 会话状态接口
 * 
 * 跟踪Cursor命令执行和文档修改的会话状态
 */
export interface SessionState {
    /** 当前是否有活跃的Cursor命令 */
    isCursorCommandActive: boolean;
    /** 最后一次命令执行的时间戳 */
    lastCommandTimestamp: number;
    /** 最后影响的文件路径 */
    lastAffectedFile: string;
    /** 活动日志记录 */
    activityLog: ActivityLogEntry[];
}

/**
 * 活动日志条目接口
 * 
 * 记录单个AI活动的详细信息
 */
export interface ActivityLogEntry {
    /** 文件路径 */
    file: string;
    /** 时间戳 */
    timestamp: number;
    /** 执行的命令 */
    command: string;
}

/**
 * 提交信息接口
 * 
 * 包含Git提交的完整信息和AI检测结果
 */
export interface CommitInfo {
    /** 提交中包含的文件列表 */
    files: string[];
    /** 提交消息 */
    message: string;
    /** 是否包含AI生成的内容 */
    hasAiContent: boolean;
    /** 每个文件的AI检测结果 */
    aiDetectionResults: AIDetectionResult[];
}

/**
 * 提交记录接口
 * 
 * 数据库中存储的提交记录结构
 */
export interface Commit {
    /** 提交时间戳 */
    commit_time: number;
    /** 提交哈希值 */
    commit_hash: string;
    /** 仓库名称 */
    repo: string;
    /** 分支名称 */
    branch: string;
    /** 提交者姓名 */
    committer: string;
    /** 是否为AI生成 */
    is_ai_generated: boolean;
    /** 代码量变化（增加行数 - 删除行数） */
    code_volume_delta: number;
    /** 代码编写速度变化（预留字段） */
    code_write_speed_delta: number;
    /** 提交说明 */
    notes: string;
}

/**
 * 检测配置接口
 * 
 * AI检测算法的配置参数
 */
export interface DetectionConfig {
    /** 置信度阈值 (0-100) */
    confidenceThreshold: number;
    /** 代码块大小阈值 */
    chunkSizeThreshold: number;
    /** 时间邻近性窗口（毫秒） */
    timeProximityWindow: number;
    /** 是否启用时间邻近性检测 */
    enableTimeProximity: boolean;
    /** 是否启用模式匹配检测 */
    enablePatternMatching: boolean;
}

/**
 * 扩展状态接口
 * 
 * 跟踪扩展的当前状态
 */
export interface ExtensionState {
    /** 当前是否标记为AI生成 */
    isAiGenerated: boolean;
    /** 是否启用实时检测模式 */
    enableRealtimeDetection: boolean;
}