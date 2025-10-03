import React from "react";
import { ArrowRight } from "lucide-react";

export default function ModuleCard({ module, onClick }) {
  const Icon = module.icon;

  return (
    <div
      onClick={() => onClick(module.route)}
      className="group relative bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg dark:shadow-black/20 overflow-hidden hover:shadow-2xl dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent dark:border-gray-700/50"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-10 dark:opacity-20`}
      />

      <div className="relative p-8 h-64 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
        </div>

        <div className="space-y-2">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            {module.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {module.description}
          </p>
        </div>
      </div>
    </div>
  );
}
