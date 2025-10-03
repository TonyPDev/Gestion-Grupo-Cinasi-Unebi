import React from "react";
import { Users, FileText, Activity, Settings } from "lucide-react";

const actions = [
  { icon: Users, label: "Usuarios", color: "blue" },
  { icon: FileText, label: "Reportes", color: "purple" },
  { icon: Activity, label: "Actividad", color: "green" },
  { icon: Settings, label: "Config", color: "orange" },
];

export default function QuickActions({ onActionClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => onActionClick?.(action.label)}
              className={`p-4 text-center rounded-lg border-2 border-gray-200 hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
