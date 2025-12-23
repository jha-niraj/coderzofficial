import 'pdfjs-dist/build/pdf';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export const getDocument = pdfjsLib.getDocument;