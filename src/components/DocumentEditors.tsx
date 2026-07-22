import { AlertCircle, BookOpenCheck, Check, CircleAlert, Plus, Sparkles, Trash2, WandSparkles } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import type { MangaDocument, MaterialType, ValidationIssue } from '../types';
import { Field, SectionTitle, TextListEditor } from './Fields';

interface BaseProps { document: MangaDocument; onChange: (document: MangaDocument) => void }

function mutateDocument(document: MangaDocument, onChange: (document: MangaDocument) => void, recipe: (draft: MangaDocument) => void) {
  const next = structuredClone(document); recipe(next); onChange(next);
}

export function MetaEditor({ document, onChange }: BaseProps) {
  const { manga } = document;
  const update = (recipe: (draft: MangaDocument) => void) => mutateDocument(document, onChange, recipe);
  return <EditorShell eyebrow="DOCUMENT" title="作品情報" description="作品全体の基本情報と、生成時に共通で使う作画ルールを管理します。">
    <section class="content-card">
      <SectionTitle index="01" title="基本情報" description="meta" />
      <div class="form-grid-wide">
        <Field label="作品タイトル" wide><input value={manga.meta.title} onInput={(event) => update((draft) => { draft.manga.meta.title = event.currentTarget.value; })} /></Field>
        <Field label="作者名" hint="ページ下端に表示"><input value={manga.meta.author} placeholder="空欄なら非表示" onInput={(event) => update((draft) => { draft.manga.meta.author = event.currentTarget.value; })} /></Field>
        <Field label="形式"><input value={manga.meta.format} onInput={(event) => update((draft) => { draft.manga.meta.format = event.currentTarget.value; })} /></Field>
        <Field label="ページ数" hint="自動同期"><input type="number" value={manga.pages.length} disabled /></Field>
        <Field label="NDMスキーマ名" hint="固定"><input value={manga.schema_name} disabled /></Field>
        <Field label="NDMバージョン"><input type="number" min="9" max="10" value={manga.schema_version} onInput={(event) => update((draft) => { draft.manga.schema_version = Number(event.currentTarget.value); })} /></Field>
        <Field label="読み方向"><input value={manga.meta.reading_direction} onInput={(event) => update((draft) => { draft.manga.meta.reading_direction = event.currentTarget.value; })} /></Field>
        <Field label="文字方向"><input value={manga.meta.text_orientation} onInput={(event) => update((draft) => { draft.manga.meta.text_orientation = event.currentTarget.value; })} /></Field>
        <Field label="フォント"><input value={manga.meta.font} onInput={(event) => update((draft) => { draft.manga.meta.font = event.currentTarget.value; })} /></Field>
      </div>
      {manga.schema_version !== 10 && <div class="upgrade-banner"><div><WandSparkles size={20} /><span><strong>NDM v10の説明書を使用中</strong><small>構造を保ったままNDMバージョンを更新できます。</small></span></div><button onClick={() => update((draft) => { draft.manga.schema_version = 10; })}>NDM v10 に更新</button></div>}
    </section>
    <section class="content-card">
      <SectionTitle index="02" title="作画・演出ルール" description={`${manga.meta.style_notes.length} 個の style_notes`} />
      <TextListEditor values={manga.meta.style_notes} placeholder="作画ルール" onChange={(values) => update((draft) => { draft.manga.meta.style_notes = values; })} />
    </section>
    <section class="content-card">
      <SectionTitle index="03" title="レイアウト仕様" description="layout_spec / 複数行テキスト" />
      <Field label="画像生成AI向け座標・寸法ルール" wide><textarea class="large-textarea" value={manga.layout_spec} onInput={(event) => update((draft) => { draft.manga.layout_spec = event.currentTarget.value; })} /></Field>
    </section>
  </EditorShell>;
}

export function SettingEditor({ document, onChange }: BaseProps) {
  const { setting } = document.manga;
  const update = (recipe: (draft: MangaDocument) => void) => mutateDocument(document, onChange, recipe);
  return <EditorShell eyebrow="WORLD" title="舞台設定" description="場所、時間、背景、小道具など、作品世界の土台を編集します。">
    <section class="content-card">
      <SectionTitle index="01" title="シーン" description="setting" />
      <div class="form-grid-wide">
        <Field label="場所"><input value={setting.location} onInput={(event) => update((draft) => { draft.manga.setting.location = event.currentTarget.value; })} /></Field>
        <Field label="時間帯"><input value={setting.time} onInput={(event) => update((draft) => { draft.manga.setting.time = event.currentTarget.value; })} /></Field>
        <Field label="天候"><input value={setting.weather} onInput={(event) => update((draft) => { draft.manga.setting.weather = event.currentTarget.value; })} /></Field>
        <Field label="シチュエーション" wide><textarea rows={5} value={setting.situation} onInput={(event) => update((draft) => { draft.manga.setting.situation = event.currentTarget.value; })} /></Field>
      </div>
    </section>
    <div class="content-columns">
      <section class="content-card"><SectionTitle index="02" title="背景要素" description="background" /><TextListEditor values={setting.background} placeholder="背景要素" onChange={(values) => update((draft) => { draft.manga.setting.background = values; })} /></section>
      <section class="content-card"><SectionTitle index="03" title="小道具" description="props" /><TextListEditor values={setting.props} placeholder="小道具" onChange={(values) => update((draft) => { draft.manga.setting.props = values; })} /></section>
    </div>
  </EditorShell>;
}

export function CharactersEditor({ document, onChange }: BaseProps) {
  const update = (recipe: (draft: MangaDocument) => void) => mutateDocument(document, onChange, recipe);
  return <EditorShell eyebrow="CAST" title="登場人物" description="figures と bubbles.speaker から参照されるキャラクターを管理します。" action={<button class="primary-button" onClick={() => update((draft) => { draft.manga.characters.push({ name: '新しいキャラクター', role: '' }); })}><Plus size={16} />人物を追加</button>}>
    <div class="entity-grid">
      {document.manga.characters.map((character, index) => <section class="entity-card character-card" key={index}>
        <div class="entity-number">{String(index + 1).padStart(2, '0')}</div>
        <button class="entity-delete" onClick={() => update((draft) => { draft.manga.characters.splice(index, 1); })} aria-label="人物を削除"><Trash2 size={16} /></button>
        <div class="avatar-placeholder">{character.name.slice(0, 1) || '?'}</div>
        <Field label="名前"><input value={character.name} onInput={(event) => update((draft) => { draft.manga.characters[index].name = event.currentTarget.value; })} /></Field>
        <Field label="役割・属性"><textarea rows={4} value={character.role} onInput={(event) => update((draft) => { draft.manga.characters[index].role = event.currentTarget.value; })} /></Field>
      </section>)}
    </div>
  </EditorShell>;
}

export function MaterialsEditor({ document, onChange }: BaseProps) {
  const update = (recipe: (draft: MangaDocument) => void) => mutateDocument(document, onChange, recipe);
  return <EditorShell eyebrow="ASSETS" title="素材カタログ" description="各コマの assets が参照する、立ち絵・背景・小物の検索情報です。" action={<button class="primary-button" onClick={() => update((draft) => { draft.manga.materials.push({ key: '新しい素材', type: 'prop', keywords: [], note: '' }); })}><Plus size={16} />素材を追加</button>}>
    <div class="material-list">
      {document.manga.materials.map((material, index) => <section class="material-card" key={index}>
        <div class={`material-type-icon type-${material.type}`}><Sparkles size={18} /></div>
        <div class="material-fields">
          <div class="field-grid">
            <Field label="参照キー"><input value={material.key} onInput={(event) => update((draft) => { draft.manga.materials[index].key = event.currentTarget.value; })} /></Field>
            <Field label="種類"><select value={material.type} onChange={(event) => update((draft) => { draft.manga.materials[index].type = event.currentTarget.value as MaterialType; })}><option value="character">character</option><option value="background">background</option><option value="prop">prop</option></select></Field>
          </div>
          <Field label="検索キーワード" hint="カンマ区切り"><input value={material.keywords.join(', ')} onInput={(event) => update((draft) => { draft.manga.materials[index].keywords = event.currentTarget.value.split(',').map((item) => item.trim()).filter(Boolean); })} /></Field>
          <Field label="デザイン指針"><textarea rows={3} value={material.note ?? ''} onInput={(event) => update((draft) => { draft.manga.materials[index].note = event.currentTarget.value; })} /></Field>
        </div>
        <button class="entity-delete" onClick={() => update((draft) => { draft.manga.materials.splice(index, 1); })} aria-label="素材を削除"><Trash2 size={16} /></button>
      </section>)}
    </div>
  </EditorShell>;
}

export function RawYamlEditor({ source, error, onSourceChange, onApply, onFormat }: { source: string; error: string | null; onSourceChange: (value: string) => void; onApply: () => void; onFormat: () => void }) {
  return <EditorShell eyebrow="OMNY SOURCE" title="OMNYエディター" description="OMNY形式をYAMLとして直接編集できます。「反映」するまで構造化エディター側は変更されません。" action={<><button class="secondary-button" onClick={onFormat}><BookOpenCheck size={16} />整形</button><button class="primary-button" onClick={onApply}><Check size={16} />OMNY形式を反映</button></>}>
    {error && <div class="yaml-error"><AlertCircle size={18} /><span><strong>OMNY形式を解釈できません</strong>{error}</span></div>}
    <div class="code-editor-wrap"><div class="code-gutter" aria-hidden="true">{source.split('\n').map((_, index) => <span>{index + 1}</span>)}</div><textarea class="code-editor" spellcheck={false} value={source} onInput={(event) => onSourceChange(event.currentTarget.value)} /></div>
  </EditorShell>;
}

export function ValidationPanel({ issues, onClose }: { issues: ValidationIssue[]; onClose: () => void }) {
  return <div class="validation-drawer">
    <div class="drawer-head"><div><span class="eyebrow">NDM CHECK</span><h2>NDM検査結果</h2></div><button onClick={onClose}>×</button></div>
    <div class="drawer-body">
      {!issues.length ? <div class="all-valid"><Check size={24} /><strong>すべての検査を通過しました</strong><span>v10の主要なフィールド規則に適合しています。</span></div> : issues.map((issue, index) => <div class={`issue-row ${issue.level}`} key={`${issue.path}-${index}`}>{issue.level === 'error' ? <AlertCircle size={18} /> : <CircleAlert size={18} />}<div><strong>{issue.message}</strong><code>{issue.path}</code></div></div>)}
    </div>
  </div>;
}

function EditorShell({ eyebrow, title, description, action, children }: { eyebrow: string; title: string; description: string; action?: ComponentChildren; children: ComponentChildren }) {
  return <div class="document-editor"><div class="document-editor-head"><div><span class="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div><div class="document-head-actions">{action}</div></div><div class="document-editor-body">{children}</div></div>;
}
