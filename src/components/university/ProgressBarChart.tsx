'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GraphItem {
  period: string;
  activities: number;
  quizzes: number;
  hours: number;
  date: string;
}

interface Props {
  graphData: any[];
  isLoading: boolean;
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  setSelectedPeriod: (value: 'daily' | 'weekly' | 'monthly') => void;
}

export function WeeklyProgressChart({
  graphData = [],
  isLoading,
  selectedPeriod,
  setSelectedPeriod,
}: any) {
  const transformedData = graphData?.map((item:any) => ({
    day: item.period,
    activities: item.activities,
    quizzes: item.quizzes,
  }));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Progress Chart</h2>
        <select
          className="border px-3 py-1 rounded-md text-sm cursor-pointer"
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')
          }
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={transformedData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="activities" fill="#3B82F6" name="Activities" />
            <Bar dataKey="quizzes" fill="#10B981" name="Quizzes" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
