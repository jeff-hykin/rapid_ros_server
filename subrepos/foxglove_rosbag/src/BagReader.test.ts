// Copyright 2018-2020 Cruise LLC
// Copyright 2021 Foxglove Technologies Inc
//
// This source code is licensed under the Apache License, Version 2.0,
// found in the LICENSE file in the root directory of this source tree.
// You may not use this file except in compliance with the License.

import BagReader from "./BagReader.ts";

function int64Buffer(number: number) {
  const buff = Buffer.alloc(8);
  buff.writeBigInt64LE(BigInt(number), 0);
  return buff;
}

function int32Buffer(number: number) {
  const buff = Buffer.alloc(4);
  buff.writeInt32LE(number, 0);
  return buff;
}

function makeHeaderKeyValuePairBuffer(key: string, value: Buffer) {
  const indexFieldName = Buffer.from(`${key}=`, "ascii");
  const combined = Buffer.concat([indexFieldName, value]);
  const lengthBuffer = int32Buffer(combined.byteLength);
  return Buffer.concat([lengthBuffer, combined]);
}

class FakeHeaderFilelike {
  preamble = "#ROSBAG V2.0\n";
  indexPosition = 0;
  connectionCount = 0;
  chunkCount = 0;

  size() {
    return 4096;
  }

  async read(offset: number, _: number): Promise<Buffer> {
    if (offset === 0) {
      return Buffer.from(this.preamble, "utf8");
    }
    if (offset === 13) {
      const resultBuffer = Buffer.alloc(4096, 0);

      // build a list of key value pair buffers
      const kvpBuffers = [
        makeHeaderKeyValuePairBuffer("op", Buffer.from([0x03])),
        makeHeaderKeyValuePairBuffer("index_pos", int64Buffer(this.indexPosition)),
        makeHeaderKeyValuePairBuffer("conn_count", int32Buffer(this.connectionCount)),
        makeHeaderKeyValuePairBuffer("chunk_count", int32Buffer(this.chunkCount)),
      ];
      const bagHeaderHeader = Buffer.concat(kvpBuffers);

      // start at the beginning of the output buffer
      let currentOffset = 0;
      // write header length
      resultBuffer.writeInt32LE(bagHeaderHeader.byteLength, currentOffset);
      currentOffset += 4;

      // copy bag header record's "header" section to the overall buffer
      // right after the length byte
      bagHeaderHeader.copy(resultBuffer, currentOffset);
      currentOffset += bagHeaderHeader.byteLength;

      // we're currently header_len (4) + header bytes into the buffer
      const remainingBytes = resultBuffer.byteLength - currentOffset;
      // write the data_len which is the remaining 4096 bytes
      resultBuffer.writeInt32LE(remainingBytes, currentOffset);
      currentOffset += 4;

      // According to rosbag documentation,
      // header record is padded out by filling with ASCII space (0x20).
      resultBuffer.fill(0x20, currentOffset);
      return resultBuffer;
    }
    throw new Error(`Unexpected read position: ${offset}`);
  }
}

describe("BagReader", () => {
  describe("parsing header", () => {
    it("calls back with an error if the header has an invalid preamble", async () => {
      const filelike = new FakeHeaderFilelike();
      filelike.preamble = "#ROSBAG V1.0\n";
      const reader = new BagReader(filelike);
      await expect(reader.readHeader()).rejects.toThrow(new Error("Cannot identify bag format."));
    });

    it("parses header correctly with small int32 values", async () => {
      const filelike = new FakeHeaderFilelike();
      filelike.indexPosition = 1;
      filelike.connectionCount = 2;
      filelike.chunkCount = 3;
      const reader = new BagReader(filelike);

      const header = await reader.readHeader();
      expect(header.indexPosition).toEqual(1);
      expect(header.connectionCount).toEqual(2);
      expect(header.chunkCount).toEqual(3);
    });

    it("parses header correctly with large int32 values", async () => {
      const filelike = new FakeHeaderFilelike();
      // 100000, 200000, 300000 etc overflow an Int16, but fit in Int32.
      filelike.indexPosition = 100000;
      filelike.connectionCount = 200000;
      filelike.chunkCount = 300000;
      const reader = new BagReader(filelike);
      const header = await reader.readHeader();
      expect(header.indexPosition).toEqual(100000);
      expect(header.connectionCount).toEqual(200000);
      expect(header.chunkCount).toEqual(300000);
    });
  });
});
