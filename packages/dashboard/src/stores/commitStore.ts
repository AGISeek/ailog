/**
 * 提交数据的状态管理
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Commit, CommitStatistics, CommitTrendData } from '@ailog/shared';

interface CommitState {
  /** 所有提交数据 */
  commits: Commit[];
  /** 筛选后的提交数据 */
  filteredCommits: Commit[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 统计数据 */
  statistics: CommitStatistics;
  /** 趋势数据 */
  trendData: CommitTrendData[];
}

interface CommitActions {
  /** 设置提交数据 */
  setCommits: (commits: Commit[]) => void;
  /** 设置筛选后的提交数据 */
  setFilteredCommits: (commits: Commit[]) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置错误信息 */
  setError: (error: string | null) => void;
  /** 计算统计数据 */
  calculateStatistics: () => void;
  /** 计算趋势数据 */
  calculateTrendData: () => void;
  /** 重置状态 */
  reset: () => void;
}

const initialState: CommitState = {
  commits: [],
  filteredCommits: [],
  loading: false,
  error: null,
  statistics: {
    totalCommits: 0,
    aiCommits: 0,
    totalLines: 0,
    aiLines: 0,
  },
  trendData: [],
};

export const useCommitStore = create<CommitState & CommitActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setCommits: (commits) => {
      set({ commits, filteredCommits: commits });
      get().calculateStatistics();
      get().calculateTrendData();
    },

    setFilteredCommits: (filteredCommits) => {
      set({ filteredCommits });
    },

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    calculateStatistics: () => {
      const { filteredCommits } = get();
      
      const statistics: CommitStatistics = {
        totalCommits: filteredCommits.length,
        aiCommits: filteredCommits.filter(c => c.is_ai_generated).length,
        totalLines: filteredCommits.reduce((sum, c) => sum + c.code_volume_delta, 0),
        aiLines: filteredCommits
          .filter(c => c.is_ai_generated)
          .reduce((sum, c) => sum + c.code_volume_delta, 0),
      };
      
      set({ statistics });
    },

    calculateTrendData: () => {
      const { filteredCommits } = get();
      
      // 按日期分组
      const grouped = filteredCommits.reduce((acc, commit) => {
        const date = new Date(commit.commit_time).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            date,
            totalLines: 0,
            aiLines: 0,
            commitCount: 0,
            aiCommitCount: 0,
          };
        }
        
        acc[date].totalLines += commit.code_volume_delta;
        acc[date].commitCount += 1;
        
        if (commit.is_ai_generated) {
          acc[date].aiLines += commit.code_volume_delta;
          acc[date].aiCommitCount += 1;
        }
        
        return acc;
      }, {} as Record<string, CommitTrendData>);
      
      const trendData = Object.values(grouped).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      set({ trendData });
    },

    reset: () => set(initialState),
  }))
);

// 订阅筛选后的提交数据变化，自动重新计算统计数据
useCommitStore.subscribe(
  (state) => state.filteredCommits,
  () => {
    useCommitStore.getState().calculateStatistics();
  }
);