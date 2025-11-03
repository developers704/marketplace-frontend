import React from 'react';

interface TableRow {
  icon?: string; // Optional icon class (from Lucide or FontAwesome)
  label: string; // Label for the row
  value: string | JSX.Element; // Text or React element (for links, bold text)
}

interface Props {
  data: TableRow[];
  courseData?: any; // Optional course data
}

const CourseInfoTable: React.FC<Props> = ({ data, courseData }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md w-full bg-white">
      {data.map((row, index) => (
        <div
          key={index}
          className="flex border-b last:border-none py-3 px-4 items-center"
        >
          {/* Icon (optional) */}
          {row.icon && (
            <span className="mr-3 text-gray-500 text-lg">
              <i className={row.icon}></i>
            </span>
          )}

          {/* Label & Value */}
          <div className="flex-1">
            <strong className="block text-gray-700">{row.label}</strong>
          </div>
          <div className="text-gray-900 flex-[2]">{row.value}</div>
        </div>
      ))}
    </div>
  );
};

export default CourseInfoTable;
