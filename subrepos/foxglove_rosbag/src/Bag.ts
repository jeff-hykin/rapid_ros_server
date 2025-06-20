// Copyright 2018-2020 Cruise LLC
// Copyright 2021 Foxglove Technologies Inc
//
// This source code is licensed under the Apache License, Version 2.0,
// found in the LICENSE file in the root directory of this source tree.
// You may not use this file except in compliance with the License.

import rosmsg from "https://esm.sh/@foxglove/rosmsg@5.0.4";
const parseMessageDefinition = rosmsg.parse
import { MessageReader } from "https://esm.sh/@foxglove/rosmsg-serialization";
import { compare, Time } from "https://esm.sh/@foxglove/rostime";

import BagReader from "./BagReader.ts";
import { ForwardIterator } from "./ForwardIterator.ts";
import ReadResult from "./ReadResult.ts";
import { ReverseIterator } from "./ReverseIterator.ts";
import { BagHeader, ChunkInfo, Connection, MessageData } from "./record.ts";
import { Filelike, Decompress, MessageIterator, IteratorConstructorArgs } from "./types.ts";

export type ReadOptions = {
  decompress?: Decompress;
  noParse?: boolean;
  topics?: string[];
  startTime?: Time;
  endTime?: Time;
  freeze?: boolean;
};

export type BagOpt = {
  decompress?: Decompress;
  parse?: boolean;
};

export type MessageIteratorOpt = {
  start?: Time;
  topics?: string[];
  reverse?: boolean;
};

export default class Bag {
  reader: BagReader;
  header?: BagHeader;
  connections: Map<number, Connection>;
  chunkInfos: ChunkInfo[] = [];
  startTime?: Time;
  endTime?: Time;

  private bagOpt: BagOpt;

  constructor(filelike: Filelike, opt?: BagOpt) {
    this.reader = new BagReader(filelike);
    this.connections = new Map<number, Connection>();
    this.bagOpt = opt ?? {};
  }

  // if the bag is manually created with the constructor, you must call `await open()` on the bag
  // generally this is called for you if you're using `const bag = await Bag.open()`
  async open(): Promise<void> {
    this.header = await this.reader.readHeader();
    const { connectionCount, chunkCount, indexPosition } = this.header;

    const result = await this.reader.readConnectionsAndChunkInfo(
      indexPosition,
      connectionCount,
      chunkCount,
    );

    this.connections = new Map<number, Connection>();

    result.connections.forEach((connection) => {
      this.connections.set(connection.conn, connection);
    });

    this.chunkInfos = result.chunkInfos;

    if (chunkCount > 0) {
      this.startTime = this.chunkInfos[0]!.startTime;
      this.endTime = this.chunkInfos[chunkCount - 1]!.endTime;
    }
  }

  messageIterator(opt?: MessageIteratorOpt): MessageIterator {
    const topics = opt?.topics;

    let parse: IteratorConstructorArgs["parse"] | undefined;
    if (this.bagOpt.parse !== false) {
      parse = (data, connection) => {
        // lazily create a reader for this connection if it doesn't exist
        connection.reader ??= new MessageReader(
          parseMessageDefinition(connection.messageDefinition),
        );
        return connection.reader.readMessage(data);
      };
    }

    if (opt?.reverse === true) {
      const position = opt?.start ?? this.endTime;
      if (!position) {
        throw new Error("no timestamp");
      }

      return new ReverseIterator({
        position,
        topics,
        reader: this.reader,
        connections: this.connections,
        chunkInfos: this.chunkInfos,
        decompress: this.bagOpt.decompress ?? {},
        parse,
      });
    } else {
      const position = opt?.start ?? this.startTime;
      if (!position) {
        throw new Error("no timestamp");
      }

      return new ForwardIterator({
        position,
        topics,
        reader: this.reader,
        chunkInfos: this.chunkInfos,
        connections: this.connections,
        decompress: this.bagOpt.decompress ?? {},
        parse,
      });
    }
  }

  /**
   * @deprecated Prefer the messageIterator method instead.
   * @param opts
   * @param callback
   */
  async readMessages<T = unknown>(
    opts: ReadOptions,
    callback: (msg: ReadResult<T>) => void,
  ): Promise<void> {
    const connections = this.connections;

    const startTime = opts.startTime ?? { sec: 0, nsec: 0 };
    const endTime = opts.endTime ?? { sec: Number.MAX_VALUE, nsec: Number.MAX_VALUE };
    const topics = opts.topics ?? [...connections.values()].map((connection) => connection.topic);

    const filteredConnections = [...connections.values()]
      .filter((connection) => {
        return topics.includes(connection.topic);
      })
      .map((connection) => connection.conn);

    const { decompress = {} } = opts;

    // filter chunks to those which fall within the time range we're attempting to read
    const chunkInfos = this.chunkInfos.filter((info) => {
      return compare(info.startTime, endTime) <= 0 && compare(startTime, info.endTime) <= 0;
    });

    function parseMsg(msg: MessageData, chunkOffset: number): ReadResult<T> {
      const connection = connections.get(msg.conn);
      if (connection == null) {
        throw new Error(`Unable to find connection with id ${msg.conn}`);
      }
      const { topic } = connection;
      const { data, time: timestamp } = msg;
      if (data == null) {
        throw new Error(`No data in message for topic: ${topic}`);
      }
      let message = null;
      if (opts.noParse !== true) {
        // lazily create a reader for this connection if it doesn't exist
        connection.reader =
          connection.reader ??
          new MessageReader(parseMessageDefinition(connection.messageDefinition), {
            freeze: opts.freeze,
          });
        message = connection.reader.readMessage<T>(data);
      }
      return new ReadResult<T>(
        topic,
        message!,
        timestamp,
        data,
        chunkOffset,
        chunkInfos.length,
        opts.freeze,
      );
    }

    for (let i = 0; i < chunkInfos.length; i++) {
      const info = chunkInfos[i]!;
      const messages = await this.reader.readChunkMessages(
        info,
        filteredConnections,
        startTime,
        endTime,
        decompress,
      );
      messages.forEach((msg) => callback(parseMsg(msg, i)));
    }
  }
}
