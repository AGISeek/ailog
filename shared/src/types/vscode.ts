/**
 * VS Code API 相关的类型定义
 */

export interface VSCodeMessage {
  /** 消息命令 */
  command: string;
  /** 消息数据 */
  data?: any;
}

export interface GetCommitsMessage extends VSCodeMessage {
  command: 'getCommits';
  repo?: string;
  branch?: string;
}

export interface GetReposMessage extends VSCodeMessage {
  command: 'getRepos';
}

export interface GetBranchesMessage extends VSCodeMessage {
  command: 'getBranches';
  repo?: string;
}

export interface LoadCommitsMessage extends VSCodeMessage {
  command: 'loadCommits';
  commits: import('./commit').Commit[];
}

export interface LoadReposMessage extends VSCodeMessage {
  command: 'loadRepos';
  repos: string[];
}

export interface LoadBranchesMessage extends VSCodeMessage {
  command: 'loadBranches';
  branches: string[];
}

export type VSCodeIncomingMessage = 
  | LoadCommitsMessage 
  | LoadReposMessage 
  | LoadBranchesMessage;

export type VSCodeOutgoingMessage = 
  | GetCommitsMessage 
  | GetReposMessage 
  | GetBranchesMessage;

export interface VSCodeAPI {
  postMessage: (message: VSCodeOutgoingMessage) => void;
  getState: () => any;
  setState: (state: any) => void;
}

declare global {
  function acquireVsCodeApi(): VSCodeAPI;
}