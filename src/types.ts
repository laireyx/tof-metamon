type CustomizationJson = Partial<{
  RoleIndex: number;
  RoleCharacterType: number;
  HairIndex: number;
  ForeHairIndex: number;
  CenterHairIndex: number;
  BackHairIndex: number;
  UsePartHair: number;
  HatIndex: number;
  HairColor: string;
  HairColor2: string;
  HairColor3: string;
  HairSpecColor: string;
  HairBlendScale: number;
  EyelashIndex: number;
  SkinIndex: number;
  NoseIndex: number;
  BodyValue: number;
  NeckValue: number;
  ChestValue: number;
  ChestOpenValue: number;
  HeadValue: number;
  LegValue: number;
  PlayerMorphData: string;
  HeadBonesData: string;
  BrowIndex: number;
  EyebrowColor: string;
  UseEyeTwo: number;
  EyeIndex: number;
  EyeballIndex: number;
  RightEyeballIndex: number;
  EyeColor: string;
  EyeColor2: string;
  EyeColor3: string;
  EyeColor4: string;
  RightEyeColor: string;
  RightEyeColor2: string;
  RightEyeColor3: string;
  RightEyeColor4: string;
  FaceIndex: number;
  FaceColor: string;
  FaceMarkOffset: string;
  FaceMirror: number;
  DressFashionId: string;
  DressFashionColor: string;
  HeadwearFashionId: string;
  HeadwearFashionOffset: string;
  HeadwearFashionScale: string;
  ImitationId: string;
}>;

const StrKeys = [
  "HairColor",
  "HairColor2",
  "HairColor3",
  "HairSpecColor",
  "PlayerMorphData",
  "HeadBonesData",
  "EyebrowColor",
  "EyeColor",
  "EyeColor2",
  "EyeColor3",
  "EyeColor4",
  "RightEyeColor",
  "RightEyeColor2",
  "RightEyeColor3",
  "RightEyeColor4",
  "FaceColor",
  "FaceMarkOffset",
  "DressFashionId",
  "DressFashionColor",
  "HeadwearFashionId",
  "HeadwearFashionOffset",
  "HeadwearFashionScale",
  "ImitationId",
] as const;

const IntKeys = [
  "RoleIndex",
  "RoleCharacterType",
  "HairIndex",
  "ForeHairIndex",
  "CenterHairIndex",
  "BackHairIndex",
  "UsePartHair",
  "HatIndex",
  "EyelashIndex",
  "SkinIndex",
  "NoseIndex",
  "ChestValue",
  "LegValue",
  "BrowIndex",
  "EyeIndex",
  "EyeballIndex",
  "RightEyeballIndex",
  "FaceIndex",
] as const;

const FloatKeys = [
  "HairBlendScale",
  "BodyValue",
  "NeckValue",
  "ChestOpenValue",
  "HeadValue",
  "FaceMirror",
] as const;

const BooleanKeys = ["UseEyeTwo"] as const;

type StrKey = typeof StrKeys[number];
type IntKey = typeof IntKeys[number];
type FloatKey = typeof FloatKeys[number];
type BooleanKey = typeof BooleanKeys[number];

export { StrKeys, IntKeys, FloatKeys, BooleanKeys };
export type { CustomizationJson, StrKey, IntKey, FloatKey, BooleanKey };
