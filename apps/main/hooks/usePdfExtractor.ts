'use client';

import { useState } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Set the worker source
const pdfjsWorker = '/pdf.worker.min.js';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface UsePdfExtractorReturn {
	extractText: (pdfUrl: string) => Promise<string>;
	isExtracting: boolean;
	error: string | null;
}

export function usePdfExtractor(): UsePdfExtractorReturn {
	const [isExtracting, setIsExtracting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const extractText = async (pdfUrl: string): Promise<string> => {
		setIsExtracting(true);
		setError(null);

		try {
			// Load the PDF document
			const loadingTask = pdfjs.getDocument(pdfUrl);
			const pdf = await loadingTask.promise;

			let fullText = '';

			// Extract text from each page
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const textContent = await page.getTextContent();
				const pageText = textContent.items
					.map((item: any) => item.str)
					.join(' ');

				fullText += pageText + '\n';
			}

			return fullText;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to extract PDF text';
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setIsExtracting(false);
		}
	};

	return { extractText, isExtracting, error };
} 