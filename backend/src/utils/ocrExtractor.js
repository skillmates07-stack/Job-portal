// Simplified OCR utility - uses Tesseract.js directly on PDF
// Note: For image-based PDFs, this requires the PDF to be converted to image first
import Tesseract from "tesseract.js";

/**
 * Check if extracted text is too short to be valid
 * @param {string} text - The extracted text
 * @returns {boolean} - True if text seems invalid/empty
 */
export const isTextExtractionFailed = (text) => {
    if (!text) return true;
    const cleanText = text.replace(/\s+/g, " ").trim();
    // If we got less than 50 characters, text extraction probably failed
    return cleanText.length < 50;
};

/**
 * Simple OCR text extraction - placeholder that returns empty
 * Full OCR requires additional GhostScript setup which is complex
 * For now, we'll return a helpful error message instead
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text or empty string
 */
export const extractTextWithOCR = async (pdfBuffer) => {
    console.log("OCR requested but simplified implementation - returning empty");
    // Note: Full OCR for PDFs requires GhostScript to be installed
    // and pdf2pic depends on it. For a simpler solution, the user
    // can convert their PDF to text-based format
    return "";
};

export default extractTextWithOCR;
