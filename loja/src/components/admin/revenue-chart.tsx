"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function RevenueChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d1522f" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d1522f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => value.slice(8, 10) + "/" + value.slice(5, 7)}
            tick={{ fontSize: 11, fill: "#8a8580" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8a8580" }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(value: number) => `R$${value}`}
          />
          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
              "Receita",
            ]}
            labelFormatter={(label) => `Dia ${String(label).slice(8, 10)}/${String(label).slice(5, 7)}`}
          />
          <Area type="monotone" dataKey="total" stroke="#d1522f" fill="url(#revenue)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
