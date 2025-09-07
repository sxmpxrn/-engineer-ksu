"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import CourseSidebar from "./component/CourseSidebar";
import CourseTable from "./component/CourseTable";
import CourseInputForm from "./component/CourseInputForm";

export default function CourseExplorerPage() {
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [visibleDesc, setVisibleDesc] = useState({});
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [similarCourses, setSimilarCourses] = useState([]);
  const [aiMessage, setAiMessage] = useState("");
  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("ce_course")
        .select(
          "id, course_group, course_type, course_code, course_name, credit_structure, description"
        );

      if (error) {
        console.error("Error fetching courses:", error.message);
        return;
      }

      const grouped = data.reduce((acc, c) => {
        acc[c.course_group] = acc[c.course_group] || [];
        acc[c.course_group].push(c);
        return acc;
      }, {});
      setGroups(grouped);
    }

    fetchCourses();
  }, []);

  const toggleDesc = (id) => {
    setVisibleDesc((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const checkCourseWithAI = async () => {
    if (!inputs.code || !inputs.name || !inputs.description) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    setSimilarCourses([]);
    setAiMessage("");

    try {
      const response = await fetch("/api/api_ce_course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputCourse: inputs }),
      });

      const data = await response.json();

      if (
        data.found &&
        Array.isArray(data.similar_courses) &&
        data.similar_courses.length > 0
      ) {
        setSimilarCourses(data.similar_courses);
        setAiMessage(data.message || "AI พบวิชาคล้ายกัน");
      } else {
        setSimilarCourses([]);
        setAiMessage(data.message || "ไม่พบวิชาที่คล้ายกัน");
      }
    } catch (error) {
      setAiMessage("เกิดข้อผิดพลาด");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-blue-700 drop-shadow">
          หมวดหมู่รายวิชา
        </h3>

        <div className="flex flex-col md:flex-row gap-6">
          <CourseSidebar
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />

          <main className="md:w-3/4 bg-white/90 shadow-xl rounded-2xl p-6 border border-blue-100">
            {selectedGroup ? (
              <>
                <h4 className="font-bold text-2xl mb-5 text-blue-700 flex items-center gap-2">
                  <span>🗂️</span> {selectedGroup}
                </h4>

                <CourseTable
                  courses={groups[selectedGroup]}
                  visibleDesc={visibleDesc}
                  toggleDesc={toggleDesc}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-blue-400">
                <span className="text-6xl mb-2">📑</span>
                <p className="text-lg">เลือกรายวิชาจากหมวดหมู่ด้านซ้าย</p>
              </div>
            )}

            <CourseInputForm
              inputs={inputs}
              onChange={handleInputChange}
              onSubmit={checkCourseWithAI}
              loading={loading}
            />

            {/* แสดงข้อความจาก AI */}
            {aiMessage && (
              <p className="mt-6 text-blue-700 font-semibold">{aiMessage}</p>
            )}

            {/* แสดงตารางวิชาคล้ายกัน */}
            {similarCourses.length > 0 && (
              <table className="w-full mt-4 border border-blue-300 rounded-lg overflow-hidden text-left">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-3 border-b border-blue-300">ลำดับ</th>
                    <th className="p-3 border-b border-blue-300">รหัสวิชา</th>
                    <th className="p-3 border-b border-blue-300">ชื่อวิชา</th>
                  </tr>
                </thead>
                <tbody>
                  {similarCourses.map((course, index) => (
                    <tr
                      key={course.course_code}
                      className="odd:bg-white even:bg-blue-50"
                    >
                      <td className="p-3 border-b border-blue-300">
                        {index + 1}
                      </td>
                      <td className="p-3 border-b border-blue-300">
                        {course.course_code}
                      </td>
                      <td className="p-3 border-b border-blue-300">
                        {course.course_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
