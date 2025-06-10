import type { ChunkInfo, Record } from "./record.ts";
import type { Decompress, Constructor, ChunkReadResult } from "./types.ts";

export interface IBagReader {
  /**
   * reads a single chunk record && its index records given a chunkInfo
   */
  readChunk(chunkInfo: ChunkInfo, decompress: Decompress): Promise<ChunkReadResult>;

  /**
   * Read an individaul record from a buffer
   */
  readRecordFromBuffer<T extends Record>(
    buffer: Uint8Array,
    fileOffset: number,
    cls: Constructor<T> & { opcode: number },
  ): T;
}
