import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ✅ ตรวจสอบ Environment Variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

// ✅ สร้าง Supabase และ OpenAI client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ✅ MAIN API HANDLER
export async function POST(req) {
  try {
    // [1] 📥 รับ inputCourse จาก request body
    let inputCourse;
    try {
      ({ inputCourse } = await req.json());
      const { code, name, description } = inputCourse || {};
      if (!code || !name || !description) {
        return Response.json({ error: "ข้อมูล inputCourse ไม่ครบถ้วน" }, { status: 400 });
      }
    } catch (err) {
      return Response.json({ error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" }, { status: 400 });
    }

    // [2] 🗃️ ดึงข้อมูลรายวิชาทั้งหมดจาก Supabase (ce_course)
    const { data: allCourses, error: ceError } = await supabase
      .from("ce_course")
      .select("course_code, course_name, description")
      .limit(100);

    if (ceError || !allCourses) {
      return Response.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" }, { status: 500 });
    }

    // [3] 🧠 สร้าง Prompt ส่งให้ AI Typhoon วิเคราะห์
    const prompt = `
โปรดตรวจสอบว่ารายวิชาใหม่ด้านล่างนี้มีความคล้ายกับรายวิชาใดในระบบหรือไม่ โดยพิจารณาจากรหัสวิชา ชื่อวิชา คำอธิบายรายวิชาเป็นหลัก

📌 รายวิชาใหม่:
- รหัสวิชา: ${inputCourse.code}
- ชื่อวิชา: ${inputCourse.name}
- คำอธิบาย: ${inputCourse.description}

📚 รายวิชาในระบบ:
${allCourses.map((c, i) => `(${i + 1}) ${c.course_code} - ${c.course_name}\nคำอธิบาย: ${c.description}`).join("\n\n")}

กรุณาตอบกลับโดยใช้รูปแบบนี้ (แยกแต่ละวิชาด้วยบรรทัดว่าง):

รหัสวิชา: <รหัสวิชาที่คล้ายกัน>
ชื่อวิชา: <ชื่อวิชาที่คล้ายกัน>

ถ้าไม่พบวิชาคล้ายกัน:
ไม่พบวิชาที่คล้ายกัน
    `.trim();

    // [4] 📤 ส่ง prompt ไปให้ AI ประมวลผล
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim();

    // [5] 🔍 วิเคราะห์คำตอบจาก AI
    let similarCourses = [];

    if (responseText && !responseText.includes("ไม่พบวิชาที่คล้ายกัน")) {
      const matches = [...responseText.matchAll(/รหัสวิชา:\s*(.+)\nชื่อวิชา:\s*(.+)/g)];
      similarCourses = matches.map(m => ({
        course_code: m[1].trim(),
        course_name: m[2].trim(),
      }));
    }

    // [6] 📦 ส่งผลลัพธ์กลับ client
    if (similarCourses.length > 0) {
      return Response.json({
        found: true,
        similar_courses: similarCourses,
        message: "AI พบวิชาคล้ายกัน"
      });
    } else {
      return Response.json({
        found: false,
        similar_courses: [],
        message: "ไม่พบวิชาที่คล้ายกัน"
      });
    }

  } catch (err) {
    return Response.json({
      error: `เกิดข้อผิดพลาดไม่คาดคิด: ${err.message}`
    }, { status: 500 });
  }
}
