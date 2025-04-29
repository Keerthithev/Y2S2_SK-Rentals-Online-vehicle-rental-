import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";

function StaffDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:1111/api/v1/maintenances")
      .then((res) => {
        setVehicles(res.data);
        checkReminders(res.data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  const checkReminders = (records) => {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);
    const overdue = records.filter(record => new Date(record.date) < tenDaysAgo);
    setReminders(overdue);
  };

  const totalCost = vehicles.reduce((sum, v) => sum + parseFloat(v.cost || 0), 0);
  const totalCount = vehicles.length;
  const reminderCount = reminders.length;

  const costByVehicle = [];
  vehicles.forEach((v) => {
    const found = costByVehicle.find(item => item.vehicleId === v.vehicleId);
    if (found) found.cost += parseFloat(v.cost || 0);
    else costByVehicle.push({ vehicleId: v.vehicleId, cost: parseFloat(v.cost || 0) });
  });

  const types = ["Oil Change", "Tire Replacement", "Brake Inspection", "Battery Replacement", "Other"];
  const costByType = types.map(type => ({
    name: type,
    cost: vehicles.filter(v => v.type === type).reduce((sum, v) => sum + parseFloat(v.cost || 0), 0)
  }));

  const dateMap = {};
  vehicles.forEach(v => {
    const date = v.date.split("T")[0];
    if (!dateMap[date]) dateMap[date] = 0;
    dateMap[date] += parseFloat(v.cost || 0);
  });
  const costByDate = Object.entries(dateMap).map(([date, cost]) => ({ date, cost }));

  const COLORS = ["#4299E1", "#48BB78", "#F6AD55", "#F56565", "#9F7AEA"];

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-gray-800">Vehicle Maintenance</div>
        <nav className="flex space-x-6">
          <a href="/staff" className="text-blue-600 font-medium hover:text-blue-800">Staff Dashboard</a>
          <a href="/list" className="text-gray-600 font-medium hover:text-gray-800">Maintenance List</a>
          <a href="/add" className="text-gray-600 font-medium hover:text-gray-800">Add Maintenance</a>
          <a href="/logout" className="text-gray-600 font-medium hover:text-gray-800">Logout</a>
        </nav>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Maintenances</div>
            <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Cost</div>
            <div className="text-2xl font-bold text-gray-800">Rs.{totalCost.toFixed(2)}</div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500 mb-2">Total Reminders</div>
            <div className="text-2xl font-bold text-gray-800">{reminderCount}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Cost by Vehicle</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costByVehicle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="vehicleId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cost" fill="#4299E1" name="Cost (Rs.)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Cost by Maintenance Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={costByType} 
                    dataKey="cost" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8" 
                    label
                  >
                    {costByType.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Cost Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#4299E1" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;