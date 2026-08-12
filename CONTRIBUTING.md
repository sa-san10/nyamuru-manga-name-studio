# Contributing

IssueやPull Requestを歓迎します。

このプロジェクトへ意図的に提出したコントリビューションは、別途明示的な合意がない限り、プロジェクトと同じMIT Licenseで提供することに同意したものとして扱います。第三者のコード、文章、画像、その他の素材を含める場合は、再配布とMITプロジェクトでの利用が可能であることを確認し、出典とライセンスをPull Requestへ記載してください。

バグ報告・機能要望は、Issueテンプレート（バグ報告／機能要望）を利用してください。セキュリティ上の問題は公開Issueに書かず、[SECURITY.md](./SECURITY.md) の手順で非公開に報告してください。参加にあたっては [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) に従ってください。

公開前は [OSS-PUBLISHING-CHECKLIST.md](./OSS-PUBLISHING-CHECKLIST.md) も確認してください。

## NDM文書の二重掲載箇所（同期チェックリスト）

NDMの規則の一部は、読者（ネーム担当と画像生成AI）が異なるため意図的に複数箇所へ掲載しています。次のいずれかを改定するときは、対応する掲載箇所を必ず全て揃えて直してください。

OMAY（`src/content/standard.omay.yaml`）の `style_notes` / `layout_spec` は、全部入りサンプル `src/content/sample.omny.yaml` にも同文が埋め込まれています。**OMAYを改定するときは sample 側も必ず揃えて直してください。**

- **配置の優先順位**（`action` ＞ `anchor` ＞ 発言順＝立ち位置 ＞ `size` ＞ `bbox`）
  - 正文: 生成プロンプト §C「基本原則: 配置の優先順位」の表（`src/content/nyamuru-manga-generation-prompt-v10.md`）
  - 転記: 同プロンプト §B `style_notes` 末尾の優先順位の行
  - 転記: 簡易ガイド §3（`src/content/nyamuru-data-model-v10.md`）
- **bg（背景詳細度）の定義**
  - 生成プロンプト 手順4
  - 生成プロンプト §B `style_notes` の bg 関連の行
  - 生成プロンプト §C「背景詳細度(bg)」節
  - 簡易ガイド §2 の bg の行
- **コマ外周マージン・枠線・タチキリの数値**
  - 生成プロンプト 手順2
  - 生成プロンプト §C「コマ間の間隙とライン」節
- **タチキリ（`bleed`）の宣言と作画手順**
  - 生成プロンプト 手順2 のタチキリの項
  - 生成プロンプト §A「フィールドの決まりごと」の bleed の行
  - 生成プロンプト §B パターンM〜Qの座標例
  - OMAY `layout_spec`「コマ間の間隙とライン」の例外（タチキリ）の項
- **人物センター原則の適用範囲（`role: sub`・part系 `size`・`no_figures` の除外）**
  - 生成プロンプト 手順3 の人物センター原則
  - 生成プロンプト §A「フィールドの決まりごと」の size / role の行
  - OMAY `layout_spec` figures 節の size / role
  - 簡易ガイド §4
- **フキダシ尻尾の規則（`offscreen` は尻尾を描かない）**
  - OMAY `style_notes` の尻尾の行
  - OMAY `layout_spec`「禁止事項」のしっぽの項
  - 生成ワークフロー「6. ページ検品」の尻尾の項
