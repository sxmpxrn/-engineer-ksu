export default function HomePage() {
  return (
    <>
      <header className="bg-blue-900 text-white py-8 px-4">
        <nav className="flex justify-between items-center mb-6">
          <a href="#bout-section" className="text-lg font-bold hover:underline">
            มหาวิทยาลัยกาฬสินธุ์
          </a>
          <a href="#" className="text-white hover:underline">
            หน้าหลัก
          </a>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          มหาวิทยาลัยกาฬสินธุ์
        </h1>
        <p className="text-center text-lg mb-4">
          แหล่งรวมความรู้เพื่ออนาคตของคุณ
        </p>
        <div className="text-center">
          <a
            href="#start-section"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded shadow"
          >
            เริ่มการเทียบวิชา
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          หลักสูตรภาคปกติและภาคพิเศษ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow-md border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              ภาคปกติ
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>เรียนในวันจันทร์ - ศุกร์ (เช้า-บ่าย)</li>
              <li>เหมาะสำหรับนักเรียนที่กำลังจะ จบ.6 หรือเทียบเท่า</li>
              <li>ค่าใช้จ่ายขึ้นอยู่กับแต่ละสาขา</li>
              <li>สามารถกู้กยศ./กรอ.ได้</li>
            </ul>
          </div>
          <div className="bg-white shadow-md border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">
              ภาคพิเศษ
            </h3>
            <ul className="list-disc list-inside space-y-2">
              <li>เรียนวันเสาร์ - อาทิตย์ หรือภาคค่ำ</li>
              <li>เหมาะสำหรับผู้ที่ทำงานประจำ หรือผู้มีเวลาจำกัด</li>
              <li>ค่าใช้จ่ายขึ้นอยู่กับแต่ละสาขา</li>
              <li>สามารถขอผ่อนชำระกับสถานศึกษาได้</li>
            </ul>
          </div>
        </div>

        <section id="start-section">
          <h2 className="text-2xl font-bold text-center mb-8">
            สาขาที่น่าสนใจ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="computer"
              className="bg-white border shadow-sm rounded-lg p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl mb-2">💻</div>
              <h4 className="text-lg font-semibold">วิศวกรรมคอมพิวเตอร์</h4>
              <p className="text-gray-600">วิศวกรรมศาสตร์และเทคโนโลยี</p>
            </a>
            <a
              href="#"
              className="bg-white border shadow-sm rounded-lg p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl mb-2">⚡️</div>
              <h4 className="text-lg font-semibold">วิศวกรรมไฟฟ้า</h4>
              <p className="text-gray-600">วิศวกรรมศาสตร์และเทคโนโลยี</p>
            </a>
            <a
              href="#"
              className="bg-white border shadow-sm rounded-lg p-6 text-center hover:shadow-md transition"
            >
              <div className="text-4xl mb-2">🤖</div>
              <h4 className="text-lg font-semibold">วิศวกรรมเมคคาทรอนิกส์</h4>
              <p className="text-gray-600">วิศวกรรมศาสตร์และเทคโนโลยี</p>
            </a>
          </div>
        </section>
      </main>

      <section id="bout-section" className="bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">เกี่ยวกับเรา</h2>
          <p className="text-gray-700 leading-relaxed">
            มหาวิทยาลัยได้มุ่งมั่นในการสร้างบุคลากรที่มีคุณภาพ
            และสามารถปรับตัวได้ในอนาคต เรามีหลากหลายสาขามากมาย ทั้งวิศวกรรม
            คอมพิวเตอร์ และอื่นๆ
            ที่ตอบโจทย์ความต้องการของตลาดแรงงานและการพัฒนาประเทศ
          </p>
        </div>
      </section>

      <footer className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
          <div>
            <h4 className="text-lg font-semibold">มหาวิทยาลัยตัวอย่าง</h4>
            <p>123 ถนนการศึกษา ตำบลดาวเรือง จังหวัดกาฬสินธุ์ 40000</p>
          </div>
          <div className="text-sm">
            <p>&copy; 2025 มหาวิทยาลัยกาฬสินธุ์. สงวนลิขสิทธิ์</p>
          </div>
        </div>
      </footer>
    </>
  );
}
