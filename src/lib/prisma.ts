import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
<<<<<<< HEAD
import pg from "pg";
=======
import { Pool } from "pg";
>>>>>>> 5355208039f95972db1fdb76a3268e64f123b436

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

<<<<<<< HEAD
const connectionString = process.env.DATABASE_URL;

const pool = connectionString ? new pg.Pool({ connectionString }) : null;
const adapter = pool ? new PrismaPg(pool) : undefined;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
=======
// Create a PostgreSQL connection pool
const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
>>>>>>> 5355208039f95972db1fdb76a3268e64f123b436
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
