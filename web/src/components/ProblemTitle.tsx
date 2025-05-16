import React from "react";
import "../styles/Contest.css";

interface ProblemTitleProps {
  problemId: string;
  backgroundColor?: string;
  color?: string;
}

const ProblemTitle: React.FC<ProblemTitleProps> = ({
  problemId,
  backgroundColor = "#1890ff",
  color = "white",
}) => {
  return (
    <div
      className="problem-title problem-title-content"
      style={{ backgroundColor, color }}
    >
      {problemId}
    </div>
  );
};

export default ProblemTitle;
