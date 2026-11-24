import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { neon } from '@neondatabase/serverless';
import { hashPassword } from 'better-auth/crypto';
import { PasswordSchema } from '../src/lib/validations';

const USERNAME_RE = /^[a-zA-Z0-9_.-]+$/;

const { values } = parseArgs({
  options: {
    user: { type: 'string', short: 'u' },
    password: { type: 'string', short: 'p' },
    email: { type: 'string', short: 'e' },
    name: { type: 'string', short: 'n' },
  },
  strict: true,
});

const rawUsername = values.user?.trim();
const password = values.password;

if (!rawUsername || !password) {
  console.error(
    'Usage: bun run auth:create-user -- --user <username> --password <password> [--email <email>] [--name <name>]'
  );
  process.exit(1);
}

if (rawUsername.length < 3 || !USERNAME_RE.test(rawUsername)) {
  console.error(
    'Username must be at least 3 characters and contain only letters, numbers, "_", ".", or "-".'
  );
  process.exit(1);
}

const parsed = PasswordSchema.safeParse(password);
if (!parsed.success) {
  console.error(
    `Password validation failed: ${parsed.error.issues[0]?.message ?? 'Password not strong enough.'}`
  );
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set (check .env.local).');
  process.exit(1);
}

const username = rawUsername.toLowerCase();
const email = (
  values.email?.trim() || `${username}@kyorbit.local`
).toLowerCase();
const name = values.name?.trim() || rawUsername;

const sql = neon(databaseUrl);
const existing = await sql.query(
  `SELECT "username", "email" FROM "user" WHERE "username" = $1 OR "email" = $2 LIMIT 1`,
  [username, email]
);

if (existing.length > 0) {
  console.error(
    `User already exists with username "${username}" or email "${email}".`
  );
  process.exit(1);
}

const userId = randomUUID();
const accountId = randomUUID();
const hash = await hashPassword(password);

await sql.transaction([
  sql.query(
    `INSERT INTO "user" ("id", "name", "email", "emailVerified", "username", "displayUsername", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, true, $4, $5, NOW(), NOW())`,
    [userId, name, email, username, rawUsername]
  ),
  sql.query(
    `INSERT INTO "account" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())`,
    [accountId, userId, userId, hash]
  ),
]);

console.log(`Created admin user "${username}" (${email}) [${userId}].`);
