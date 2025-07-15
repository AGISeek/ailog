/**
 * 提交记录相关的类型定义
 */

export interface Commit {
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

export interface CommitStatistics {
  /** 总提交数 */
  totalCommits: number;
  /** AI提交数 */
  aiCommits: number;
  /** 总代码行数 */
  totalLines: number;
  /** AI代码行数 */
  aiLines: number;
}

export interface CommitTrendData {
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

export interface CommitDistribution {
  /** 类型 */
  type: 'AI' | 'Manual';
  /** 数量 */
  count: number;
  /** 百分比 */
  percentage: number;
}