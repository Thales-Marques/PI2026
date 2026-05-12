"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function StockChart({
  totalItems,
  maxCapacity,
}: {
  totalItems: number;
  maxCapacity: number;
}) {
  const cap = maxCapacity > 0 ? maxCapacity : 1;
  const used = Math.min(totalItems, cap);
  const free = Math.max(0, cap - used);
  const percent = (used / cap) * 100;

  const getColor = (p: number) => {
    if (p >= 90) return "#E11D48";
    if (p >= 75) return "#F59E0B";
    if (p >= 50) return "#0EA5E9";
    return "#009B8F";
  };

  const data = [{ value: used }, { value: free }];

  return (
    <div className="rounded-xl border border-[#D8E0EA] bg-white p-4 shadow-sm">
      <div className="h-32 w-full min-h-[128px] min-w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={38}
              outerRadius={52}
              startAngle={180}
              endAngle={0}
              dataKey="value"
            >
              <Cell fill={getColor(percent)} />
              <Cell fill="#E8EEF4" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="-mt-5 text-center">
        <p
          className="text-2xl font-semibold tabular-nums"
          style={{ color: getColor(percent) }}
        >
          {percent.toFixed(1)}%
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
          Ocupação
        </p>
      </div>
    </div>
  );
}
