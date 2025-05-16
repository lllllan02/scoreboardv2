import React from "react";
import "../styles/Contest.css";

interface DirtCellProps {
  dirtValue: number;
}

const DirtCell: React.FC<DirtCellProps> = ({ dirtValue }) => {
  const dirtPercent = Math.round(dirtValue * 100);
  return `${dirtPercent}%`;
};

export default DirtCell;
