import fs from "node:fs/promises";
import process from "node:process";

import TofUserLookup from "./lookup";
import TofMessageBuilder from "./msg-builder";
import { TofReader } from "./reader";
import TofSocket from "./socket";
import { CustomizationJson } from "./types";

async function metamon(uid: string) {
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

  const lookupSocket = new TofSocket();
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
      } else if (chunkType === 0x03000000) {
        msg.readI64Chunk(record);
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

    // 잘 모르겠지만 아무튼 1
    record.FaceMirror = 1;

    await fs.writeFile("output.json", JSON.stringify(record));
    process.exit();
  });

  lookupSocket.send(LOOKUP.addString(uid).build());
}

process.stdin.on("data", async (data) => {
  const uid = data.toString("utf-8").replace(/[\r\n]/g, "");
  if (uid.length === 17) {
    console.log("Run with UID " + uid);
    await metamon(uid);
  } else {
    console.log("잘못된 UID입니다.");
  }
});

console.log("UID를 입력하세요");
