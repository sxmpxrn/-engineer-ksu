"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CourseExplorer() {
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [visibleDesc, setVisibleDesc] = useState({});
  const [loading, setLoading] = useState(false);

  // For input form (not saved)
  const [inputs, setInputs] = useState({
    code: "",
    name: "",
    description: ""
  });

  const checkCourseWithAI = async () => {
  if (!inputs.code.trim() || !inputs.name.trim() || !inputs.description.trim()) {
    alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch("/api/ce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputCourse: inputs }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API responded with error:", response.status, errorBody);
      throw new Error("Response not ok");
    }

    const data = await response.json();
    if (data.course_code && data.course_name) {
      alert(`รหัสวิชา: ${data.course_code}\nชื่อวิชา: ${data.course_name}\n${data.message || ""}`);
    } else {
      alert(data.message || "ไม่พบวิชาที่คล้ายกัน");
    }
  } catch (error) {
    alert("เกิดข้อผิดพลาด");
    console.error("Error in checkCourseWithAI:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("ce_course")
        .select("id, course_group, course_type, course_code, course_name, credit_structure, description");

      if (error) {
        console.error("Error fetching courses:", error.message);
        return;
      }

      // Group by course_type
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
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-blue-700 drop-shadow">
        หมวดหมู่รายวิชา
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-1/4 bg-white/80 shadow-lg rounded-2xl p-6 border border-blue-100">
          <h4 className="font-bold text-xl mb-4 text-blue-800 flex items-center gap-2">
            <span>📚</span> หมวดหมู่รายวิชา
          </h4>
          <div className="space-y-2">
            {Object.keys(groups).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedGroup(type)}
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

        {/* Main Content */}
        <main className="md:w-3/4 bg-white/90 shadow-xl rounded-2xl p-6 border border-blue-100">
          {selectedGroup ? (
            <>
              <h4 className="font-bold text-2xl mb-5 text-blue-700 flex items-center gap-2">
                <span>🗂️</span> {selectedGroup}
              </h4>

              <div className="overflow-x-auto rounded-lg border border-blue-100 mb-4">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-blue-100 text-blue-900">
                    <tr>
                      <th className="p-3">รหัสวิชา</th>
                      <th className="p-3">ประเภท</th>
                      <th className="p-3">ชื่อวิชา</th>
                      <th className="p-3">หน่วยกิจกำหนด</th>
                      <th className="p-3 text-center">คำอธิบาย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[selectedGroup].map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-200/40`}
                      >
                        <td className="p-3">{c.course_code}</td>
                        <td className="p-3">{c.course_type}</td>
                        <td className="p-3">{c.course_name}</td>
                        <td className="p-3">{c.credit_structure}</td>
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Descriptions */}
              {groups[selectedGroup].map(
                (c) =>
                  visibleDesc[c.id] && (
                    <div
                      key={`desc-${c.id}`}
                      className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-3 rounded-lg shadow-inner"
                    >
                      <strong className="text-blue-800">คำอธิบาย:</strong> {c.description}
                    </div>
                  )
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-blue-400">
              <span className="text-6xl mb-2">📑</span>
              <p className="text-lg">เลือกรายวิชาจากหมวดหมู่ด้านซ้าย</p>
            </div>
          )}

          {/* Input Form */}
          <section className="mt-10 bg-gradient-to-r from-blue-50 to-white p-6 border rounded-2xl shadow-inner">
            <h4 className="font-bold text-xl mb-4 text-blue-700 flex items-center gap-2">
              <span>📝</span> กรอกข้อมูล (ไม่บันทึก)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <input
                name="code"
                value={inputs.code}
                onChange={handleInputChange}
                placeholder="รหัสวิชา"
                className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
              />
              <input
                name="name"
                value={inputs.name}
                onChange={handleInputChange}
                placeholder="ชื่อวิชา"
                className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
              />
              <input
                name="description"
                value={inputs.description}
                onChange={handleInputChange}
                placeholder="คำอธิบายรายวิชา"
                className="border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white shadow-sm"
              />
            </div>

            <button
              onClick={checkCourseWithAI}
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
        </main>
      </div>
    </div>
  </div>
);
}
