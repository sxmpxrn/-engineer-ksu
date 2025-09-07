import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables");
}
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    let inputCourse;
    try {
      ({ inputCourse } = await req.json());
      if (!inputCourse?.code || !inputCourse?.name || !inputCourse?.description) {
        return Response.json({ error: "ข้อมูล inputCourse ไม่ครบถ้วน" }, { status: 400 });
      }
    } catch (err) {
      return Response.json({ error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" }, { status: 400 });
    }

    // ดึงวิชาทั้งหมดจาก ce_course
    const { data: allCourses, error: ceError } = await supabase
      .from("ce_course")
      .select("course_code, course_name, description")
      .limit(100);

    if (ceError) {
      return Response.json({ error: "เกิดข้อผิดพลาดในการดึง ce_course" }, { status: 500 });
    }

    // ✅ PROMPT ใหม่
    const prompt = `
โปรดตรวจสอบว่ารายวิชาใหม่ด้านล่างนี้มีความคล้ายกับรายวิชาใดในระบบหรือไม่ โดยพิจารณาจากคำอธิบายรายวิชาเป็นหลัก

📌 รายวิชาใหม่:
- รหัสวิชา: ${inputCourse.code}
- ชื่อวิชา: ${inputCourse.name}
- คำอธิบาย: ${inputCourse.description}

📚 รายวิชาในระบบ:
${allCourses.map((c, i) => `(${i + 1}) ${c.course_code} - ${c.course_name}\nคำอธิบาย: ${c.description}`).join("\n\n")}

กรุณาตอบกลับโดยใช้รูปแบบดังนี้:

ถ้าพบรายวิชาคล้ายกัน:
รหัสวิชา: <รหัสวิชาที่คล้ายกัน>
ชื่อวิชา: <ชื่อวิชาที่คล้ายกัน>

ถ้าไม่พบวิชาคล้ายกัน:
ไม่พบวิชาที่คล้ายกัน
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim();

    let matchedCode = null;
    let matchedName = null;

    if (!responseText.includes("ไม่พบวิชาที่คล้ายกัน")) {
      matchedCode = responseText.match(/รหัสวิชา:\s*(.+)/)?.[1]?.trim();
      matchedName = responseText.match(/ชื่อวิชา:\s*(.+)/)?.[1]?.trim();
    }

    if (matchedCode && matchedName) {
      return Response.json({
        course_code: matchedCode,
        course_name: matchedName,
        found: true,
        message: "AI พบวิชาคล้ายกัน"
      });
    } else {
      return Response.json({
        course_code: null,
        course_name: null,
        found: false,
        message: "ไม่พบวิชาที่คล้ายกัน"
      });
    }
  } catch (err) {
    return Response.json({ error: `เกิดข้อผิดพลาดไม่คาดคิด: ${err.message}` }, { status: 500 });
  }
}
