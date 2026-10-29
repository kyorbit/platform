import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const EXPORT =
  /^export (?:declare )?(?:const|type|interface|function|enum|class) (\w+)/gm;

describe('contract DTOs', () => {
  it('export each name from exactly one domain', () => {
    const owners = new Map<string, Array<string>>();
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === '__tests__') continue;
      const dto = join(root, entry.name, 'dto.ts');
      let source: string;
      try {
        source = readFileSync(dto, 'utf8');
      } catch {
        continue;
      }
      for (const [, name] of source.matchAll(EXPORT)) {
        owners.set(name, [...(owners.get(name) ?? []), entry.name]);
      }
    }
    const duplicates = [...owners].filter(([, domains]) => domains.length > 1);
    expect(duplicates).toEqual([]);
  });
});
