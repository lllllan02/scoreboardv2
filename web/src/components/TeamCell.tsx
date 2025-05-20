/**
 * TeamCell 组件 - 队伍名称单元格
 * 用于在排行榜中展示队伍名称，并在女队名称旁添加标识
 */

import React from "react";
import { Tooltip } from "antd";
import { WomanOutlined } from "@ant-design/icons";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface TeamCellProps
 * @property {string} teamName - 队伍名称
 * @property {boolean} [isGirlTeam] - 是否为女队
 */
interface TeamCellProps {
  teamName: string;
  isGirlTeam?: boolean;
}

/**
 * TeamCell 组件实现
 * @param {TeamCellProps} props - 组件属性
 */
const TeamCell: React.FC<TeamCellProps> = ({ teamName, isGirlTeam }) => {
  return (
    <div className="team-cell">
      <span className="team-name" title={teamName}>
        {teamName}
      </span>
      {isGirlTeam && (
        <Tooltip title="女队">
          <WomanOutlined className="girl-team-icon" />
        </Tooltip>
      )}
    </div>
  );
};

export default TeamCell; 