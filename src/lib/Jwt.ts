import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const SECRET_ENV = process.env.JWT_SECRET;
const EXPIRATION_ENV = process.env.JWT_EXPIRATION;
if (!SECRET_ENV) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!EXPIRATION_ENV) {
  throw new Error("JWT_EXPIRATION is not defined in environment variables");
}

// TypeScript now knows these are defined after the checks above
const SECRET: string = SECRET_ENV;
const EXPIRATION: StringValue | number = EXPIRATION_ENV as StringValue;

export function signToken(payload: object): any {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRATION });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}
