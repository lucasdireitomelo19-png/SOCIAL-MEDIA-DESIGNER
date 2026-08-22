"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMoney } from "@/lib/format";

type Point = { date: string; revenue: number; orders: number };

export function RevenueChart({ data }: { data: Point[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.date.slice(5).replace("-", "/"),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1c1917" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1c1917" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#78716c" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatMoney(v).replace(",00", "")}
            width={70}
          />
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            labelFormatter={(label) => `Dia ${label}`}
            contentStyle={{ borderRadius: 8, borderColor: "#e7e5e4", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#1c1917"
            fill="url(#revenueColor)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
