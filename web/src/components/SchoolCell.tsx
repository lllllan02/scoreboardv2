import React from "react";
import "../styles/Contest.css";

interface SchoolCellProps {
  text: string;
  orgPlace: number;
}

const SchoolCell: React.FC<SchoolCellProps> = ({ text, orgPlace }) => {
  return (
    <div className="school-column-container">
      {orgPlace > 0 && <div className="school-org-place">{orgPlace}</div>}
      <div
        className={`school-name ${
          orgPlace > 0
            ? "school-name-with-padding"
            : "school-name-without-padding"
        }`}
        title={text}
      >
        {text}
      </div>
    </div>
  );
};

export default SchoolCell;
