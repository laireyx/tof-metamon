import { TofMessage } from "./reader";
import {
  BooleanKey,
  BooleanKeys,
  CustomizationJson,
  FloatKey,
  FloatKeys,
  IntKey,
  IntKeys,
  StrKey,
  StrKeys,
} from "./types";

class TofUserLookup extends TofMessage {
  constructor(msg: TofMessage) {
    super(msg.buffer);
  }

  extractUserInfo() {
    return this.destruct<{
      name: string;
      uid: string;
    }>([
      { type: "uint[]", count: 29 },
      { type: "str" }, // Current Location
      { key: "name", type: "str" },
      { type: "str" },
      { key: "uid", type: "str" },
    ]);
  }

  skipUntilMountInfo() {
    while (true) {
      let strlen = this.readInt();
      while (strlen !== 0x0d) {
        if (strlen === undefined) {
          return false;
        }
        strlen = this.readInt();
      }
      const str = this.readSize(0x10)?.subarray(0, 0x0d)?.toString("utf-8");
      if (str === "OfflineMoment") break;
    }
    return true;
  }

  readI64Chunk(json: CustomizationJson) {
    const chunkSize = this.readInt() ?? 0;
    const i64Buffer = this.readSize(chunkSize - 4);
    const i64Type = this.readString();

    if (!i64Buffer || !i64Type) return;
  }

  readIntChunk(json: CustomizationJson) {
    const chunkSize = this.readInt() ?? 0;
    const intBuffer = this.readSize(chunkSize - 4);
    const intType = this.readString() as IntKey;

    if (!intBuffer || !intType) return;
    const intData = intBuffer.readInt32LE(intBuffer.length - 4);

    if (IntKeys.includes(intType)) {
      json[intType] = intData;
    }
  }

  readFloatChunk(json: CustomizationJson) {
    const chunkSize = this.readInt() ?? 0;
    const floatBuffer = this.readSize(chunkSize - 4);
    const floatType = this.readString() as FloatKey;

    if (!floatBuffer || !floatType) return;
    const floatData = floatBuffer.readFloatLE(floatBuffer.length - 4);

    if (FloatKeys.includes(floatType)) {
      json[floatType] = floatData;
    }
  }

  readBooleanChunk(json: CustomizationJson) {
    const chunkSize = this.readInt() ?? 0;
    const booleanBuffer = this.readSize(chunkSize - 4);
    const booleanType = this.readString() as BooleanKey;

    if (!booleanBuffer || !booleanType) return;
    const floatData = booleanBuffer.readInt8(booleanBuffer.length - 4);

    if (BooleanKeys.includes(booleanType)) {
      json[booleanType] = floatData & 1;
    }
  }

  readStringChunk(json: CustomizationJson) {
    const { strData, strType } = this.destruct<{
      strData: string;
      strType: StrKey;
    }>([
      { type: "uint[]", count: 4 },
      { key: "strData", type: "str" },
      { key: "strType", type: "str" },
    ]);

    if (!strData || !strType) return;

    if (StrKeys.includes(strType)) {
      json[strType] = strData;
    }
  }

  skipChunk() {
    const chunkSize = this.readInt() ?? 0;
    this.readSize(chunkSize - 4);
    this.readString();
  }
}

export default TofUserLookup;
