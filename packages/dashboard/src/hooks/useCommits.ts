/**
 * 提交数据管理的自定义Hook
 */

import { useEffect, useCallback } from 'react';
import { useCommitStore, useFilterStore } from '../stores';
import { useVSCodeApi } from './useVSCodeApi';
import type { Commit } from '@ailog/shared';
import type { CommitFilters, VSCodeIncomingMessage } from '../types';

export const useCommits = () => {
  const {
    commits,
    filteredCommits,
    loading,
    error,
    statistics,
    trendData,
    setCommits,
    setFilteredCommits,
    setLoading,
    setError,
  } = useCommitStore();

  const {
    filters,
    tableFilters,
    repositoryOptions,
    branchOptions,
    committerOptions,
    setRepositoryOptions,
    setBranchOptions,
    setCommitterOptions,
  } = useFilterStore();

  const { postMessage, onMessage } = useVSCodeApi();

  // 应用筛选器
  const applyFilters = useCallback((commits: Commit[], filters: CommitFilters, tableFilters: Record<string, React.Key[] | null> = {}): Commit[] => {
    console.log('🎯 Applying filters:', { filters, tableFilters });
    
    return commits.filter(commit => {
      // 日期范围筛选
      if (filters.dateRange) {
        const commitDate = new Date(commit.commit_time).toISOString().split('T')[0];
        const [startDate, endDate] = filters.dateRange;
        if (commitDate < startDate || commitDate > endDate) {
          return false;
        }
      }

      // 仓库筛选
      if (filters.repository && commit.repo !== filters.repository) {
        return false;
      }

      // 分支筛选
      if (filters.branch && commit.branch !== filters.branch) {
        return false;
      }

      // 提交者筛选
      if (filters.committer && commit.committer !== filters.committer) {
        return false;
      }

      // AI类型筛选
      if (filters.aiType && filters.aiType !== 'all') {
        const isAi = filters.aiType === 'ai';
        if (commit.is_ai_generated !== isAi) {
          return false;
        }
      }

      // 消息搜索
      if (filters.messageSearch && filters.messageSearch.trim()) {
        const searchTerm = filters.messageSearch.toLowerCase();
        if (!commit.notes.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // 表格列筛选器
      // 仓库筛选
      if (tableFilters.repo && tableFilters.repo.length > 0) {
        if (!tableFilters.repo.includes(commit.repo)) {
          return false;
        }
      }

      // 分支筛选
      if (tableFilters.branch && tableFilters.branch.length > 0) {
        if (!tableFilters.branch.includes(commit.branch)) {
          return false;
        }
      }

      // 提交者筛选
      if (tableFilters.committer && tableFilters.committer.length > 0) {
        if (!tableFilters.committer.includes(commit.committer)) {
          return false;
        }
      }

      // AI类型筛选
      if (tableFilters.is_ai_generated && tableFilters.is_ai_generated.length > 0) {
        console.log('🤖 AI Type filter check:', { 
          filterValues: tableFilters.is_ai_generated, 
          commitValue: commit.is_ai_generated,
          commitValueType: typeof commit.is_ai_generated
        });
        
        // 将筛选器值转换为boolean进行比较
        const selectedValues = tableFilters.is_ai_generated.map(val => {
          const valAsAny = val as any;
          if (valAsAny === true || valAsAny === 'true' || String(val) === 'true') return true;
          if (valAsAny === false || valAsAny === 'false' || String(val) === 'false') return false;
          return Boolean(val);
        });
        
        console.log('🤖 Converted filter values:', selectedValues);
        
        // 将commit的is_ai_generated值转换为boolean进行比较
        const commitIsAi = Boolean(commit.is_ai_generated);
        console.log('🤖 Commit boolean value:', commitIsAi);
        
        if (!selectedValues.includes(commitIsAi)) {
          console.log('🤖 Commit filtered out');
          return false;
        }
      }

      return true;
    });
  }, []);

  // 更新筛选选项
  const updateFilterOptions = useCallback((commits: Commit[]) => {
    // 仓库选项
    const repos = [...new Set(commits.map(c => c.repo))].sort();
    setRepositoryOptions(repos.map(repo => ({
      label: repo,
      value: repo,
      count: commits.filter(c => c.repo === repo).length,
    })));

    // 分支选项
    const branches = [...new Set(commits.map(c => c.branch))].sort();
    setBranchOptions(branches.map(branch => ({
      label: branch,
      value: branch,
      count: commits.filter(c => c.branch === branch).length,
    })));

    // 提交者选项
    const committers = [...new Set(commits.map(c => c.committer))].sort();
    setCommitterOptions(committers.map(committer => ({
      label: committer,
      value: committer,
      count: commits.filter(c => c.committer === committer).length,
    })));
  }, [setRepositoryOptions, setBranchOptions, setCommitterOptions]);

  // 加载提交数据
  const loadCommits = useCallback((repo?: string, branch?: string) => {
    setLoading(true);
    setError(null);
    
    postMessage({
      command: 'getCommits',
      repo,
      branch,
    });
  }, [postMessage, setLoading, setError]);

  // 加载仓库列表
  const loadRepositories = useCallback(() => {
    postMessage({
      command: 'getRepos',
    });
  }, [postMessage]);

  // 加载分支列表
  const loadBranches = useCallback((repo?: string) => {
    postMessage({
      command: 'getBranches',
      repo,
    });
  }, [postMessage]);

  // 监听来自 VS Code 的消息
  useEffect(() => {
    const unsubscribe = onMessage((message: VSCodeIncomingMessage) => {
      switch (message.command) {
        case 'loadCommits':
          try {
            const sortedCommits = message.commits.sort((a, b) => b.commit_time - a.commit_time);
            setCommits(sortedCommits);
            updateFilterOptions(sortedCommits);
            setLoading(false);
          } catch (error) {
            console.error('Error processing commits:', error);
            setError('Failed to process commit data');
            setLoading(false);
          }
          break;

        case 'loadRepos':
          // 仓库数据已在 updateFilterOptions 中处理
          break;

        case 'loadBranches':
          // 分支数据已在 updateFilterOptions 中处理
          break;

        default:
          console.warn('Unknown message command:', message);
      }
    });

    return unsubscribe;
  }, [onMessage, setCommits, setLoading, setError, updateFilterOptions]);

  // 当筛选条件变化时重新筛选数据
  useEffect(() => {
    console.log('🔄 Refiltering commits:', { commitsCount: commits.length, filters, tableFilters });
    const filtered = applyFilters(commits, filters, tableFilters);
    console.log('✅ Filtered result:', { filteredCount: filtered.length });
    setFilteredCommits(filtered);
  }, [commits, filters, tableFilters, applyFilters, setFilteredCommits]);

  // 初始化时加载数据
  useEffect(() => {
    loadRepositories();
    loadCommits();
  }, [loadRepositories, loadCommits]);

  return {
    // 数据
    commits,
    filteredCommits,
    loading,
    error,
    statistics,
    trendData,
    
    // 筛选选项
    repositoryOptions,
    branchOptions,
    committerOptions,
    
    // 操作方法
    loadCommits,
    loadRepositories,
    loadBranches,
    refetch: () => loadCommits(filters.repository, filters.branch),
  };
};