/**
 * 国际化配置
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh from './zh.json';

// 检测语言
const detectLanguage = (): string => {
  // 在 VS Code 环境中，可以通过 VS Code API 获取语言设置
  try {
    // VS Code API check
    if (typeof (globalThis as Record<string, unknown>).acquireVsCodeApi !== 'undefined') {
      // 从 VS Code 环境变量或配置中获取语言
      const preferredLang = navigator.language.toLowerCase();
      return preferredLang.startsWith('zh') ? 'zh' : 'en';
    }
  } catch (error) {
    console.warn('Failed to detect VS Code language:', error);
  }
  
  // 降级到浏览器语言检测
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('zh') ? 'zh' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;