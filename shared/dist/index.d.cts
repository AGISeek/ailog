/**
 * 提交记录相关的类型定义
 */
interface Commit {
    /** 提交哈希 */
    commit_hash: string;
    /** 提交时间戳 */
    commit_time: number;
    /** 仓库名称 */
    repo: string;
    /** 分支名称 */
    branch: string;
    /** 提交者 */
    committer: string;
    /** 是否AI生成 */
    is_ai_generated: boolean;
    /** 代码行数变化 */
    code_volume_delta: number;
    /** 代码写入速度变化 */
    code_write_speed_delta: number;
    /** 提交信息 */
    notes: string;
}
interface CommitStatistics {
    /** 总提交数 */
    totalCommits: number;
    /** AI提交数 */
    aiCommits: number;
    /** 总代码行数 */
    totalLines: number;
    /** AI代码行数 */
    aiLines: number;
}
interface CommitTrendData {
    /** 日期 */
    date: string;
    /** 总代码行数 */
    totalLines: number;
    /** AI代码行数 */
    aiLines: number;
    /** 提交数量 */
    commitCount: number;
    /** AI提交数量 */
    aiCommitCount: number;
}
interface CommitDistribution {
    /** 类型 */
    type: 'AI' | 'Manual';
    /** 数量 */
    count: number;
    /** 百分比 */
    percentage: number;
}

/**
 * 筛选器相关的类型定义
 */
interface CommitFilters {
    /** 日期范围筛选 */
    dateRange?: [string, string];
    /** 仓库筛选 */
    repository?: string;
    /** 分支筛选 */
    branch?: string;
    /** 提交者筛选 */
    committer?: string;
    /** AI类型筛选 */
    aiType?: 'all' | 'ai' | 'manual';
    /** 消息搜索 */
    messageSearch?: string;
}
interface FilterOption {
    /** 显示标签 */
    label: string;
    /** 选项值 */
    value: string;
    /** 数量 */
    count?: number;
}
interface PaginationState {
    /** 当前页码 */
    current: number;
    /** 每页大小 */
    pageSize: number;
    /** 总数量 */
    total: number;
}
interface TableSorter {
    /** 排序字段 */
    field?: string;
    /** 排序顺序 */
    order?: 'ascend' | 'descend';
}

/**
 * VS Code API 相关的类型定义
 */
interface VSCodeMessage {
    /** 消息命令 */
    command: string;
    /** 消息数据 */
    data?: any;
}
interface GetCommitsMessage extends VSCodeMessage {
    command: 'getCommits';
    repo?: string;
    branch?: string;
}
interface GetReposMessage extends VSCodeMessage {
    command: 'getRepos';
}
interface GetBranchesMessage extends VSCodeMessage {
    command: 'getBranches';
    repo?: string;
}
interface LoadCommitsMessage extends VSCodeMessage {
    command: 'loadCommits';
    commits: Commit[];
}
interface LoadReposMessage extends VSCodeMessage {
    command: 'loadRepos';
    repos: string[];
}
interface LoadBranchesMessage extends VSCodeMessage {
    command: 'loadBranches';
    branches: string[];
}
type VSCodeIncomingMessage = LoadCommitsMessage | LoadReposMessage | LoadBranchesMessage;
type VSCodeOutgoingMessage = GetCommitsMessage | GetReposMessage | GetBranchesMessage;
interface VSCodeAPI {
    postMessage: (message: VSCodeOutgoingMessage) => void;
    getState: () => any;
    setState: (state: any) => void;
}
declare global {
    function acquireVsCodeApi(): VSCodeAPI;
}

/**
 * 统计数据相关的类型定义
 */

interface DatabaseCommit extends Commit {
    id?: number;
}
interface FilterOptions {
    repo?: string;
    branch?: string;
    startDate?: string;
    endDate?: string;
    isAiGenerated?: boolean;
}

export type { Commit, CommitDistribution, CommitFilters, CommitStatistics, CommitTrendData, DatabaseCommit, FilterOption, FilterOptions, GetBranchesMessage, GetCommitsMessage, GetReposMessage, LoadBranchesMessage, LoadCommitsMessage, LoadReposMessage, PaginationState, TableSorter, VSCodeAPI, VSCodeIncomingMessage, VSCodeMessage, VSCodeOutgoingMessage };
