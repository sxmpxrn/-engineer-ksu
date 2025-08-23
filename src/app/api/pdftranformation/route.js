import formidable from "formidable";
import fs from "fs";
import pdfplumber from "pdfplumber"; // หรือ library อื่นที่ใช้ได้กับ Node.js

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const buffer = fs.readFileSync(file.filepath);
    
    // 💡 ตรงนี้คือส่วนที่ต้องเปลี่ยน
    // เนื่องจาก `pdfplumber` เป็น library ของ Python
    // คุณจะต้องหา library Node.js ที่สามารถทำงานแบบเดียวกันได้ หรือใช้การเรียก Process จาก Node.js
    // ตัวอย่างเช่น `pdf-parse` หรือ `pdf.js` ที่อาจจะทำงานได้ดีกว่าในบางกรณี

    // หรืออาจจะลองใช้ `pdf.js` ซึ่งเป็นอีกหนึ่ง library ยอดนิยมสำหรับ Node.js
    // import * as pdfjs from 'pdfjs-dist/build/pdf';
    // const loadingTask = pdfjs.getDocument(buffer);
    // const pdf = await loadingTask.promise;
    // const firstPage = await pdf.getPage(1);
    // const textContent = await firstPage.getTextContent();
    // const text = textContent.items.map(item => item.str).join(' ');

    // หลังจากได้ `text` แล้ว โค้ดส่วนที่เหลือจะเหมือนเดิม
    const lines = text.split("\n").map((line) => line.trim());
    const courseRegex =
      /([A-Zก-ฮ]{2,}\d{3})\s+(.+?)\s+((A|B|C|D|F|ผ่าน|ไม่ผ่าน|ร|มส))/i;
    
    const courses = lines
      .map((line) => {
        const match = line.match(courseRegex);
        if (match) {
          return {
            code: match[1],
            name: match[2],
            grade: match[3],
          };
        }
      })
      .filter(Boolean);

    return new Response(JSON.stringify({ courses }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PDF Processing Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process PDF", details: error.message }), {
      status: 500,
    });
  }
}