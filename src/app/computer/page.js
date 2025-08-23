"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ComputerPage() {
  const [currentCourses, setCurrentCourses] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previousCourses, setPreviousCourses] = useState([]);
  const [comparisonResults, setComparisonResults] = useState([]);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchCoursesFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from("ce_course")
          .select("id, course_code, course_name");

        if (error) throw error;

        const formattedCourses = data.map((course) => ({
          id: course.id,
          code: course.course_code,
          name: course.course_name,
          credits: 3, // ปรับตามข้อมูลจริงได้
        }));

        setCurrentCourses(formattedCourses);
      } catch (error) {
        console.error("Error loading courses from Supabase:", error.message);
      }
    };

    fetchCoursesFromSupabase();
  }, []);

  // ฟังก์ชันเรียก API อัพโหลดไฟล์ PDF และรับข้อมูลรายวิชา (code, name, grade)
  async function handleFile(file) {
  const formData = new FormData();
  formData.append("file", file); // <-- ต้องเป็น 'file'

  const res = await fetch("/api/pdftransformation", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to parse PDF");

  const data = await res.json();

  const formatted = data.courses.map((c) => ({
    code: c.code,
    name: c.name,
    grade: c.grade,
    credits: 2,
  }));

  setPreviousCourses(formatted);
  setUploadedFile(file);
}

  function onFileInputChange(e) {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }

  function removePreviousCourse(code) {
    setPreviousCourses(previousCourses.filter((c) => c.code !== code));
  }

  // ฟังก์ชันเปรียบเทียบรายวิชา
  function compareSubjects() {
    const results = currentCourses.map((current) => {
      const match = previousCourses.find((prev) => {
        const currentWords = current.name.toLowerCase().split(" ");
        const prevWords = prev.name.toLowerCase().split(" ");
        const commonWords = currentWords.filter((word) =>
          prevWords.includes(word)
        );
        return commonWords.length > 0;
      });

      let status, statusColor, statusText;

      if (match) {
        const similarity = calculateSimilarity(current.name, match.name);
        if (similarity > 0.7) {
          status = "full";
          statusColor = "bg-green-500";
          statusText = `เทียบได้เต็ม (เกรด: ${match.grade || "-"})`;
        } else {
          status = "partial";
          statusColor = "bg-yellow-500";
          statusText = `เทียบได้บางส่วน (เกรด: ${match.grade || "-"})`;
        }
      } else {
        status = "none";
        statusColor = "bg-red-500";
        statusText = "เทียบไม่ได้";
      }

      return { current, match, status, statusColor, statusText };
    });

    setComparisonResults(results);
  }

  function calculateSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(" ");
    const words2 = str2.toLowerCase().split(" ");
    const commonWords = words1.filter((word) => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // Drag-drop handlers
  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ระบบเปรียบเทียบรายวิชา
            </h1>
            <p className="text-gray-600">
              อัพโหลดไฟล์และเปรียบเทียบรายวิชาที่เรียนมาแล้ว
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              อัพโหลดไฟล์รายวิชา
            </h2>
            <div
              id="dropZone"
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="text-xl text-gray-600 mb-2">
                  ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className="text-sm text-gray-400">
                  รองรับไฟล์ PDF, Excel, Word
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={onFileInputChange}
              />
            </div>

            {uploadedFile && (
              <div className="mt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg
                    className="w-6 h-6 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-green-700 font-medium">
                    {uploadedFile.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Courses Tables Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Courses */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  รายวิชา (ce_course)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          ID
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          รหัสรายวิชา
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                          ชื่อรายวิชา
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentCourses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-4 text-gray-500"
                          >
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      ) : (
                        currentCourses.map((course) => (
                          <tr
                            key={course.id || course.code}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-2 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                              {course.id || "-"}
                            </td>
                            <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm">
                              {course.code}
                            </td>
                            <td className="px-4 whitespace-nowrap py-2 text-sm">
                              {course.name}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Previous Courses */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  รายวิชาที่เคยเรียน (ปวส.)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          รหัสรายวิชา
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          ชื่อรายวิชา
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-r border-gray-300">
                          เกรด
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                          ลบ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previousCourses.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-4 text-gray-500"
                          >
                            ไม่มีข้อมูล
                          </td>
                        </tr>
                      ) : (
                        previousCourses.map(({ code, name, grade }) => (
                          <tr key={code} className="hover:bg-gray-50">
                            <td className="px-4 text-center whitespace-nowrap py-2 border-r border-gray-300 text-sm text-green-700 font-medium">
                              {code}
                            </td>
                            <td className="px-4 whitespace-nowrap py-2 text-sm">
                              {name}
                            </td>
                            <td className="px-4 text-center whitespace-nowrap py-2 text-sm font-semibold">
                              {grade || "-"}
                            </td>
                            <td className="px-4 text-center py-2">
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removePreviousCourse(code)}
                                aria-label={`Remove previous course ${code}`}
                              >
                                <svg
                                  className="w-4 h-4 inline"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  ></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <div className="text-center mt-12">
            <button
              className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-indigo-700 transition"
              onClick={compareSubjects}
            >
              เปรียบเทียบรายวิชา
            </button>
          </div>

          {/* Comparison Results */}
          {comparisonResults.length > 0 && (
            <div className="mt-12 max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                ผลการเปรียบเทียบรายวิชา
              </h2>
              <div className="space-y-4">
                {comparisonResults.map(
                  ({ current, match, statusText, statusColor }) => (
                    <div
                      key={current.code}
                      className={`rounded-lg p-4 flex justify-between items-center ${statusColor} bg-opacity-20`}
                    >
                      <div>
                        <p className="text-lg font-semibold">{current.name}</p>
                        <p className="text-sm text-gray-700">
                          รหัสวิชา: {current.code}
                        </p>
                      </div>
                      <div className="text-right">
                        {match ? (
                          <>
                            <p className="text-sm">
                              เทียบกับ: {match.name} ({match.code})
                            </p>
                            <p className="font-semibold">{statusText}</p>
                          </>
                        ) : (
                          <p className="font-semibold">{statusText}</p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
