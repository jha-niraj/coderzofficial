/**
 * KnowMe Text Chunking Utility
 * 
 * Handles intelligent text chunking for embedding.
 * Chunking is the process of splitting large texts into smaller pieces
 * that fit within embedding model limits while maintaining context.
 * 
 * Why chunking matters:
 * 1. Embedding models have token limits (~8000 tokens)
 * 2. Smaller chunks = more precise retrieval
 * 3. Good chunking preserves semantic meaning
 */

import type { KnowMeDataType } from "@repo/db";
import type {
	EmbeddingChunk, EmbeddingMetadata
} from "@/types/knowme";

// Configuration for chunk sizes
export const CHUNK_CONFIG = {
	maxChunkSize: 1000, // Characters per chunk (conservative for token limits)
	overlapSize: 100, // Overlap between chunks for context continuity
	minChunkSize: 100, // Don't create chunks smaller than this
	sentenceDelimiters: [".", "!", "?", "\n\n"],
	paragraphDelimiter: "\n\n",
};

/**
 * Main chunking function - splits text into semantic chunks
 */
export function chunkText(
	text: string,
	options: {
		maxSize?: number;
		overlap?: number;
		preserveSentences?: boolean;
	} = {}
): string[] {
	const {
		maxSize = CHUNK_CONFIG.maxChunkSize,
		overlap = CHUNK_CONFIG.overlapSize,
		preserveSentences = true,
	} = options;

	if (!text || text.trim().length === 0) {
		return [];
	}

	const cleanText = text.trim();

	// If text is small enough, return as single chunk
	if (cleanText.length <= maxSize) {
		return [cleanText];
	}

	if (preserveSentences) {
		return chunkBySentences(cleanText, maxSize, overlap);
	}

	return chunkBySize(cleanText, maxSize, overlap);
}

/**
 * Chunk text by sentences, respecting max size
 */
function chunkBySentences(
	text: string,
	maxSize: number,
	overlap: number
): string[] {
	const chunks: string[] = [];

	// Split by paragraphs first
	const paragraphs = text.split(CHUNK_CONFIG.paragraphDelimiter);

	let currentChunk = "";
	let overlapBuffer = "";

	for (const paragraph of paragraphs) {
		// Split paragraph into sentences
		const sentences = splitIntoSentences(paragraph);

		for (const sentence of sentences) {
			const trimmedSentence = sentence.trim();
			if (!trimmedSentence) continue;

			const potentialChunk = currentChunk
				? `${currentChunk} ${trimmedSentence}`
				: trimmedSentence;

			if (potentialChunk.length <= maxSize) {
				currentChunk = potentialChunk;
			} else {
				// Save current chunk if it meets minimum size
				if (currentChunk.length >= CHUNK_CONFIG.minChunkSize) {
					chunks.push(currentChunk);
					// Create overlap from end of current chunk
					overlapBuffer = getOverlapText(currentChunk, overlap);
				}

				// Start new chunk with overlap + new sentence
				currentChunk = overlapBuffer
					? `${overlapBuffer} ${trimmedSentence}`
					: trimmedSentence;

				// If single sentence exceeds max, split it
				if (currentChunk.length > maxSize) {
					const sentenceChunks = chunkBySize(currentChunk, maxSize, overlap);
					chunks.push(...sentenceChunks.slice(0, -1));
					currentChunk = sentenceChunks[sentenceChunks.length - 1] || "";
				}
			}
		}

		// Add paragraph break between paragraphs if there's room
		if (currentChunk && currentChunk.length + 2 < maxSize) {
			currentChunk += "\n\n";
		}
	}

	// Don't forget the last chunk
	if (currentChunk.trim().length >= CHUNK_CONFIG.minChunkSize) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

/**
 * Simple chunking by character count with overlap
 */
function chunkBySize(text: string, maxSize: number, overlap: number): string[] {
	const chunks: string[] = [];
	let start = 0;

	while (start < text.length) {
		let end = Math.min(start + maxSize, text.length);

		// Try to break at a word boundary
		if (end < text.length) {
			const lastSpace = text.lastIndexOf(" ", end);
			if (lastSpace > start) {
				end = lastSpace;
			}
		}

		chunks.push(text.slice(start, end).trim());
		start = end - overlap;

		// Prevent infinite loop
		if (start <= 0 && chunks.length > 1) break;
	}

	return chunks.filter((c) => c.length >= CHUNK_CONFIG.minChunkSize);
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
	// Use regex to split while preserving delimiters
	const sentenceRegex = /[^.!?\n]+[.!?\n]+/g;
	const matches = text.match(sentenceRegex) || [];

	// Handle text that doesn't end with a delimiter
	const lastMatch = matches[matches.length - 1] || "";
	const remaining = text.slice(
		text.lastIndexOf(lastMatch) + lastMatch.length
	).trim();

	if (remaining) {
		matches.push(remaining as never);
	}

	return matches;
}

/**
 * Get overlap text from end of a chunk
 */
function getOverlapText(text: string, overlapSize: number): string {
	if (text.length <= overlapSize) {
		return text;
	}

	// Try to start at a word boundary
	const startPos = text.length - overlapSize;
	const firstSpace = text.indexOf(" ", startPos);

	if (firstSpace > startPos && firstSpace < text.length - 10) {
		return text.slice(firstSpace + 1);
	}

	return text.slice(startPos);
}

/**
 * Create chunks with metadata for a profile item
 */
export function createProfileChunks(
	profileId: string,
	sourceType: KnowMeDataType,
	sourceId: string,
	text: string,
	additionalMetadata: Partial<EmbeddingMetadata> = {}
): EmbeddingChunk[] {
	const textChunks = chunkText(text);

	return textChunks.map((chunk, index) => ({
		text: chunk,
		metadata: {
			profileId,
			sourceType,
			sourceId,
			chunkIndex: index,
			...additionalMetadata,
		},
	}));
}

/**
 * Create chunks for a project
 */
export function createProjectChunks(
	profileId: string,
	projectId: string,
	projectData: {
		title: string;
		description: string;
		technologies: string[];
		url?: string;
	}
): EmbeddingChunk[] {
	// Create rich text representation of the project
	const projectText = `
Project: ${projectData.title}

Description: ${projectData.description}

Technologies: ${projectData.technologies.join(", ")}
${projectData.url ? `URL: ${projectData.url}` : ""}
  `.trim();

	return createProfileChunks(profileId, "PROJECT", projectId, projectText, {
		title: projectData.title,
		techStack: projectData.technologies,
		url: projectData.url,
	});
}

/**
 * Create chunks for an assessment result
 */
export function createAssessmentChunks(
	profileId: string,
	assessmentId: string,
	assessmentData: {
		title: string;
		technology: string;
		score: number;
		maxScore: number;
		completedAt: Date;
	}
): EmbeddingChunk[] {
	const percentage = Math.round((assessmentData.score / assessmentData.maxScore) * 100);

	const assessmentText = `
Assessment: ${assessmentData.title}
Technology: ${assessmentData.technology}
Score: ${assessmentData.score}/${assessmentData.maxScore} (${percentage}%)
Completed: ${assessmentData.completedAt.toLocaleDateString()}

This assessment demonstrates proficiency in ${assessmentData.technology}.
${percentage >= 80 ? "Excellent performance!" : percentage >= 60 ? "Good understanding demonstrated." : "Foundational knowledge shown."}
  `.trim();

	return createProfileChunks(profileId, "ASSESSMENT", assessmentId, assessmentText, {
		title: assessmentData.title,
		techStack: [assessmentData.technology],
	});
}

/**
 * Create chunks for GitHub repository data
 */
export function createGitHubRepoChunks(
	profileId: string,
	repoData: {
		id: string;
		name: string;
		description: string | null;
		url: string;
		languages: string[];
		stars: number;
		forks: number;
		readme?: string | null;
	}
): EmbeddingChunk[] {
	// Create rich text for the repository
	let repoText = `
GitHub Repository: ${repoData.name}
${repoData.description ? `Description: ${repoData.description}` : ""}
Languages: ${repoData.languages.join(", ")}
Stars: ${repoData.stars}, Forks: ${repoData.forks}
URL: ${repoData.url}
  `.trim();

	// Add README content if available (truncated)
	if (repoData.readme) {
		const readmePreview = repoData.readme.slice(0, 1500);
		repoText += `\n\nREADME Preview:\n${readmePreview}`;
	}

	return createProfileChunks(profileId, "GITHUB_REPO", repoData.id, repoText, {
		title: repoData.name,
		techStack: repoData.languages,
		url: repoData.url,
	});
}

/**
 * Create chunks for resume content
 */
export function createResumeChunks(
	profileId: string,
	resumeId: string,
	resumeText: string
): EmbeddingChunk[] {
	// Add prefix for context
	const enrichedText = `Resume Content:\n\n${resumeText}`;

	return createProfileChunks(profileId, "RESUME", resumeId, enrichedText);
}

/**
 * Create chunks for user bio/profile
 */
export function createBioChunks(
	profileId: string,
	profileData: {
		name: string | null;
		bio: string | null;
		occupation: string | null;
		location: string | null;
		skills: string[];
		email?: string | null;
	}
): EmbeddingChunk[] {
	const bioText = `
Name: ${profileData.name || "Not specified"}
${profileData.email ? `Email: ${profileData.email}` : ""}
${profileData.occupation ? `Occupation: ${profileData.occupation}` : ""}
${profileData.location ? `Location: ${profileData.location}` : ""}
${profileData.bio ? `Bio: ${profileData.bio}` : ""}
Skills: ${profileData.skills.length > 0 ? profileData.skills.join(", ") : "Not specified"}
  `.trim();

	return createProfileChunks(profileId, "PROFILE", profileId, bioText, {
		title: profileData.name || "Profile",
	});
}

/**
 * Create chunks for owner training Q&A
 * This is used when the owner chats with their AI and we save the interaction as training data
 */
export function createOwnerTrainingChunks(
	profileId: string,
	trainingId: string,
	trainingData: {
		question: string;
		answer: string;
		context?: string;
	}
): EmbeddingChunk[] {
	// Create a rich text that captures the Q&A context for future retrieval
	const trainingText = `
Owner-provided Training Data:

Question: ${trainingData.question}

Approved Answer: ${trainingData.answer}
${trainingData.context ? `\nContext: ${trainingData.context}` : ""}

This is verified information provided by the profile owner that should be used to answer similar questions.
  `.trim();

	return createProfileChunks(profileId, "OWNER_TRAINING", trainingId, trainingText, {
		title: `Training: ${trainingData.question.slice(0, 50)}...`,
	});
}

/**
 * Estimate total tokens for chunks
 */
export function estimateChunkTokens(chunks: EmbeddingChunk[]): number {
	return chunks.reduce((total, chunk) => {
		return total + Math.ceil(chunk.text.length / 4);
	}, 0);
}