/**
 * TeamCell 组件 - 队伍名称单元格
 * 用于在排行榜中展示队伍名称，并在女队名称旁添加标识
 */

import React from "react";
import { Tooltip } from "antd";
import { WomanOutlined, StarOutlined } from "@ant-design/icons";
import "../styles/Contest.css";

/**
 * 组件属性接口定义
 * @interface TeamCellProps
 * @property {string} teamName - 队伍名称
 * @property {boolean} [isGirlTeam] - 是否为女队
 * @property {boolean} [isUnofficial] - 是否为非正式队伍
 */
interface TeamCellProps {
  teamName: string;
  isGirlTeam?: boolean;
  isUnofficial?: boolean;
}

/**
 * TeamCell 组件实现
 * @param {TeamCellProps} props - 组件属性
 */
const TeamCell: React.FC<TeamCellProps> = ({ teamName, isGirlTeam, isUnofficial }) => {
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
      {isUnofficial && (
        <Tooltip title="非正式队伍">
          <StarOutlined className="unofficial-team-icon" />
        </Tooltip>
      )}
    </div>
  );
};

export default TeamCell; 