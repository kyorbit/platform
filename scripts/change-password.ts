import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { neon } from '@neondatabase/serverless';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { PasswordSchema } from '../src/lib/validations';

const { values } = parseArgs({
  options: {
    user: { type: 'string', short: 'u' },
    password: { type: 'string', short: 'p' },
  },
  strict: true,
});

const identifier = values.user?.trim();
let password = values.password;

if (!identifier) {
  console.error(
    'Usage: bun run auth:change-password -- --user <username-or-email> [--password <new-password>]'
  );
  process.exit(1);
}

if (!password) {
  if (!process.stdin.isTTY) {
    console.error(
      'Missing --password (omit it only in an interactive terminal to be prompted).'
    );
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = (await rl.question(`New password for "${identifier}": `)).trim();
  rl.close();
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set (check .env.local).');
  process.exit(1);
}

const parsed = PasswordSchema.safeParse(password);
if (!parsed.success) {
  console.error(
    `Password validation failed (received ${password.length} chars): ${parsed.error.issues[0]?.message ?? 'Password not strong enough.'}`
  );
  process.exit(1);
}

const sql = neon(databaseUrl);
const hash = await hashPassword(password);

const updated = await sql.query(
  `UPDATE "account" a
   SET "password" = $1, "accountId" = u."id"::text, "updatedAt" = NOW()
   FROM "user" u
   WHERE a."userId" = u."id"
     AND a."providerId" = 'credential'
     AND (u."username" = $2 OR u."email" = $2)
   RETURNING u."id" AS "userId", u."username", u."email", a."password" AS "savedHash"`,
  [hash, identifier]
);

if (updated.length === 0) {
  console.error(`No credential account found for user "${identifier}".`);
  process.exit(1);
}

const target = updated[0] as {
  userId: string;
  username: string | null;
  email: string;
  savedHash: string;
};

const verified = await verifyPassword({
  hash: target.savedHash,
  password,
});
if (!verified) {
  console.error('Saved password hash failed verification.');
  process.exit(1);
}

await sql.query(`DELETE FROM "session" WHERE "userId" = $1`, [target.userId]);

console.log(
  `Updated password (${password.length} chars, hash verified) and revoked sessions for ${target.username ?? target.email}.`
);
