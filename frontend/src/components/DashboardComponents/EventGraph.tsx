import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

// Sample data for the BarChart
const data = [
  { month: "JAN", value: 80 },
  { month: "FEB", value: 45 },
  { month: "MAR", value: 40 },
  { month: "APR", value: 55 },
  { month: "MAY", value: 20 },
  { month: "JUN", value: 40 },
  { month: "JUL", value: 75 },
  { month: "AUG", value: 45 },
  { month: "SEP", value: 50 },
  { month: "OCT", value: 40 },
  { month: "NOV", value: 60 },
  { month: "DEC", value: 85 },
];

export function EventGraph() {
  return (
    <Card className="w-full bg-card shadow-lg border border-gray-200">
      <CardHeader>
        <div className="text-lg font-semibold text-gray-900">Event Graph</div>
      </CardHeader>
      <CardContent className="h-[300px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            {/* Subtle grid lines for a clean background */}
            <CartesianGrid horizontal={true} vertical={false} strokeDasharray="4 4" stroke="#E5E7EB" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#4B5563" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#4B5563" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "#333", borderRadius: "8px", padding: "8px" }} 
              labelStyle={{ color: "#fff" }} 
              itemStyle={{ color: "#fff" }} 
            />
            <Legend verticalAlign="top" height={36} />
            {/* Remove the value label from the Bar */}
            <Bar 
              dataKey="value" 
              fill="#A9A9A9" 
              radius={[6, 6, 0, 0]} 
              barSize={30} 
              className="transition-all duration-300 hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}