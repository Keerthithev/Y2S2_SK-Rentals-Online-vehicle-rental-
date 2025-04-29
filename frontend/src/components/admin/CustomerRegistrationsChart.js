// src/components/CustomerRegistrationsChart.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import './CustomerRegisterationsChart.css'
// Dummy data for the graph (Replace with backend data in future)
const dummyData = [
  { date: "2024-03-01", count: 5 },
  { date: "2024-03-02", count: 8 },
  { date: "2024-03-03", count: 3 },
  { date: "2024-03-04", count: 10 },
  { date: "2024-03-05", count: 6 },
  { date: "2024-03-06", count: 12 },
  { date: "2024-03-07", count: 7 },
];

const CustomerRegistrationsChart = () => {
  return (
    <div className="chart-container" style={{ width: "100%", textAlign: "center" }}>
      <h3>📊 Customer Registrations (Per Day)</h3>
      <BarChart width={700} height={350} data={dummyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#4CAF50" />
      </BarChart>
    </div>
  );
};

export default CustomerRegistrationsChart;
