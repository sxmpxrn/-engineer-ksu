"use client";
import { useState, useRef, useEffect } from 'react';

export default function PdfToTextExtractor() {
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const [pdfjsLib, setPdfjsLib] = useState(null);

  useEffect(() => {
    async function loadPdfjs() {
      const pdfjs = await import('pdfjs-dist/build/pdf');
      // workerSrc ชี้ไปไฟล์ใน public folder
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;
      setPdfjsLib(pdfjs);
    }
    loadPdfjs();
  }, []);

  async function handleFileChange(event) {
    const file = event.target.files[0];
    setError('');
    setExtractedText('');

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (!pdfjsLib) {
      setError('PDF.js is not loaded yet. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textContent = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(item => item.str).join(' ') + '\n\n';
      }

      setExtractedText(textContent);
    } catch (e) {
      console.error('Error processing PDF:', e);
      setError('Failed to process the PDF file. Please try a different file.');
    }

    setLoading(false);
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          PDF to Text Extractor
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Upload a PDF file to extract and view its text content.
        </p>

        <div className="mb-6 flex flex-col items-center">
          <label
            htmlFor="pdfFile"
            className="block text-gray-700 font-semibold mb-2"
          >
            Select a PDF File
          </label>
          <input
            type="file"
            id="pdfFile"
            ref={inputRef}
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50
            focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {loading && (
          <div className="mt-4 text-center text-gray-500">
            <svg
              className="animate-spin h-5 w-5 text-blue-500 inline-block mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962
                 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Extracting text...</span>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {extractedText && !loading && (
          <div
            id="output"
            className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-700 mb-2">Extracted Text</h2>
            <pre className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {extractedText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
