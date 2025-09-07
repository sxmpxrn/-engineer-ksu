"use client";
import React from "react";

export default function CourseInputForm({ inputs, onChange, onSubmit, loading }) {
  return (
    <section className="mt-10 bg-gradient-to-r from-blue-50 to-white p-6 border rounded-2xl shadow-inner">
      <h4 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
        <span>📝</span> กรอกข้อมูล (ไม่บันทึก)
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <input
          name="code"
          value={inputs.code}
          onChange={onChange}
          placeholder="รหัสวิชา"
          className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
        />
        <input
          name="name"
          value={inputs.name}
          onChange={onChange}
          placeholder="ชื่อวิชา"
          className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
        />
        <input
          name="description"
          value={inputs.description}
          onChange={onChange}
          placeholder="คำอธิบายรายวิชา"
          className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg transition
          ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
          }
        `}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block mr-2">⏳</span>
            กำลังวิเคราะห์...
          </>
        ) : (
          <>
            <span>🤖</span> เริ่มวิเคราะห์
          </>
        )}
      </button>
    </section>
  );
}
