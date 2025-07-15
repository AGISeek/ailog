/**
 * 提交记录表格组件
 */

import React from 'react';
import { Card, Table, Tag, Space, Typography } from 'antd';
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
}) => {
  const { t } = useTranslation();

  const columns: ColumnsType<Commit> = [
    {
      title: t('table.commitTime'),
      dataIndex: 'commit_time',
      key: 'commit_time',
      sorter: (a: Commit, b: Commit) => a.commit_time - b.commit_time,
      sortOrder: sorter.field === 'commit_time' ? sorter.order : null,
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
      width: 120,
    },
    {
      title: t('table.branch'),
      dataIndex: 'branch',
      key: 'branch',
      filters: branchOptions.map(branch => ({ text: branch.label, value: branch.value })),
      width: 100,
    },
    {
      title: t('table.committer'),
      dataIndex: 'committer',
      key: 'committer',
      filters: committerOptions.map(committer => ({ text: committer.label, value: committer.value })),
      width: 120,
    },
    {
      title: t('table.aiGenerated'),
      dataIndex: 'is_ai_generated',
      key: 'is_ai_generated',
      render: (isAi: boolean) => (
        <Tag className={isAi ? styles.aiTag : styles.manualTag}>
          {isAi ? t('table.ai') : t('table.manual')}
        </Tag>
      ),
      filters: [
        { text: t('table.ai'), value: true },
        { text: t('table.manual'), value: false },
      ],
      width: 100,
    },
    {
      title: t('table.codeLines'),
      dataIndex: 'code_volume_delta',
      key: 'code_volume_delta',
      sorter: (a: Commit, b: Commit) => a.code_volume_delta - b.code_volume_delta,
      sortOrder: sorter.field === 'code_volume_delta' ? sorter.order : null,
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

  const handleTableChange: TableProps<Commit>['onChange'] = (_, __, sorterConfig) => {
    // 处理排序
    if (!Array.isArray(sorterConfig) && sorterConfig.field && sorterConfig.order) {
      onSorterChange({
        field: sorterConfig.field as string,
        order: sorterConfig.order,
      });
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
      />
    </Card>
  );
};