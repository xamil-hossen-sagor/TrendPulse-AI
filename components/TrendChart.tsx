import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { KeywordData } from '../types';

interface TrendChartProps {
  data: KeywordData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
        No data available to visualize
      </div>
    );
  }

  // Sort data by volume for better visualization
  const sortedData = [...data].sort((a, b) => b.volume - a.volume).slice(0, 8);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="keyword" 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value < 1000 ? value : `${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            formatter={(value: number) => [value, 'Daily Searches']}
          />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
