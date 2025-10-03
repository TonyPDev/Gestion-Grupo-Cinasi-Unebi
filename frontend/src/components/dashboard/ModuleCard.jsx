import React from "react";
import { ArrowRight } from "lucide-react";

export default function ModuleCard({ module, onClick }) {
  const Icon = module.icon;

  return (
    <div
      onClick={() => onClick(module.route)}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-90`}
      />

      <div className="relative p-8 h-64 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div className="space-y-2">
          <h4 className="text-2xl font-bold text-white">{module.title}</h4>
          <p className="text-white/90 text-sm">{module.description}</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
