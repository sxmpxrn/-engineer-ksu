"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CourseTable() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("ce_course").select("*");

      if (error) {
        setError(error.message);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  if (loading) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-600">เกิดข้อผิดพลาด: {error}</p>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        รายวิชา (ce_course)
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                ID
              </th>
              <th className="px-15 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                กลุ่มรายวิชา
              </th>
              <th className="px-6 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                ประเภท
              </th>
              <th className="px-8 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                รหัสรายวิชา
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                ชื่อรายวิชา
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                หน่วยกิต
              </th>
              <th className="px-20 py-2 text-center text-sm font-semibold text-gray-700">
                รายละเอียด
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.id}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.course_group}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.course_type}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.course_code}
                  </td>
                  <td className="px-4 whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.course_name}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                    {course.credit_structure}
                  </td>
                  <td className="px-4 py-2 text-sm">{course.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
