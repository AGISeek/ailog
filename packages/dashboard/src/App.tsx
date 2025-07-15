/**
 * AI 提交仪表盘主应用组件
 */

import React from 'react';
import { ConfigProvider, Layout, Card, Typography, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useCommits } from './hooks';
import { useFilterStore } from './stores';
import { StatisticsCards, FilterControls, CommitsTable } from './components';
import styles from './App.module.css';
import './styles/global.css';
import './locales';

const { Content } = Layout;
const {  Text } = Typography;

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const { 
    filteredCommits,
    loading, 
    error, 
    statistics, 
    repositoryOptions,
    branchOptions,
    committerOptions,
    refetch
  } = useCommits();

  const { 
    filters, 
    setFilters, 
    clearFilters, 
    pagination, 
    setPagination, 
    sorter, 
    setSorter,
    tableFilters,
    setTableFilters
  } = useFilterStore();

  return (
    <ConfigProvider
      locale={i18n.language.startsWith('zh') ? zhCN : enUS}
      componentSize={"small" as const}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          colorBgContainer: 'var(--vscode-editor-widget-background)',
          colorBgElevated: 'var(--vscode-editor-widget-background)',
          colorBorder: 'var(--vscode-widget-border)',
          colorText: 'var(--vscode-foreground)',
          colorTextSecondary: 'var(--vscode-descriptionForeground)',
          colorIcon: 'var(--vscode-icon-foreground)',
          colorIconHover: 'var(--vscode-foreground)',
        },
      }}
    >
      <Layout className={styles.layout}>        
        <Content className={styles.content}>
          {error && (
            <Card className={styles.errorCard}>
              <Text type="danger" className={styles.errorText}>{error}</Text>
            </Card>
          )}

          {/* 统计数据卡片 */}
          <StatisticsCards 
            statistics={statistics}
            loading={loading}
          />

          {/* 筛选控制栏 */}
          <FilterControls
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            onRefresh={refetch}
            loading={loading}
          />

          {/* 提交记录表格 */}
          <CommitsTable
            commits={filteredCommits}
            loading={loading}
            pagination={pagination}
            sorter={sorter}
            repositoryOptions={repositoryOptions}
            branchOptions={branchOptions}
            committerOptions={committerOptions}
            onPaginationChange={setPagination}
            onSorterChange={setSorter}
            onTableFiltersChange={setTableFilters}
            currentFilters={tableFilters}
          />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;