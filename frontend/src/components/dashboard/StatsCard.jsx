import React from "react";

export default function StatsCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  color,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p
            className={`text-sm ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
