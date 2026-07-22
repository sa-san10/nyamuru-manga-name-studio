import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { NDM_SCHEMA_NAME, parseMangaYaml, validateManga } from '../src/lib/manga.ts';

const sampleSource = readFileSync(new URL('../src/content/sample.omny.yaml', import.meta.url), 'utf8');

test('サンプルがNDMの正式なスキーマ名とバージョンを持つ', () => {
  const document = parseMangaYaml(sampleSource);
  assert.equal(document.manga.schema_name, NDM_SCHEMA_NAME);
  assert.equal(document.manga.schema_version, 10);
});

test('サンプルは作者名を持ち、フッター規則がstyle_notesとlayout_specに揃っている', () => {
  const document = parseMangaYaml(sampleSource);
  assert.match(document.manga.meta.author, /sa-san10/);
  assert.ok(document.manga.meta.style_notes.some((note) => note.includes('meta.author')));
  assert.ok(document.manga.layout_spec.includes('ページフッターの座標'));
});

test('author の無い旧データには空文字を自動補完する', () => {
  const legacySource = sampleSource.replace(/^ {4}author: .*\n/m, '');
  const document = parseMangaYaml(legacySource);
  assert.equal(document.manga.meta.author, '');
});

test('旧データにNDMのスキーマ名を自動補完する', () => {
  const legacySource = sampleSource.replace(`  schema_name: "${NDM_SCHEMA_NAME}"\n`, '');
  const document = parseMangaYaml(legacySource);
  assert.equal(document.manga.schema_name, NDM_SCHEMA_NAME);
});

test('旧OMNYスキーマ名をNDMの正式名へ移行する', () => {
  const source = sampleSource.replace(
    `schema_name: "${NDM_SCHEMA_NAME}"`,
    'schema_name: "Open Manga Name YAML"',
  );
  const document = parseMangaYaml(source);
  assert.equal(document.manga.schema_name, NDM_SCHEMA_NAME);
});

test('異なるスキーマ名をNDM検査で拒否する', () => {
  const source = sampleSource.replace(
    `schema_name: "${NDM_SCHEMA_NAME}"`,
    'schema_name: "Another Manga Format"',
  );
  const issues = validateManga(parseMangaYaml(source));
  assert.ok(issues.some((issue) => issue.level === 'error' && issue.path === 'manga.schema_name'));
});
