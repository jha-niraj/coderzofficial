/**
 * KnowMe Vector Database Utility
 * 
 * Handles all interactions with Upstash Vector database.
 * Upstash Vector is a serverless vector database optimized for AI applications.
 * 
 * Key Learns:
 * - Vectors: Numerical arrays representing text embeddings
 * - Namespace: Isolated space for each user's data (uses profileId)
 * - Metadata: Additional info stored with each vector for filtering
 * - Score: Similarity score (0-1) when querying
 */

import { Index } from "@upstash/vector";
import type {
	EmbeddingMetadata, VectorSearchResult
} from "@/types/knowme";

// Lazy initialization of Upstash Vector client to ensure env vars are available
let _vectorIndex: Index | null = null;

function getVectorIndex(): Index {
	if (!_vectorIndex) {
		if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
			throw new Error("UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables must be set");
		}
		_vectorIndex = new Index({
			url: process.env.UPSTASH_VECTOR_REST_URL,
			token: process.env.UPSTASH_VECTOR_REST_TOKEN,
		});
	}
	return _vectorIndex;
}

// Configuration
export const VECTOR_CONFIG = {
	topK: 5, // Default number of results to return
	minScore: 0.5, // Minimum similarity score to include
	maxResults: 10, // Maximum results for a query
};

/**
 * Upsert (insert or update) a vector into the database
 * 
 * @param id - Unique identifier for this vector
 * @param embedding - The numerical vector from OpenAI
 * @param metadata - Additional info (profileId, sourceType, etc.)
 * @param namespace - User's namespace (profileId)
 */
export async function upsertVector(
	id: string,
	embedding: number[],
	metadata: EmbeddingMetadata,
	namespace: string
): Promise<void> {
	try {
		await getVectorIndex().upsert(
			[
				{
					id,
					vector: embedding,
					metadata: metadata as unknown as Record<string, unknown>,
				},
			],
			{ namespace }
		);
	} catch (error) {
		console.error("Error upserting vector:", error);
		throw new Error("Failed to upsert vector to database");
	}
}

/**
 * Upsert multiple vectors in batch (more efficient)
 */
export async function upsertVectorsBatch(
	vectors: {
		id: string;
		text: string;
		embedding: number[];
		metadata: EmbeddingMetadata;
	}[],
	namespace: string
): Promise<void> {
	if (vectors.length === 0) return;

	try {
		// Process in batches of 100 (Upstash limit)
		const batchSize = 100;

		for (let i = 0; i < vectors.length; i += batchSize) {
			const batch = vectors.slice(i, i + batchSize);

			await getVectorIndex().upsert(
				batch.map((v) => ({
					id: v.id,
					vector: v.embedding,
					data: v.text,
					metadata: v.metadata as unknown as Record<string, unknown>,
				})),
				{ namespace }
			);
		}
	} catch (error) {
		console.error("Error upserting vectors batch:", error);
		throw new Error("Failed to upsert vectors batch");
	}
}

/**
 * Query vectors by similarity
 * This is the main search function for finding relevant context
 * 
 * @param queryEmbedding - The embedding of the user's question
 * @param namespace - User's namespace (profileId)
 * @param options - Query options (topK, filter, etc.)
 */
export async function queryVectors(
	queryEmbedding: number[],
	namespace: string,
	options: {
		topK?: number;
		minScore?: number;
		filter?: Record<string, unknown>;
		includeMetadata?: boolean;
		includeVectors?: boolean;
	} = {}
): Promise<VectorSearchResult[]> {
	const {
		topK = VECTOR_CONFIG.topK,
		minScore = VECTOR_CONFIG.minScore,
		filter,
		includeMetadata = true,
		includeVectors = false,
	} = options;

	try {
		// Convert filter object to string format if provided
		const filterString = filter ? JSON.stringify(filter) : undefined;

		const results = await getVectorIndex().query(
			{
				vector: queryEmbedding,
				topK,
				includeMetadata,
				includeVectors,
				...(filterString && { filter: filterString }),
			},
			{ namespace }
		);

		// Filter by minimum score and transform results
		return results
			.filter((result) => (result.score ?? 0) >= minScore)
			.map((result) => ({
				id: result.id as string,
				score: result.score ?? 0,
				metadata: result.metadata as Record<string, unknown>,
				text: ((result.metadata as unknown as EmbeddingMetadata)?.text || "") as string,
			}));
	} catch (error) {
		console.error("Error querying vectors:", error);
		throw new Error("Failed to query vector database");
	}
}

/**
 * Delete a single vector by ID
 */
export async function deleteVector(
	id: string,
	namespace: string
): Promise<void> {
	try {
		await getVectorIndex().delete([id], { namespace });
	} catch (error) {
		console.error("Error deleting vector:", error);
		throw new Error("Failed to delete vector");
	}
}

/**
 * Delete multiple vectors by IDs
 */
export async function deleteVectorsBatch(
	ids: string[],
	namespace: string
): Promise<void> {
	if (ids.length === 0) return;

	try {
		// Process in batches
		const batchSize = 100;

		for (let i = 0; i < ids.length; i += batchSize) {
			const batch = ids.slice(i, i + batchSize);
			await getVectorIndex().delete(batch, { namespace });
		}
	} catch (error) {
		console.error("Error deleting vectors batch:", error);
		throw new Error("Failed to delete vectors batch");
	}
}

/**
 * Delete all vectors in a namespace (user's data)
 * Use with caution - this removes all embeddings for a user
 */
export async function deleteNamespace(namespace: string): Promise<void> {
	try {
		await getVectorIndex().deleteNamespace(namespace);
	} catch (error) {
		console.error("Error deleting namespace:", error);
		throw new Error("Failed to delete namespace");
	}
}

/**
 * Get vector by ID
 */
export async function getVector(
	id: string,
	namespace: string
): Promise<{
	id: string;
	metadata: Record<string, unknown>;
} | null> {
	try {
		const results = await getVectorIndex().fetch([id], { namespace });

		if (results && results.length > 0) {
			const result = results[0];
			return {
				id: result?.id as string,
				metadata: result?.metadata as unknown as Record<string, unknown>,
			};
		}

		return null;
	} catch (error) {
		console.error("Error fetching vector:", error);
		throw new Error("Failed to fetch vector");
	}
}

/**
 * Get namespace statistics
 */
export async function getNamespaceStats(_namespace: string): Promise<{
	vectorCount: number;
	pendingVectorCount: number;
}> {
	try {
		const info = await getVectorIndex().info();

		// Upstash returns total counts, we'd need to query for namespace-specific
		return {
			vectorCount: info.vectorCount ?? 0,
			pendingVectorCount: info.pendingVectorCount ?? 0,
		};
	} catch (error) {
		console.error("Error getting namespace stats:", error);
		throw new Error("Failed to get namespace stats");
	}
}

/**
 * Check if vector database is properly configured
 */
export async function checkVectorDbConnection(): Promise<boolean> {
	try {
		await getVectorIndex().info();
		return true;
	} catch {
		return false;
	}
}

/**
 * Range query - get vectors by metadata filter
 * Useful for finding all vectors of a specific type
 */
export async function queryByFilter(
	namespace: string,
	filter: Record<string, unknown>,
	options: {
		topK?: number;
		includeMetadata?: boolean;
	} = {}
): Promise<VectorSearchResult[]> {
	const { topK = 100, includeMetadata = true } = options;

	try {
		// Convert filter object to string format
		const filterString = JSON.stringify(filter);

		// For filter-only queries, we use a zero vector (not ideal but works)
		// In production, consider maintaining a list of IDs per namespace
		const results = await getVectorIndex().query(
			{
				vector: new Array(1024).fill(0), // Placeholder vector
				topK,
				includeMetadata,
				filter: filterString,
			},
			{ namespace }
		);

		return results.map((result) => ({
			id: result.id as string,
			score: result.score ?? 0,
			metadata: result.metadata as unknown as Record<string, unknown>,
			text: ((result.metadata as unknown as EmbeddingMetadata)?.text || "") as string,
		}));
	} catch (error) {
		console.error("Error querying by filter:", error);
		throw new Error("Failed to query by filter");
	}
}