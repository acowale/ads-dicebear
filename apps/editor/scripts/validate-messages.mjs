import { OptionsDescriptor, Style } from '@acowale/core';
import { camelCase } from 'change-case';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

const LANGUAGES = ['en', 'de', 'pt'];

// Kept out of the editor by getSchemaOptions, because the export is static.
const HIDDEN = new Set(['animationVariant']);

const problems = [];

const source = readFileSync(path.join(root, 'src/config/styles.ts'), 'utf8');
const styleNames = [
  ...source.matchAll(/from '@dicebear\/styles\/([a-z0-9-]+)\.json'/g),
].map((match) => match[1]);

if (styleNames.length === 0) {
  console.error('No styles found in src/config/styles.ts');
  process.exit(1);
}

const messages = Object.fromEntries(
  LANGUAGES.map((language) => [
    language,
    JSON.parse(
      readFileSync(path.join(root, `src/messages/${language}.json`), 'utf8'),
    ),
  ]),
);

/** Mirrors `label()` in components/OptionsTabs.vue. */
function label(message, styleKey, key) {
  return message.styles?.[styleKey]?.[key] ?? message[key];
}

/** The option keys the editor draws a tab for, in the order it draws them. */
function labelledKeys(styleName) {
  const style = new Style(require(`@dicebear/styles/${styleName}.json`));
  const descriptor = new OptionsDescriptor(style).toJSON();

  return Object.entries(descriptor)
    .filter(([key, field]) => {
      if (HIDDEN.has(key)) {
        return false;
      }

      return (
        field.type === 'color' ||
        (field.type === 'enum' && field.weighted === true)
      );
    })
    .map(([key]) => key);
}

const reached = new Set();

for (const styleName of styleNames) {
  const styleKey = camelCase(styleName);
  const keys = labelledKeys(styleName);

  for (const language of LANGUAGES) {
    const message = messages[language];
    const byLabel = new Map();

    for (const key of keys) {
      if (message.styles?.[styleKey]?.[key] !== undefined) {
        reached.add(`${language}.${styleKey}.${key}`);
      }

      const text = label(message, styleKey, key);

      if (text === undefined) {
        problems.push(
          `${language}: "${key}" has no label, needed by ${styleName}`,
        );
        continue;
      }

      byLabel.set(text, [...(byLabel.get(text) ?? []), key]);
