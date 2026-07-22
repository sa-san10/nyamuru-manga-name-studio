import type { ComponentChildren } from 'preact';

interface FieldProps {
  label: string;
  hint?: string;
  children: ComponentChildren;
  wide?: boolean;
}

export function Field({ label, hint, children, wide }: FieldProps) {
  return <label class={`field ${wide ? 'field-wide' : ''}`}><span class="field-label">{label}{hint && <small>{hint}</small>}</span>{children}</label>;
}

export function SectionTitle({ index, title, description, action }: { index?: string; title: string; description?: string; action?: ComponentChildren }) {
  return <div class="section-title">
    <div>{index && <span class="section-index">{index}</span>}<div><h3>{title}</h3>{description && <p>{description}</p>}</div></div>
    {action}
  </div>;
}

export function TextListEditor({ values, placeholder, onChange }: { values: string[]; placeholder: string; onChange: (values: string[]) => void }) {
  return <div class="text-list-editor">
    {values.map((value, index) => <div class="text-list-row" key={index}>
      <input value={value} placeholder={placeholder} onInput={(event) => { const next = [...values]; next[index] = event.currentTarget.value; onChange(next); }} />
      <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} aria-label="削除">×</button>
    </div>)}
    <button type="button" class="inline-add" onClick={() => onChange([...values, ''])}>＋ 項目を追加</button>
  </div>;
}

export function BBoxEditor({ value, onChange }: { value?: { x: number; y: number; w: number; h: number }; onChange: (value: { x: number; y: number; w: number; h: number }) => void }) {
  const box = value ?? { x: 10, y: 10, w: 30, h: 30 };
  return <div class="bbox-editor">
    {(['x', 'y', 'w', 'h'] as const).map((key) => <label key={key}><span>{key.toUpperCase()}</span><input type="number" value={box[key]} onInput={(event) => onChange({ ...box, [key]: Number(event.currentTarget.value) })} /></label>)}
  </div>;
}
