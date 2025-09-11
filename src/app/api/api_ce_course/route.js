import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ตรวจสอบ Environment Variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}
if (!process.env.TYPHOON_API_KEY) {
  throw new Error("Missing Typhoon API key");
}

// สร้าง Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// OpenAI clients
const openaiTyphoon = new OpenAI({
  apiKey: process.env.TYPHOON_API_KEY,
  baseURL: "https://api.opentyphoon.ai/v1",
});

const openaiOpenRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    // รับ inputCourse
    let inputCourse;
    try {
      ({ inputCourse } = await req.json());
      const { code, name, description } = inputCourse || {};
      if (!code || !name || !description) {
        return new Response(JSON.stringify({ error: "ข้อมูล inputCourse ไม่ครบถ้วน" }), { status: 400 });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" }), { status: 400 });
    }

    // ดึงข้อมูลรายวิชา
    const { data: allCourses, error: ceError } = await supabase
      .from("ce_courses")
      .select("course_code, course_name, description")
      .limit(100);

    if (ceError || !allCourses) {
      return new Response(JSON.stringify({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" }), { status: 500 });
    }

    // สร้าง Prompt สำหรับ OpenRouter
    const prompt = `
โปรดตรวจสอบว่ารายวิชาใหม่ด้านล่างนี้มีความคล้ายกับรายวิชาใดในระบบหรือไม่ โดยพิจารณาจากรหัสวิชา ชื่อวิชา คำอธิบายรายวิชาเป็นหลัก

📌 รายวิชาใหม่:
- รหัสวิชา: ${inputCourse.code}
- ชื่อวิชา: ${inputCourse.name}
- คำอธิบาย: ${inputCourse.description}

📚 รายวิชาในระบบ:
${allCourses.map((c, i) => `(${i + 1}) ${c.course_code} - ${c.course_name}\nคำอธิบาย: ${c.description}`).join("\n\n")}

กรุณาตอบกลับโดยใช้รูปแบบนี้:

รหัสวิชา: <รหัสวิชาที่คล้ายกัน>
ชื่อวิชา: <ชื่อวิชาที่คล้ายกัน>
ความคล้าย: <เปอร์เซ็นต์ความคล้าย เช่น 85%>

ถ้าไม่พบวิชาคล้ายกัน:
ไม่พบวิชาที่คล้ายกัน
`.trim();

    // STEP 1: วิเคราะห์รอบแรกด้วย OpenRouter
    const openRouterResponse = await openaiTyphoon.chat.completions.create({
      model: "typhoon-v2.1-12b-instruct", // หรือเปลี่ยนตามโมเดลที่ต้องการ
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const openRouterOutput = openRouterResponse.choices?.[0]?.message?.content?.trim() || "";
    console.log("ผลลัพธ์จาก OpenRouter:\n", openRouterOutput);

    // STEP 2: สร้าง prompt ให้ Typhoon วิเคราะห์ต่อ
    const typhoonPrompt = `
ผลลัพธ์ที่ได้รับจาก AI OpenRouter ที่วิเคราะห์ความคล้ายของรายวิชา มีดังนี้:

${openRouterOutput}

โปรดตรวจสอบความถูกต้อง และประเมินอีกครั้งว่ารายวิชาใหม่ที่ให้ไปในระบบนั้นมีความคล้ายกับวิชาใดในรายการหรือไม่ โดยแสดงผลลัพธ์ใหม่ในรูปแบบ:

รหัสวิชา: <รหัสวิชาที่คล้ายกัน>
ชื่อวิชา: <ชื่อวิชาที่คล้ายกัน>
ความคล้าย: <เปอร์เซ็นต์ความคล้าย เช่น 92%>

หากไม่พบความคล้ายที่ชัดเจน ให้ระบุว่า:
ไม่พบวิชาที่คล้ายกัน
`.trim();

    const typhoonResponse = await openaiTyphoon.chat.completions.create({
      model: "typhoon-v2.1-12b-instruct",
      messages: [{ role: "user", content: typhoonPrompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const finalOutput = typhoonResponse.choices?.[0]?.message?.content?.trim() || "";
    console.log("ผลลัพธ์จาก Typhoon:\n", finalOutput);

    // STEP 3: แปลงผลลัพธ์จาก Typhoon เป็น JSON
    let allSimilarCourses = [];

    if (finalOutput && !finalOutput.includes("ไม่พบวิชาที่คล้ายกัน")) {
      const matches = [...finalOutput.matchAll(
        /รหัสวิชา:\s*(.+)\nชื่อวิชา:\s*(.+)\nความคล้าย:\s*(\d+)%?/g
      )];

      allSimilarCourses = matches.map(m => ({
        course_code: m[1].trim(),
        course_name: m[2].trim(),
        similarity: m[3] ? Number(m[3]) : null,
        source_model: "Typhoon (refined from OpenRouter)"
      }));

      // เรียงลำดับจากความคล้ายมากไปน้อย
      allSimilarCourses.sort((a, b) => {
        if (b.similarity === null) return -1;
        if (a.similarity === null) return 1;
        return b.similarity - a.similarity;
      });
    }

    // STEP 4: ตอบกลับ
    if (allSimilarCourses.length > 0) {
      return new Response(JSON.stringify({
        found: true,
        similar_courses: allSimilarCourses,
        message: "AI วิเคราะห์และพบวิชาคล้ายกัน (ผ่าน OpenRouter + Typhoon)"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({
        found: false,
        similar_courses: [],
        message: "ไม่พบวิชาที่คล้ายกัน"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({
      error: `เกิดข้อผิดพลาด: ${err.message}`
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
