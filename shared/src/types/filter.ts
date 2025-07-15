/**
 * 筛选器相关的类型定义
 */

export interface CommitFilters {
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

export interface FilterOption {
  /** 显示标签 */
  label: string;
  /** 选项值 */
  value: string;
  /** 数量 */
  count?: number;
}

export interface PaginationState {
  /** 当前页码 */
  current: number;
  /** 每页大小 */
  pageSize: number;
  /** 总数量 */
  total: number;
}

export interface TableSorter {
  /** 排序字段 */
  field?: string;
  /** 排序顺序 */
  order?: 'ascend' | 'descend';
}