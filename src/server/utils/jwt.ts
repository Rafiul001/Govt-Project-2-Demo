import config from "@/server/config";
import {
  tokenType,
  type ITokenPayload,
  type TAdminTypes,
} from "@/shared/types";
import { sign, verify } from "hono/jwt";

const ALG = "HS256" as const;

type TTokenInput = {
  sub: number;
  adminType: TAdminTypes;
};

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export async function generateAccessToken(input: TTokenInput): Promise<string> {
  return sign(
    {
      sub: input.sub,
      adminType: input.adminType,
      type: tokenType.ACCESS,
      exp: nowInSeconds() + config.ACCESS_TOKEN_EXPIRES_IN,
    },
    config.ACCESS_TOKEN_SECRET,
    ALG,
  );
}

export async function generateRefreshToken(
  input: TTokenInput,
): Promise<string> {
  return sign(
    {
      sub: input.sub,
      adminType: input.adminType,
      type: tokenType.REFRESH,
      exp: nowInSeconds() + config.REFRESH_TOKEN_EXPIRES_IN,
    },
    config.REFRESH_TOKEN_SECRET,
    ALG,
  );
}

export async function verifyAccessToken(token: string): Promise<ITokenPayload> {
  const payload = await verify(token, config.ACCESS_TOKEN_SECRET, ALG);
  return payload as unknown as ITokenPayload;
}

export async function verifyRefreshToken(
  token: string,
): Promise<ITokenPayload> {
  const payload = await verify(token, config.REFRESH_TOKEN_SECRET, ALG);
  return payload as unknown as ITokenPayload;
}
