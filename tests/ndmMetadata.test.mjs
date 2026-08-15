import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { NDM_SCHEMA_NAME, parseMangaYaml, validateManga } from '../src/lib/manga.ts';

const sampleSource = readFileSync(new URL('../src/content/sample.omny.yaml', import.meta.url), 'utf8');

test('サンプルがNDMの正式なスキーマ名とバージョンを持つ', () => {
  const document = parseMangaYaml(sampleSource);
  assert.equal(document.manga.schema_name, NDM_SCHEMA_NAME);
  assert.equal(document.manga.schema_version, 10.31);
});

test('サンプルはNDM検査でエラーを出さない', () => {
  const issues = validateManga(parseMangaYaml(sampleSource));
  assert.deepEqual(issues.filter((issue) => issue.level === 'error'), []);
});

test('bleed辺が紙端座標と一致しない場合はエラーになる', () => {
  const document = parseMangaYaml(sampleSource);
  document.manga.pages[0].panels[0].bleed = ['left']; // x:10 のコマなので左端に達していない
  const issues = validateManga(document);
  assert.ok(issues.some((issue) => issue.level === 'error' && issue.path.endsWith('.bleed')));
});

test('上タチキリ（bleed: top）は y: 0 のコマでのみ宣言できる', () => {
  const document = parseMangaYaml(sampleSource);
  const panel = document.manga.pages[0].panels[0];
  panel.bleed = ['top']; // y:10 のコマなので上端に達していない
  assert.ok(validateManga(document).some((issue) => issue.level === 'error' && issue.path.endsWith('.bleed')));
  panel.shape = { ...panel.shape, y: 0, h: 90 };
  assert.ok(!validateManga(document).some((issue) => issue.level === 'error' && issue.path.endsWith('.bleed')));
});

test('無人コマ宣言（no_figures）と figures の併用はエラーになる', () => {
  const document = parseMangaYaml(sampleSource);
  document.manga.pages[0].panels[0].no_figures = true; // figures があるコマ
  const issues = validateManga(document);
  assert.ok(issues.some((issue) => issue.level === 'error' && issue.path.endsWith('.no_figures')));
});

test('object: true の figure は物の配置として警告を出さない', () => {
  const document = parseMangaYaml(sampleSource);
  document.manga.pages[0].panels[0].figures.push({ name: 'ノートPC', object: true, bbox: { x: 120, y: 60, w: 30, h: 20 } });
  const issues = validateManga(document);
  assert.ok(!issues.some((issue) => issue.path.includes('.figures[1]')));
});

test('materials の物に一致する figure に object が無ければ付け忘れを提案する', () => {
  const document = parseMangaYaml(sampleSource);
  document.manga.pages[0].panels[0].figures.push({ name: 'ノートPC', bbox: { x: 120, y: 60, w: 30, h: 20 } });
  const issues = validateManga(document);
  assert.ok(issues.some((issue) => issue.level === 'warning' && issue.path.endsWith('.figures[1].object')));
});

test('無人コマ宣言（no_figures）でも物（object: true）の figure は書ける', () => {
  const document = parseMangaYaml(sampleSource);
  const panel = document.manga.pages[0].panels[0];
  panel.figures = [{ name: 'ノートPC', object: true, bbox: { x: 120, y: 60, w: 30, h: 20 } }];
  panel.no_figures = true;
  const issues = validateManga(document);
  assert.ok(!issues.some((issue) => issue.level === 'error' && issue.path.endsWith('.no_figures')));
});

test('コマ内にいる話者への offscreen は警告になる', () => {
  const document = parseMangaYaml(sampleSource);
  document.manga.pages[0].panels[0].bubbles[1].offscreen = true; // 話者ツクルは figures にいる
  const issues = validateManga(document);
  assert.ok(issues.some((issue) => issue.level === 'warning' && issue.path.endsWith('.offscreen')));
});

test('サンプルは作者名を持ち、フッター規則がstyle_notesとlayout_specに揃っている', () => {
  const document = parseMangaYaml(sampleSource);
  assert.match(document.manga.meta.author, /sa-san10/);
  assert.ok(document.manga.meta.style_notes.some((note) => note.includes('meta.author')));
  assert.ok(document.manga.layout_spec.includes('ページヘッダー・フッター'));
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
