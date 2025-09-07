"use client";
import React from "react";

export default function CourseSidebar({ groups, selectedGroup, onSelectGroup }) {
  return (
    <aside className="md:w-1/4 bg-white/80 shadow-lg rounded-2xl p-6 border border-blue-100">
      <h4 className="font-bold text-xl mb-4 text-blue-800 flex items-center gap-2">
        <span>📚</span> หมวดหมู่รายวิชา
      </h4>
      <div className="space-y-2">
        {Object.keys(groups).map((type) => (
          <button
            key={type}
            onClick={() => onSelectGroup(type)}
            className={`flex items-center w-full text-left px-4 py-2 rounded-lg transition font-medium shadow-sm
              ${
                selectedGroup === type
                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-800"
              }
            `}
          >
            <span className="mr-2">📂</span>
            <span className="flex-1">{type}</span>
            <span className="bg-blue-200 text-blue-800 rounded-full px-2 py-0.5 text-xs ml-2">
              {groups[type].length}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
