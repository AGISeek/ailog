/**
 * 提交记录表格组件
 */

import React from 'react';
import { Card, Table, Tag, Space, Typography, Empty } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { Commit } from '@ailog/shared';
import type { PaginationState, TableSorter, FilterOption } from '../../types';
import styles from './index.module.css';

const { Text } = Typography;

interface CommitsTableProps {
  commits: Commit[];
  loading: boolean;
  pagination: PaginationState;
  sorter: TableSorter;
  repositoryOptions: FilterOption[];
  branchOptions: FilterOption[];
  committerOptions: FilterOption[];
  onPaginationChange: (pagination: Partial<PaginationState>) => void;
  onSorterChange: (sorter: TableSorter) => void;
  onTableFiltersChange: (filters: Record<string, React.Key[] | null>) => void;
  currentFilters: Record<string, React.Key[] | null>;
}

export const CommitsTable: React.FC<CommitsTableProps> = ({
  commits,
  loading,
  pagination,
  sorter,
  repositoryOptions,
  branchOptions,
  committerOptions,
  onPaginationChange,
  onSorterChange,
  onTableFiltersChange,
  currentFilters,
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<Commit> = [
    {
      title: t('table.commitTime'),
      dataIndex: 'commit_time',
      key: 'commit_time',
      sorter: (a: Commit, b: Commit) => a.commit_time - b.commit_time,
      sortOrder: sorter.field === 'commit_time' ? (sorter.order || null) : null,
      render: (time: number) => new Date(time).toLocaleString(),
      width: 180,
    },
    {
      title: t('table.commitHash'),
      dataIndex: 'commit_hash',
      key: 'commit_hash',
      render: (hash: string) => (
        <span className={styles.hashCell}>
          {hash.substring(0, 8)}
        </span>
      ),
      width: 100,
    },
    {
      title: t('table.repository'),
      dataIndex: 'repo',
      key: 'repo',
      filters: repositoryOptions.map(repo => ({ text: repo.label, value: repo.value })),
      filteredValue: currentFilters.repo || null,
      width: 120,
    },
    {
      title: t('table.branch'),
      dataIndex: 'branch',
      key: 'branch',
      filters: branchOptions.map(branch => ({ text: branch.label, value: branch.value })),
      filteredValue: currentFilters.branch || null,
      width: 100,
    },
    {
      title: t('table.committer'),
      dataIndex: 'committer',
      key: 'committer',
      filters: committerOptions.map(committer => ({ text: committer.label, value: committer.value })),
      filteredValue: currentFilters.committer || null,
      width: 120,
    },
    {
      title: t('table.aiGenerated'),
      dataIndex: 'is_ai_generated',
      key: 'is_ai_generated',
      render: (isAi: number | boolean) => {
        const isAiBoolean = Boolean(isAi);
        return (
          <Tag className={isAiBoolean ? styles.aiTag : styles.manualTag}>
            {isAiBoolean ? t('table.ai') : t('table.manual')}
          </Tag>
        );
      },
      filters: [
        { text: t('table.ai'), value: true },
        { text: t('table.manual'), value: false },
      ],
      filteredValue: currentFilters.is_ai_generated || null,
      width: 100,
    },
    {
      title: t('table.codeLines'),
      dataIndex: 'code_volume_delta',
      key: 'code_volume_delta',
      sorter: (a: Commit, b: Commit) => a.code_volume_delta - b.code_volume_delta,
      sortOrder: sorter.field === 'code_volume_delta' ? (sorter.order || null) : null,
      render: (delta: number) => (
        <span className={
          delta > 0 ? styles.positiveLines :
          delta < 0 ? styles.negativeLines :
          styles.neutralLines
        }>
          {delta > 0 ? '+' : ''}{delta}
        </span>
      ),
      width: 80,
    },
    {
      title: t('table.message'),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) => (
        <Text ellipsis={{ tooltip: notes }} className={styles.messageCell}>
          {notes}
        </Text>
      ),
    },
  ];

  const handleTableChange: TableProps<Commit>['onChange'] = (_, filters, sorterConfig) => {
    console.log('🔍 TableChange - filters:', filters);
    console.log('🔍 TableChange - sorterConfig:', sorterConfig);
    
    // 处理排序 - 支持取消排序
    if (!Array.isArray(sorterConfig)) {
      if (sorterConfig.field) {
        // 如果有字段但没有排序顺序，表示取消排序
        if (!sorterConfig.order) {
          console.log('🔄 Clearing sort');
          onSorterChange({
            field: undefined,
            order: undefined,
          });
        } else {
          // 正常排序
          console.log('🔄 Setting sort:', sorterConfig.field, sorterConfig.order);
          onSorterChange({
            field: sorterConfig.field as string,
            order: sorterConfig.order,
          });
        }
      } else {
        // 没有字段，清除排序
        console.log('🔄 Clearing sort (no field)');
        onSorterChange({
          field: undefined,
          order: undefined,
        });
      }
    }

    // 处理筛选器
    if (filters) {
      console.log('🔍 Processing table filters:', filters);
      // 转换FilterValue到React.Key[]类型
      const convertedFilters: Record<string, React.Key[] | null> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          convertedFilters[key] = null;
        } else if (Array.isArray(value)) {
          convertedFilters[key] = value as React.Key[];
        } else {
          convertedFilters[key] = [value] as React.Key[];
        }
      });
      console.log('🔍 Converted filters:', convertedFilters);
      onTableFiltersChange(convertedFilters);
    }
  };

  return (
    <Card
      title={
        <Space className={styles.title}>
          <FilterOutlined className={styles.titleIcon} />
          {t('table.commitRecords')} ({commits.length})
        </Space>
      }
      loading={loading}
      className={styles.container}
    >
      <Table
        columns={columns}
        dataSource={commits}
        rowKey="commit_hash"
        loading={loading}
        className={styles.table}
        pagination={{
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => {
            const start = range ? range[0] : 0;
            const end = range ? range[1] : 0;
            return t('table.pagination', { 
              start, 
              end, 
              total 
            });
          },
          onShowSizeChange: (_, size) => onPaginationChange({ current: 1, pageSize: size }),
          className: styles.pagination,
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        size="small"
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('table.noData')} />
        }}
      />
    </Card>
  );
};