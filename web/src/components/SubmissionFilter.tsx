import React from "react";
import { Select, Space } from "antd";
import "../styles/Contest.css";
import { formatStatus } from "../utils/stringUtils";

interface SubmissionFilterProps {
  schools: string[];
  teams: { team_id: string; team: string }[];
  languages: string[];
  statuses: string[];
  currentFilters: {
    school?: string;
    team?: string;
    language?: string;
    status?: string;
  };
  onFilterChange: (filters: {
    school?: string;
    team?: string;
    language?: string;
    status?: string;
  }) => void;
}

const SubmissionFilter: React.FC<SubmissionFilterProps> = ({
  schools,
  teams,
  languages,
  statuses,
  currentFilters,
  onFilterChange,
}) => {
  const handleChange = (type: string, value: string | undefined) => {
    onFilterChange({ [type]: value });
  };

  return (
    <div className="submission-filter">
      <Space wrap>
        <Select
          allowClear
          placeholder="选择学校"
          style={{ width: 200 }}
          onChange={(value) => handleChange("school", value)}
          options={schools.map((school) => ({
            value: school,
            label: school,
          }))}
          value={currentFilters.school}
        />
        <Select
          allowClear
          placeholder="选择队伍"
          style={{ width: 200 }}
          onChange={(value) => handleChange("team", value)}
          options={teams.map((team) => ({
            value: team.team_id,
            label: team.team,
          }))}
          showSearch
          optionFilterProp="label"
          value={currentFilters.team}
        />
        <Select
          allowClear
          placeholder="选择语言"
          style={{ width: 150 }}
          onChange={(value) => handleChange("language", value)}
          options={languages.map((language) => ({
            value: language,
            label: language,
          }))}
          value={currentFilters.language}
        />
        <Select
          allowClear
          placeholder="选择状态"
          style={{ width: 150 }}
          onChange={(value) => handleChange("status", value)}
          options={statuses.map((status) => ({
            value: status,
            label: (
              <span className={`status-text-${status.toLowerCase()}`}>
                {formatStatus(status)}
              </span>
            ),
          }))}
          value={currentFilters.status}
        />
      </Space>
    </div>
  );
};

export default SubmissionFilter;
