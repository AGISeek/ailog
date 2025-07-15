/**
 * 统计数据相关的类型定义
 */

import type { Commit } from './commit';

export interface DatabaseCommit extends Commit {
  id?: number;
}

export interface FilterOptions {
  repo?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
  isAiGenerated?: boolean;
}