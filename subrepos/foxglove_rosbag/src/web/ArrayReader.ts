// Copyright 2018-2020 Cruise LLC
// Copyright 2021 Foxglove Technologies Inc
//
// This source code is licensed under the Apache License, Version 2.0,
// found in the LICENSE file in the root directory of this source tree.
// You may not use this file except in compliance with the License.

import { Filelike } from "../types.ts";

// browser reader for Blob|File objects
export default class ArrayReader implements Filelike {
  _array: Uint8Array;
  _size: number;

  constructor(array: Uint8Array) {
    this._array = array;
    this._size = array.length * 8;
  }

  // read length (bytes) starting from offset (bytes)
  async read(offset: number, length: number): Promise<Uint8Array> {
    return this._array.slice(offset, offset + length);
  }

  // return the size of the file
  size(): number {
    return this._size;
  }
}
