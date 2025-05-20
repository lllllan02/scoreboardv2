import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Submission } from "../types/submission";
import { ContestConfig } from "../types/contest";
import { WomanOutlined } from "@ant-design/icons";
import "../styles/Contest.css";

interface SubmissionListProps {
  contestConfig: ContestConfig;
  submissions: Submission[];
  loading?: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  contestConfig,
  submissions,
  loading = false,
  total,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  // 格式化相对时间为可读格式
  const formatRelativeTime = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600000);
    const minutes = Math.floor((timestamp % 3600000) / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const columns: ColumnsType<Submission> = [
    {
      title: "提交时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
      render: (timestamp: number) => formatRelativeTime(timestamp),
    },
    {
      title: "队伍",
      dataIndex: "team",
      key: "team",
      width: 200,
      render: (team: string, record: Submission) => (
        <span>
          {team}
          {record.girl && <WomanOutlined style={{ marginLeft: 8, color: '#eb2f96' }} />}
        </span>
      ),
    },
    {
      title: "学校",
      dataIndex: "organization",
      key: "organization",
      width: 200,
    },
    {
      title: "题目",
      dataIndex: "problem_id",
      key: "problem_id",
      width: 80,
    },
    {
      title: "语言",
      dataIndex: "language",
      key: "language",
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => {
        const statusClass = `status-${status.toLowerCase().replace(/ /g, '-')}`;
        return <span className={statusClass}>{status}</span>;
      },
    },
    {
      title: "提交ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
  ];

  return (
    <div className="submission-list">
      <Table
        dataSource={submissions}
        columns={columns}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: onPageChange,
        }}
        loading={loading}
        size="small"
        scroll={{ x: true }}
      />
    </div>
  );
};

export default SubmissionList; 