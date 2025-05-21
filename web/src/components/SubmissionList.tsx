import React from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Submission } from "../types/submission";
import { ContestConfig } from "../types/contest";
import { WomanOutlined, StarOutlined } from "@ant-design/icons";
import { getContrastColor } from "../utils/colorUtils";
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

  // 格式化状态文本
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const columns: ColumnsType<Submission> = [
    {
      title: "题目",
      dataIndex: "problem_id",
      key: "problem_id",
      width: 80,
      align: "center",
      fixed: "left",
      render: (problem_id: string) => {
        // 将题号转换为索引 (A->0, B->1, etc.)
        const index = problem_id.charCodeAt(0) - 65;
        let backgroundColor = "#1890ff";
        let color = "white";

        // 如果有气球颜色配置，使用配置的颜色
        if (contestConfig.balloon_color && contestConfig.balloon_color[index]) {
          const balloon = contestConfig.balloon_color[index];
          if (balloon.background_color) {
            backgroundColor = balloon.background_color;
            // 根据背景色自动计算对比度良好的文字颜色
            color = getContrastColor(balloon.background_color);
          }
        }

        return (
          <div className="problem-cell-container">
            <div 
              className="problem-id-tag"
              style={{ 
                backgroundColor,
                color
              }}
            >
              {problem_id}
            </div>
          </div>
        );
      },
    },
    {
      title: "学校",
      dataIndex: "organization",
      key: "organization",
      width: "20%",
      ellipsis: true,
    },
    {
      title: "队伍",
      dataIndex: "team",
      key: "team",
      width: "30%",
      ellipsis: true,
      render: (team: string, record: Submission) => (
        <span>
          {team}
          {record.girl && <WomanOutlined style={{ marginLeft: 8, color: '#eb2f96' }} />}
          {record.unofficial && <StarOutlined style={{ marginLeft: 8, color: '#faad14' }} />}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status: string) => {
        const formattedStatus = status.toLowerCase();
        const statusClass = `status-${formattedStatus}`;
        return <span className={statusClass}>{formatStatus(status)}</span>;
      },
    },
    {
      title: "语言",
      dataIndex: "language",
      key: "language",
      width: 100,
      align: "center",
    },
    {
      title: "提交时间",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
      align: "center",
      render: (timestamp: number) => formatRelativeTime(timestamp),
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
        scroll={{ x: "100%" }}
      />
    </div>
  );
};

export default SubmissionList; 