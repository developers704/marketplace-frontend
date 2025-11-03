interface TableRow {
  label: string;
  value: string | number;
}

interface DynamicTableProps {
  title?: string;
  data: TableRow[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({ title, data }) => {
  return (
    <div className="w-full max-w-2xl mx-auto border border-gray-300 rounded-lg">
      {title && (
        <div className="bg-gray-200 p-3 font-bold text-lg">{title}</div>
      )}
      <table className="w-full border-collapse">
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b">
              <td className="p-3 font-semibold text-gray-700 w-1/2">
                {row.label}
              </td>
              <td className="p-3 text-gray-900">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
