// Copyright 2018-2020 Cruise LLC
// Copyright 2021 Foxglove Technologies Inc
//
// This source code is licensed under the Apache License, Version 2.0,
// found in the LICENSE file in the root directory of this source tree.
// You may not use this file except in compliance with the License.

import Heap from "https://esm.sh/heap" /* CHECKME: file(s) didn't exist, assuming npm */;

function nmerge<T>(key: (a: T, b: T) => number, ...iterables: Array<Iterator<T>>): Iterator<T> {
  const heap: Heap<{ i: number; value: T }> = new Heap((a, b) => {
    return key(a.value, b.value);
  });
  for (let i = 0; i < iterables.length; i++) {
    const result = iterables[i]!.next();
    if (result.done !== true) {
      heap.push({ i, value: result.value });
    }
  }

  return {
    next: () => {
      if (heap.empty()) {
        return { done: true, value: undefined };
      }
      const { i } = heap.front()!;
      const next = iterables[i]!.next();
      if (next.done === true) {
        return { value: heap.pop()!.value, done: false };
      }
      return { value: heap.replace({ i, value: next.value }).value, done: false };
    },
  };
}

export default nmerge;
