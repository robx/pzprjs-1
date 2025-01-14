
## Version 0.10.1-beta1

Release date: 2019/6/15

#### 機能改善

* Operation: 盤面への入力を行った時間を保持するように変更した
* Graphic: いくつかのパズルで背景色を塗る範囲の修正を行った
* 美術館, シャカシャカ: クリックで数字の背景をグレーにできるようにした
* シャカシャカ: 2辺以上が白マスでない場合三角形やドットの形を推測して置くことができるようにした
* へやわけ, ∀人∃ＨＥＹＡ: 盤面の部屋が四角でなくてもエラー扱いしないようにした
* たわむれんが: 下に黒マスがない場合のエラー表示で下のセルを赤く表示しないようにした

#### バグ修正

* LineManager: 交差ありループのパズルでT字になるよう線を入力した際、線のつながり計算を間違ってしまうことがあるのを修正
* Cell, CellList: 数独の補助数字やTapaなど1つのセルに複数の数字があるパズルでTest時にデータが正しく取得できないことがあるのを修正
* 交差は直角に限る: エラー表示時に隣の点が赤く表示されている問題の修正 (#2)
* ごきげんななめ: 色分け表示時にループを太く表示できなくなっている点を修正
* ウォールロジック: Undo/Redo時の描画が正しくされないのを修正
* ナンバーリンク、お家へ帰ろう: 背景色が指定されたときに文字や数字の背景色が白いままなのを修正

#### その他の変更

* Tapa: セルの周囲にある黒マスの長さを取得するルーチン・正答判定するルーチンの変更
* test: Test時に一時的に生成するamibo.svgファイルが残ったままになるのを修正
* project: devDependenciesにmochaを追加
* project: Gruntを使用していたいくつかのコンパイルルールをnpm-run-scriptsで行うよう変更
* project: JSHintの代わりにESLintを使用するよう変更
* project: ESLintでエラー扱いされるコードを修正
