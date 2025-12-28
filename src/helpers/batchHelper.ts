/**
 * Split array into batches of specified size
 */
export function chunkArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];

  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Process items in batches with error handling
 * @param items - Array of items to process
 * @param batchSize - Size of each batch
 * @param processor - Function to process a single item
 * @returns Object with successful results and errors
 */
export async function processInBatches<TItem, TResult>(params: {
  items: TItem[];
  batchSize: number;
  processor: (item: TItem, index: number) => Promise<TResult>;
}): Promise<{
  results: TResult[];
  errors: Array<{ index: number; error: string }>;
}> {
  const { items, batchSize, processor } = params;
  const results: TResult[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  // Split items into batches
  const batches = chunkArray(items, batchSize);

  // Process each batch sequentially
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const startIndex = batchIndex * batchSize;

    // Process items in batch sequentially
    for (let i = 0; i < batch.length; i++) {
      const globalIndex = startIndex + i;
      const item = batch[i];

      try {
        const result = await processor(item, globalIndex);

        results.push(result);
      } catch (error) {
        errors.push({
          index: globalIndex + 1,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return { results, errors };
}
