/**
 * 筛选器状态管理
 */

import { create } from 'zustand';
import type { CommitFilters, PaginationState, TableSorter, FilterOption } from '../types';

interface FilterState {
  /** 筛选条件 */
  filters: CommitFilters;
  /** 分页状态 */
  pagination: PaginationState;
  /** 排序状态 */
  sorter: TableSorter;
  /** 表格列筛选器 */
  tableFilters: Record<string, React.Key[] | null>;
  /** 仓库选项 */
  repositoryOptions: FilterOption[];
  /** 分支选项 */
  branchOptions: FilterOption[];
  /** 提交者选项 */
  committerOptions: FilterOption[];
}

interface FilterActions {
  /** 设置筛选条件 */
  setFilters: (filters: Partial<CommitFilters>) => void;
  /** 重置筛选条件 */
  resetFilters: () => void;
  /** 清除筛选条件 */
  clearFilters: () => void;
  /** 设置分页 */
  setPagination: (pagination: Partial<PaginationState>) => void;
  /** 设置排序 */
  setSorter: (sorter: TableSorter) => void;
  /** 设置表格筛选器 */
  setTableFilters: (filters: Record<string, React.Key[] | null>) => void;
  /** 设置仓库选项 */
  setRepositoryOptions: (options: FilterOption[]) => void;
  /** 设置分支选项 */
  setBranchOptions: (options: FilterOption[]) => void;
  /** 设置提交者选项 */
  setCommitterOptions: (options: FilterOption[]) => void;
  /** 重置分页到第一页 */
  resetPagination: () => void;
}

const initialFilters: CommitFilters = {
  dateRange: undefined,
  repository: undefined,
  branch: undefined,
  committer: undefined,
  aiType: 'all',
  messageSearch: undefined,
};

const initialPagination: PaginationState = {
  current: 1,
  pageSize: 25,
  total: 0,
};

const initialSorter: TableSorter = {
  field: undefined,
  order: undefined,
};

export const useFilterStore = create<FilterState & FilterActions>()((set, get) => ({
  filters: initialFilters,
  pagination: initialPagination,
  sorter: initialSorter,
  tableFilters: {},
  repositoryOptions: [],
  branchOptions: [],
  committerOptions: [],

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    // 筛选条件变化时重置分页
    get().resetPagination();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().resetPagination();
  },

  clearFilters: () => {
    set({ filters: initialFilters, tableFilters: {} });
    get().resetPagination();
  },

  setPagination: (newPagination) => {
    set(state => ({
      pagination: { ...state.pagination, ...newPagination }
    }));
  },

  setSorter: (sorter) => {
    set({ sorter });
    get().resetPagination();
  },

  setTableFilters: (tableFilters) => {
    console.log('🏪 Store - Setting table filters:', tableFilters);
    set({ tableFilters });
    get().resetPagination();
  },

  setRepositoryOptions: (repositoryOptions) => set({ repositoryOptions }),

  setBranchOptions: (branchOptions) => set({ branchOptions }),

  setCommitterOptions: (committerOptions) => set({ committerOptions }),

  resetPagination: () => {
    set(state => ({
      pagination: { ...state.pagination, current: 1 }
    }));
  },
}));