/**
 * ElevenLabs Speech-to-Text Utility
 * 
 * This utility provides speech-to-text functionality using ElevenLabs API.
 * It can handle audio files up to 1GB and supports all major audio/video formats.
*/

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize ElevenLabs client
const client = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_AI_KEY!
});

export interface ElevenLabsTranscriptionResult {
	success: boolean;
	data?: {
		transcript: string;
		language_code: string;
		language_probability: number;
		words?: Array<{
			text: string;
			start: number;
			end: number;
			type: string;
			speaker_id?: string;
			logprob?: number;
		}>;
	};
	error?: string;
}

export interface ElevenLabsTranscriptionOptions {
	language_code?: string | null;
	tag_audio_events?: boolean;
	num_speakers?: number | null;
	timestamps_granularity?: 'none' | 'word' | 'character';
	diarize?: boolean;
	diarization_threshold?: number | null;
	temperature?: number | null;
	seed?: number | null;
}

/**
 * Transcribe audio file using ElevenLabs Speech-to-Text API
 * 
 * Features:
 * - Supports files up to 1GB
 * - All major audio and video formats
 * - Speaker diarization
 * - Word-level timestamps
 * - Multiple language support
 * - Audio event tagging (laughter, footsteps, etc.)
 * 
 * @param audioFile - The audio file to transcribe
 * @param options - Transcription options
 * @returns Promise with transcription result
 */
export async function transcribeWithElevenLabs(
	audioFile: File,
	options: ElevenLabsTranscriptionOptions = {}
): Promise<ElevenLabsTranscriptionResult> {
	try {
		console.log('🎤 Starting ElevenLabs transcription...');
		console.log('Audio file details:', {
			name: audioFile.name,
			size: audioFile.size,
			type: audioFile.type,
			sizeInMB: (audioFile.size / (1024 * 1024)).toFixed(2)
		});

		// Check file size (1GB limit)
		const maxSize = 1024 * 1024 * 1024; // 1GB in bytes
		if (audioFile.size > maxSize) {
			throw new Error(`File size (${(audioFile.size / (1024 * 1024 * 1024)).toFixed(2)}GB) exceeds the 1GB limit`);
		}

		// Default options optimized for interview responses
		const transcriptionOptions = {
			modelId: 'scribe_v1', // Use the stable model
			file: audioFile,
			languageCode: options.language_code || undefined, // Auto-detect if not specified
			tagAudioEvents: options.tag_audio_events ?? true, // Tag events like (pause), (laughter)
			numSpeakers: options.num_speakers || undefined, // Auto-detect number of speakers
			timestampsGranularity: options.timestamps_granularity || 'word', // Word-level timestamps
			diarize: options.diarize ?? false, // Speaker diarization (who spoke when)
			diarizationThreshold: options.diarization_threshold || undefined,
			temperature: options.temperature || undefined, // Use model default
			seed: options.seed || undefined, // For deterministic results
			fileFormat: 'other' as const, // Let ElevenLabs handle format detection
			enableLogging: true, // Enable for debugging
		};

		console.log('📤 Sending request to ElevenLabs...');
		const startTime = Date.now();

		// Make the API call
		const response = await client.speechToText.convert(transcriptionOptions);

		// Define the expected response shape since SDK types may vary
		interface ElevenLabsApiResponse {
			text?: string;
			languageCode?: string;
			languageProbability?: number;
			words?: Array<{
				text?: string;
				start?: number;
				end?: number;
				type?: string;
				speakerId?: string;
				logprob?: number;
			}>;
		}

		// Cast to our expected response type
		const extendedResponse = response as unknown as ElevenLabsApiResponse;

		const endTime = Date.now();
		const processingTime = ((endTime - startTime) / 1000).toFixed(2);

		console.log(`✅ ElevenLabs transcription completed in ${processingTime}s`);
		console.log('Response details:', {
			languageCode: extendedResponse.languageCode,
			languageProbability: extendedResponse.languageProbability,
			text_length: extendedResponse.text?.length || 0,
			words_count: extendedResponse.words?.length || 0
		});

		if (!extendedResponse.text || extendedResponse.text.trim().length === 0) {
			throw new Error('No transcript text received from ElevenLabs');
		}

		return {
			success: true,
			data: {
				transcript: extendedResponse.text.trim(),
				language_code: extendedResponse.languageCode || 'en',
				language_probability: extendedResponse.languageProbability || 0,
				words: extendedResponse.words?.map(word => ({
					text: word.text || '',
					start: word.start || 0,
					end: word.end || 0,
					type: word.type || 'word',
					speaker_id: word.speakerId,
					logprob: word.logprob
				})) || []
			}
		};

	} catch (error) {
		console.error('❌ ElevenLabs transcription error:', error);

		let errorMessage = 'ElevenLabs transcription failed';

		if (error instanceof Error) {
			errorMessage = error.message;

			// Handle specific error types
			if (errorMessage.includes('file size') || errorMessage.includes('1GB')) {
				errorMessage = 'Audio file is too large (max 1GB). Please use a shorter recording.';
			} else if (errorMessage.includes('format') || errorMessage.includes('unsupported')) {
				errorMessage = 'Unsupported audio format. Please use a common audio format (MP3, WAV, etc.).';
			} else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
				errorMessage = 'API quota exceeded. Please try again later.';
			} else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
				errorMessage = 'Network error during transcription. Please check your connection and try again.';
			} else if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
				errorMessage = 'API authentication failed. Please check the ElevenLabs API key configuration.';
			}
		}

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Quick transcription for short audio files (optimized settings)
 * 
 * @param audioFile - The audio file to transcribe
 * @returns Promise with transcription result
 */
export async function quickTranscribeWithElevenLabs(audioFile: File): Promise<ElevenLabsTranscriptionResult> {
	return transcribeWithElevenLabs(audioFile, {
		timestamps_granularity: 'none', // No timestamps for faster processing
		tag_audio_events: false, // Skip audio events for speed
		diarize: false, // Skip speaker diarization for speed
		temperature: 0, // Most deterministic output
	});
}

/**
 * Detailed transcription for longer audio files (full features)
 * 
 * @param audioFile - The audio file to transcribe
 * @param numSpeakers - Expected number of speakers (optional)
 * @returns Promise with transcription result
 */
export async function detailedTranscribeWithElevenLabs(
	audioFile: File,
	numSpeakers?: number
): Promise<ElevenLabsTranscriptionResult> {
	return transcribeWithElevenLabs(audioFile, {
		timestamps_granularity: 'word', // Word-level timestamps
		tag_audio_events: true, // Include audio events
		diarize: numSpeakers ? numSpeakers > 1 : false, // Speaker diarization if multiple speakers
		num_speakers: numSpeakers || null,
		diarization_threshold: 0.22, // Balanced speaker separation
	});
}

/**
 * Check if ElevenLabs is properly configured
 * 
 * @returns boolean indicating if ElevenLabs is ready to use
 */
export function isElevenLabsConfigured(): boolean {
	return !!process.env.ELEVENLABS_AI_KEY && process.env.ELEVENLABS_AI_KEY.trim().length > 0;
}

/**
 * Get ElevenLabs service info
 * 
 * @returns Service information
 */
export function getElevenLabsInfo() {
	return {
		name: 'ElevenLabs Speech-to-Text',
		maxFileSize: '1GB',
		supportedFormats: 'All major audio and video formats',
		features: [
			'Speaker diarization',
			'Word-level timestamps',
			'Audio event tagging',
			'Multi-language support',
			'High accuracy transcription'
		],
		configured: isElevenLabsConfigured()
	};
}