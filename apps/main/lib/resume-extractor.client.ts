/**
 * Resume Text Extraction Service (CLIENT-SIDE ONLY)
 * Extracts text content from PDF, DOC, and DOCX files
 * Uses pdfjs-dist for PDF and mammoth for DOCX files
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - using local file instead of CDN
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str || '')
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF file');
    }
}

/**
 * Extract text from DOCX file using mammoth
 * Note: This requires mammoth to be installed: npm install mammoth
 */
async function extractTextFromDOCX(file: File): Promise<string> {
    try {
        // Dynamic import to avoid server-side issues
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value.trim();
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX file. Make sure mammoth is installed.');
    }
}

/**
 * Extract text from DOC file (legacy Word format)
 * For DOC files, we'll try a basic text extraction
 * Note: DOC format is complex and may not extract perfectly
 */
async function extractTextFromDOC(file: File): Promise<string> {
    try {
        // Read as text with proper encoding
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(arrayBuffer);

        // Remove binary characters and clean up
        text = text.replace(/[^\x20-\x7E\n\r]/g, ' ');
        text = text.replace(/\s+/g, ' ');
        text = text.trim();

        if (text.length < 50) {
            throw new Error('Extracted text is too short, file may be corrupted or in unsupported format');
        }

        return text;
    } catch (error) {
        console.error('Error extracting text from DOC:', error);
        throw new Error('Failed to extract text from DOC file. Please convert to DOCX or PDF format.');
    }
}

/**
 * Main function to extract text from resume file
 * Supports PDF, DOC, and DOCX formats
 */
export async function extractTextFromResume(file: File): Promise<{
    success: boolean;
    text?: string;
    error?: string;
}> {
    try {
        // Validate file
        if (!file) {
            return {
                success: false,
                error: 'No file provided'
            };
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return {
                success: false,
                error: 'File is too large. Maximum size is 5MB'
            };
        }

        let extractedText: string;

        // Extract based on file type
        if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPDF(file);
        } else if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.name.toLowerCase().endsWith('.docx')
        ) {
            extractedText = await extractTextFromDOCX(file);
        } else if (
            file.type === 'application/msword' ||
            file.name.toLowerCase().endsWith('.doc')
        ) {
            extractedText = await extractTextFromDOC(file);
        } else {
            return {
                success: false,
                error: 'Unsupported file format. Please upload PDF, DOC, or DOCX file.'
            };
        }

        // Validate extracted text
        if (!extractedText || extractedText.length < 50) {
            return {
                success: false,
                error: 'Could not extract enough text from the file. Please ensure the file is not corrupted or encrypted.'
            };
        }

        // Limit text length (max 50,000 characters)
        if (extractedText.length > 50000) {
            extractedText = extractedText.substring(0, 50000);
        }

        return {
            success: true,
            text: extractedText
        };

    } catch (error) {
        console.error('Resume text extraction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to extract text from resume'
        };
    }
}

/**
 * Format resume text for AI consumption
 * Cleans up and structures the text
 */
export function formatResumeForAI(resumeText: string): string {
    // Remove excessive whitespace
    let formatted = resumeText.replace(/\s+/g, ' ');

    // Add line breaks for better readability
    formatted = formatted.replace(/\.\s+/g, '.\n');
    formatted = formatted.replace(/:\s+/g, ':\n');

    // Trim
    formatted = formatted.trim();

    return formatted;
}

