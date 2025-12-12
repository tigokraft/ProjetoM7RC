import bcrypt from "bcryptjs";

export async function hashPassword(data: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(
    data,
    Number(process.env.BCRYPT_SALT_ROUNDS)
  );
  return hashedPassword;
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
