/**
 * GroupFilter 组件 - 比赛筛选器
 * 提供组别筛选和操作选择的功能界面
 */

import React, { useState } from "react";
import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { ContestConfig } from "../types/contest";

/**
 * 组件属性接口定义
 * @interface GroupFilterProps
 * @property {ContestConfig} contestConfig - 比赛配置信息
 * @property {Function} onChange - 选择变更时的回调函数，接收组别和操作类型
 */
interface GroupFilterProps {
  contestConfig: ContestConfig;
  onChange: (values: { group: string; action: string }) => void;
}

/**
 * GroupFilter 组件实现
 * @param {GroupFilterProps} props - 组件属性
 */
const GroupFilter: React.FC<GroupFilterProps> = ({
  contestConfig,
  onChange,
}) => {
  // 当前选中的组别，默认为 'all'
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  // 当前选中的操作类型，默认为 'rank'
  const [selectedAction, setSelectedAction] = useState('rank');

  /**
   * 处理组别选择变更
   * @param {RadioChangeEvent} e - 单选框变更事件
   */
  const handleGroupChange = (e: RadioChangeEvent) => {
    const newGroup = e.target.value;
    setSelectedGroup(newGroup);
    onChange({ group: newGroup, action: selectedAction });
  };

  /**
   * 处理操作类型选择变更
   * @param {RadioChangeEvent} e - 单选框变更事件
   */
  const handleActionChange = (e: RadioChangeEvent) => {
    const newAction = e.target.value;
    setSelectedAction(newAction);
    onChange({ group: selectedGroup, action: newAction });
  };

  return (
    <div className="filter-container">
      {/* 组别选择区域 */}
      <div className="button-group">
        <Radio.Group
          value={selectedGroup}
          onChange={handleGroupChange}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button key="all" value="all">
            所有队伍
          </Radio.Button>
          {/* 根据比赛配置动态渲染组别选项 */}
          {contestConfig.group &&
            Object.entries(contestConfig.group).map(([key, name]) => (
              <Radio.Button key={key} value={key}>
                {name}
              </Radio.Button>
            ))}
        </Radio.Group>
      </div>

      {/* 操作类型选择区域 */}
      <div className="button-group">
        <Radio.Group
          value={selectedAction}
          onChange={handleActionChange}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button key="scroll" value="scroll">
            滚榜
          </Radio.Button>
          <Radio.Button key="export" value="export">
            导出
          </Radio.Button>
          <Radio.Button key="stats" value="stats">
            统计
          </Radio.Button>
          <Radio.Button key="submit" value="submit">
            提交
          </Radio.Button>
          <Radio.Button key="rank" value="rank">
            排名
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
};

export default GroupFilter;
