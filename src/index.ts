import fs from "node:fs/promises";
import process from "node:process";

import TofUserLookup from "./lookup";
import TofMessageBuilder from "./msg-builder";
import { TofReader } from "./reader";
import TofSocket from "./socket";
import { CustomizationJson } from "./types";

type Server = "101" | "102";
const servers = {
  "101": "8.213.133.1",
  "102": "8.213.130.139",
} as const;

async function metamon(uid: string, server: Server) {
  const LOOKUP = new TofMessageBuilder()
    .add([
      0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x0c, 0x00, 0x04, 0x00,
      0x00, 0x00, 0x08, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x70, 0x04, 0x00, 0x00,
      0x68, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x10, 0x00,
      0x04, 0x00, 0x08, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x0c, 0x00, 0x00, 0x00,
      0x0a, 0x00, 0x00, 0x00, 0x3f, 0x01, 0x00, 0x00, 0x48, 0x00, 0x00, 0x00,
      0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0e, 0x00, 0x14, 0x00, 0x04, 0x00,
      0x08, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x10, 0x00, 0x0e, 0x00, 0x00, 0x00,
      0x18, 0x00, 0x00, 0x00, 0x61, 0xae, 0x0a, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x8c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    .freeze();

  const lookupSocket = new TofSocket({ host: servers[server], port: 30031 });
  const reader = new TofReader(lookupSocket.socket);

  lookupSocket.on("readable", async () => {
    const rawMsg = reader.readMessage();
    if (rawMsg == null) return;

    const msg = new TofUserLookup(rawMsg);

    const { name, uid } = msg.extractUserInfo();

    if (!name || !uid || uid?.length !== 17) {
      return;
    }

    const record: CustomizationJson = {};

    if (!msg.skipUntilMountInfo()) return;

    for (let i = 0; i < 256; i++) {
      // Skip unneccessary 4B.
      msg.readInt();
      // This is chunk type.
      const chunkType = msg.readInt();

      if (chunkType === 0x01000000) {
        msg.readIntChunk(record);
      } else if (chunkType === 0x06000000) {
        msg.readStringChunk(record);
      } else if (chunkType === 0x08000000) {
        msg.readFloatChunk(record);
      } else if (chunkType === 0x0b000000) {
        msg.readBooleanChunk(record);
      } else {
        msg.skipChunk();
      }
    }

    await fs.writeFile("1.json", JSON.stringify(record, null, 4));
    process.exit();
  });

  lookupSocket.send(LOOKUP.addString(uid).build());
}

let uid: string | null = null;

process.stdin.on("data", async (data) => {
  if (!uid) {
    const str = data.toString("utf-8").replace(/[\r\n]/g, "");
    if (str.length === 17) {
      console.log("아스트라 : 1 / 뱅기스 : 2를 입력하세요");
      uid = str;
    } else {
      console.log("잘못된 UID입니다.");
    }
  } else {
    const str = data.toString("utf-8").replace(/[\r\n]/g, "");

    if (str === "1") {
      await metamon(uid, "101");
    } else if (str === "2") {
      await metamon(uid, "102");
    } else {
      console.log("잘못된 서버입니다.");
    }
  }
});

console.log("UID를 입력하세요");
