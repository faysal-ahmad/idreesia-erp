import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(root, 'idreesia-common/server/graphql-api');
const outputPath = join(root, 'types/generated/schema.graphql');
const graphqlFilePattern = join(sourceRoot, '**/*.{js,jsx,ts,tsx}');
const gqlTemplatePattern = /gql`([\s\S]*?)`/g;

const files = await glob(graphqlFilePattern, {
  ignore: ['**/node_modules/**', '**/generated/**'],
});

const schemaParts = [
  'directive @checkPermissions(permissions: [String]) on FIELD_DEFINITION',
  'directive @checkInstanceAccess(instanceIdArgName: String) on FIELD_DEFINITION',
  'type Query',
  'type Mutation',
];

for (const file of files.sort()) {
  if (!['.js', '.jsx', '.ts', '.tsx'].includes(extname(file))) {
    continue;
  }

  const source = await readFile(file, 'utf8');
  const matches = [...source.matchAll(gqlTemplatePattern)];

  for (const match of matches) {
    schemaParts.push(match[1].trim());
  }
}

await mkdir(join(root, 'types/generated'), { recursive: true });
await writeFile(outputPath, `${schemaParts.filter(Boolean).join('\n\n')}\n`, 'utf8');

console.log(`Extracted ${schemaParts.length - 4} GraphQL SDL blocks to ${outputPath}`);
