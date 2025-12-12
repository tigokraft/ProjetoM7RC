import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRATION = process.env.JWT_EXPIRATION;
if (!SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!EXPIRATION) {
  throw new Error("JWT_EXPIRATION is not defined in environment variables");
}

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
