"use client";
import React, { Fragment } from "react";

export default function CourseTable({ courses, visibleDesc, toggleDesc }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-blue-100 mb-4">
      <table className="table-auto w-full text-sm">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3">รหัสวิชา</th>
            <th className="p-3">ประเภท</th>
            <th className="p-3">ชื่อวิชา</th>
            <th className="p-3">หน่วยกิจกำหนด</th>
            <th className="p-3 text-center">สถานะ</th>
            <th className="p-3 text-center">คำอธิบาย</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c, idx) => (
            <Fragment key={c.id}>
              <tr
                className={`transition ${
                  idx % 2 === 0 ? "bg-white" : "bg-blue-50"
                } hover:bg-blue-200/40`}
              >
                <td className="p-3">{c.course_code}</td>
                <td className="p-3">{c.course_type}</td>
                <td className="p-3">{c.course_name}</td>
                <td className="p-3">{c.credit_structure}</td>
                <td className="p-3">{c.state}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleDesc(c.id)}
                    title="ดูคำอธิบาย"
                    className="text-blue-600 hover:text-blue-900 transition text-lg"
                  >
                    {visibleDesc[c.id] ? "🔽" : "🔍"}
                  </button>
                </td>
              </tr>
              {visibleDesc[c.id] && (
                <tr className="bg-blue-50">
                  <td colSpan={5} className="p-4 border-t text-blue-900">
                    <strong>คำอธิบาย:</strong>{" "}
                    {c.description || "ไม่มีคำอธิบาย"}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
