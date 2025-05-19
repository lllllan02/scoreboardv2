import React, { useState } from "react";
import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import { ContestConfig } from "../types/contest";

interface GroupFilterProps {
  contestConfig: ContestConfig;
  onChange: (values: { group: string; action: string }) => void;
}

const GroupFilter: React.FC<GroupFilterProps> = ({
  contestConfig,
  onChange,
}) => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedAction, setSelectedAction] = useState('rank');

  const handleGroupChange = (e: RadioChangeEvent) => {
    const newGroup = e.target.value;
    setSelectedGroup(newGroup);
    onChange({ group: newGroup, action: selectedAction });
  };

  const handleActionChange = (e: RadioChangeEvent) => {
    const newAction = e.target.value;
    setSelectedAction(newAction);
    onChange({ group: selectedGroup, action: newAction });
  };

  return (
    <div className="filter-container">
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
          {contestConfig.group &&
            Object.entries(contestConfig.group).map(([key, name]) => (
              <Radio.Button key={key} value={key}>
                {name}
              </Radio.Button>
            ))}
        </Radio.Group>
      </div>

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
