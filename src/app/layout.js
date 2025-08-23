// src/app/layout.js
import './globals.css';
import { Kanit } from 'next/font/google';

const kanit = Kanit({
  weight: ['300', '400', '600'],
  subsets: ['thai'],
  display: 'swap',
});

export const metadata = {
  title: 'มหาวิทยาลัยกาฬสินธุ์',
  description: 'แหล่งรวมความรู้เพื่ออนาคตของคุณ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">{}
      <body className={kanit.className}>{}
        {children}
      </body>
    </html>
  );
}
