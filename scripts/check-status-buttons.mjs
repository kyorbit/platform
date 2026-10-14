import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const failures = [];
let count = 0;
let labelCount = 0;
for (const relative of fs.readdirSync('src', { recursive: true })) {
  if (!relative.endsWith('.tsx') || relative.includes('__tests__')) continue;
  const file = path.join('src', relative);
  const source = fs.readFileSync(file, 'utf8');
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const visit = (node) => {
    if (ts.isJsxElement(node)) {
      const name = node.openingElement.tagName.getText(tree);
      const line =
        tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
      const children = node.children.filter(
        (child) => !ts.isJsxText(child) || child.text.trim()
      );
      if (name === 'StatusButton') {
        count++;
        if (
          node.openingElement.attributes.properties.some(
            (item) =>
              ts.isJsxAttribute(item) && item.name.text === 'successLabel'
          )
        ) {
          labelCount++;
        }
        if (children.length === 1 && ts.isJsxFragment(children[0])) {
          failures.push(`${file}:${line}: unnecessary child fragment`);
        }
      }
      // Combobox triggers show query loading; they do not start async actions.
      if (
        (name === 'Button' || name === 'button') &&
        !file.endsWith('form-combobox.tsx') &&
        !file.endsWith('status-button.tsx') &&
        children.some((child) =>
          /<(Spinner|Loader2)\b/.test(child.getText(tree))
        )
      ) {
        failures.push(`${file}:${line}: legacy async button spinner`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${count} StatusButton usages (${labelCount} success labels): no redundant fragments or legacy spinner buttons.`
  );
}
