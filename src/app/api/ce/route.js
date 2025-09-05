import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ใช้ env ที่ถูกต้อง
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
  baseURL: "https://api.opentyphoon.ai/v1",
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

    // 1. ตรวจสอบ ce_course_check
    const { data: checkRows, error: checkError } = await supabase
  .from("ce_course_check")
  .select("course_code_check, course_name_check")
  .match({
    course_code_check: inputCourse.code,
    course_name_check: inputCourse.name,
  });

    if (checkError) {
      console.error("Supabase checkError:", checkError); // เพิ่มบรรทัดนี้
      return Response.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบ", detail: checkError.message }, { status: 500 });
    }

    if (checkRows && checkRows.length > 0) {
      // พบใน ce_course_check
      return Response.json({
        course_code: checkRows[0].course_code,
        course_name: checkRows[0].course_name,
        found: true,
        message: "พบในฐานข้อมูล"
      });
    }

    // 2. ใช้ AI Typhoon ตรวจสอบกับ ce_course (เน้น description)
    const { data: allCourses, error: ceError } = await supabase
      .from("ce_course")
      .select("course_code, course_name, description")
      .limit(100);

    if (ceError) {
      return Response.json({ error: "เกิดข้อผิดพลาดในการดึง ce_course" }, { status: 500 });
    }

    const prompt = `
รหัสวิชา: ${inputCourse.code}
ชื่อวิชา: ${inputCourse.name}
คำอธิบาย: ${inputCourse.description}

รายการวิชาในระบบ:
${allCourses.map((c, i) => `(${i + 1}) ${c.course_code} - ${c.course_name}: ${c.description}`).join("\n")}

คำถาม: จากรายการข้างต้น มีวิชาใดที่ description ตรงหรือคล้ายกับวิชาที่ผู้ใช้เพิ่มหรือไม่?

❗ ตอบในรูปแบบ:
รหัสวิชา: <CODE>
ชื่อวิชา: <NAME>

ถ้าไม่มีวิชาคล้ายกัน ตอบเฉพาะ:
ไม่พบวิชาที่คล้ายกัน
`;

    const completion = await openai.chat.completions.create({
      model: "typhoon-v2.1-12b-instruct",
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
      // เพิ่มเข้า ce_course_check
      await supabase.from("ce_course_check").insert([
  {
    course_code: matchedCode,
    course_name: matchedName,
    course_code_check: inputCourse.code,
    course_name_check: inputCourse.name,
  },
]);

      return Response.json({
        course_code: matchedCode,
        course_name: matchedName,
        found: false,
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