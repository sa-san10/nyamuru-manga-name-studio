import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parse } from 'yaml';
import { OMAY_SPEC_NAME, omayFileName, omnyFileName, parseMangaYaml, parseOmayYaml, safeFileName, toMangaYaml, toOmayYaml, toSeparatedMangaYaml } from '../src/lib/manga.ts';

const omaySource = readFileSync(new URL('../src/content/standard.omay.yaml', import.meta.url), 'utf8');
const sampleSource = readFileSync(new URL('../src/content/sample.omny.yaml', import.meta.url), 'utf8');

test('標準OMAYテンプレートがspec情報と両ルールを持つ', () => {
  const omay = parseOmayYaml(omaySource);
  assert.equal(omay.spec_name, OMAY_SPEC_NAME);
  assert.equal(omay.spec_version, 10.2);
  assert.ok(omay.style_notes.length > 0);
  assert.ok(omay.layout_spec.includes('出力枚数(最重要)'));
  assert.ok(omay.layout_spec.includes('ページフッターの座標'));
  assert.ok(omay.layout_spec.includes('配置の優先順位'));
});

test('生成プロンプト本体には定型ブロックが残っていない', () => {
  const prompt = readFileSync(new URL('../src/content/nyamuru-manga-generation-prompt-v10.md', import.meta.url), 'utf8');
  assert.ok(!prompt.includes('style_notes の内容（作画・演出ルール一般）'));
  assert.ok(!prompt.includes('layout_spec の内容（画像生成AI向け'));
  assert.ok(prompt.includes('OMAY'));
});

test('分離版OMNYは画像生成ルールを含まず、ネームデータは全部入り版と同一', () => {
  const document = parseMangaYaml(sampleSource);
  const separated = parse(toSeparatedMangaYaml(document));
  assert.equal(separated.manga.meta.style_notes, undefined);
  assert.equal(separated.manga.layout_spec, undefined);
  // 全部入り版＝分離版＋ルールの合成。ルールを除けば両者は一致する
  const full = parse(toMangaYaml(document));
  delete full.manga.meta.style_notes;
  delete full.manga.layout_spec;
  assert.deepEqual(separated, full);
});

test('分離版OMNYを読み戻すと空のルール欄が補完される', () => {
  const document = parseMangaYaml(sampleSource);
  const reloaded = parseMangaYaml(toSeparatedMangaYaml(document));
  assert.deepEqual(reloaded.manga.meta.style_notes, []);
  assert.equal(reloaded.manga.layout_spec, '');
});

test('作品情報のルールをOMAYとして書き出すと読み戻せる', () => {
  const document = parseMangaYaml(sampleSource);
  const omay = parseOmayYaml(toOmayYaml(document));
  assert.deepEqual(omay.style_notes, document.manga.meta.style_notes);
  assert.equal(omay.layout_spec, document.manga.layout_spec);
  assert.equal(omay.spec_version, document.manga.schema_version);
});

test('保存2種類とOMAYのファイル名に対応する拡張子が付く', () => {
  assert.equal(safeFileName('にゃむる'), 'にゃむる.yaml');
  assert.equal(omnyFileName('にゃむる'), 'にゃむる.omny.yaml');
  assert.equal(omayFileName(''), 'manga-name.omay.yaml');
});

test('壊れたOMAYを拒否する', () => {
  assert.throws(() => parseOmayYaml('style_notes: "not-an-array"\nlayout_spec: ""'));
  assert.throws(() => parseOmayYaml('42'));
});
