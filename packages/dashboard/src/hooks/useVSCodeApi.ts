/**
 * VS Code API 集成的自定义Hook
 */

import { useEffect, useRef, useCallback } from 'react';
import type { VSCodeAPI, VSCodeIncomingMessage, VSCodeOutgoingMessage } from '../types';

interface UseVSCodeApiReturn {
  /** VS Code API 实例 */
  api: VSCodeAPI | null;
  /** 发送消息到 VS Code */
  postMessage: (message: VSCodeOutgoingMessage) => void;
  /** 注册消息监听器 */
  onMessage: (handler: (message: VSCodeIncomingMessage) => void) => () => void;
}

export const useVSCodeApi = (): UseVSCodeApiReturn => {
  const apiRef = useRef<VSCodeAPI | null>(null);
  const messageHandlersRef = useRef<Set<(message: VSCodeIncomingMessage) => void>>(new Set());

  // 初始化 VS Code API
  useEffect(() => {
    try {
      // 获取 VS Code API
      const api = acquireVsCodeApi();
      apiRef.current = api;

      // 监听来自 VS Code 的消息
      const handleMessage = (event: MessageEvent) => {
        const message = event.data as VSCodeIncomingMessage;
        
        // 通知所有注册的处理器
        messageHandlersRef.current.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error handling VS Code message:', error);
          }
        });
      };

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    } catch (error) {
      console.error('Failed to acquire VS Code API:', error);
    }
  }, []);

  // 发送消息到 VS Code
  const postMessage = useCallback((message: VSCodeOutgoingMessage) => {
    if (apiRef.current) {
      try {
        apiRef.current.postMessage(message);
      } catch (error) {
        console.error('Failed to send message to VS Code:', error);
      }
    } else {
      console.warn('VS Code API not available');
    }
  }, []);

  // 注册消息监听器
  const onMessage = useCallback((handler: (message: VSCodeIncomingMessage) => void) => {
    messageHandlersRef.current.add(handler);
    
    // 返回清理函数
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  return {
    api: apiRef.current,
    postMessage,
    onMessage,
  };
};