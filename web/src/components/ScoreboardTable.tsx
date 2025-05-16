import React from "react";
import { Table, Spin } from "antd";
import { ContestConfig } from "../types/contest";
import { Rank } from "../types/rank";
import useTableColumns from "./TableColumns";
import "../styles/Contest.css";

interface ScoreboardTableProps {
  contestConfig: ContestConfig;
  rankData: Rank;
  loading?: boolean;
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({
  contestConfig,
  rankData,
  loading = false,
}) => {
  // 获取表格列配置
  const columns = useTableColumns({ contestConfig, rankData });

  return (
    <div className="detail-scoreboard">
      <div style={{ position: 'relative' }}>
        {loading && (
          <div className="detail-table-loading-indicator">
            <Spin size="small" tip="更新数据..." />
          </div>
        )}
        <Table
          dataSource={rankData?.rows || []}
          columns={columns}
          rowKey="team_id"
          pagination={false}
          bordered={false}
          size="small"
          className="detail-scoreboard-table detail-scoreboard-table-fixed"
          tableLayout="fixed"
          scroll={{ x: true }}
          rowClassName={() => "compact-row"}
        />
      </div>
    </div>
  );
};

export default ScoreboardTable;
