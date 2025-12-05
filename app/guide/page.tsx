'use client'

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">使い方ガイド</h1>

      <div className="space-y-8">
        {/* 概要 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">このツールについて</h2>
          <p className="text-gray-700 leading-relaxed">
            サロンの月間売上予測を計算するツールです。スタッフのランク・職種・季節に応じた基準売上をもとに、
            ヘルプ（店舗間の人員移動）や休職を考慮した売上予測を自動計算します。
          </p>
        </section>

        {/* 売上予測 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">1. 売上予測（トップページ）</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold mb-2">基本操作</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>年・月を選択すると、その月の売上予測が表示されます</li>
                <li>店舗名をクリックすると、スタッフ別の内訳が展開されます</li>
                <li>「予測を保存」で履歴に保存できます</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">福袋実施年</h3>
              <p className="ml-4">チェックを入れると、物販売上が2倍で計算されます</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">季節による変動</h3>
              <table className="ml-4 border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2">季節</th>
                    <th className="border border-gray-300 px-3 py-2">対象月</th>
                    <th className="border border-gray-300 px-3 py-2">係数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">通常期</td>
                    <td className="border border-gray-300 px-3 py-2">1, 3, 4, 9, 10, 11月</td>
                    <td className="border border-gray-300 px-3 py-2">100%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">閑散期</td>
                    <td className="border border-gray-300 px-3 py-2">2, 5, 6月</td>
                    <td className="border border-gray-300 px-3 py-2">98%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">繁忙期</td>
                    <td className="border border-gray-300 px-3 py-2">7, 8月</td>
                    <td className="border border-gray-300 px-3 py-2">106%</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">超繁忙期</td>
                    <td className="border border-gray-300 px-3 py-2">12月</td>
                    <td className="border border-gray-300 px-3 py-2">110%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold mb-2">丸め処理</h3>
              <p className="ml-4">施術・物販ともに店舗合計は万の位で四捨五入されます</p>
            </div>
          </div>
        </section>

        {/* 店舗管理 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">2. 店舗管理</h2>
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>「店舗追加」ボタンで新しい店舗を登録</li>
              <li>店舗名の編集・削除が可能</li>
              <li>店舗を削除すると、その店舗に所属するスタッフも削除されます</li>
            </ul>
          </div>
        </section>

        {/* スタッフ管理 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">3. スタッフ管理</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-bold mb-2">スタッフ登録</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>名前、所属店舗、職種（アイリスト/ネイリスト）、ランクを設定</li>
                <li>ランク: J-1, J-2, J-3, S-1, S-2, S-3, M</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">稼働率設定</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>年・月を選んで、その月の稼働率を設定</li>
                <li>5%刻みで選択可能（100%〜5%、休職）</li>
                <li>産休などで月の途中から休む場合に使用</li>
                <li>例: 25%稼働 → 売上も25%で計算</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">色の意味</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm">緑</span> 100%稼働</li>
                <li><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-sm">黄</span> 5%〜95%稼働</li>
                <li><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-sm">赤</span> 休職（0%）</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ヘルプ入力 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">4. ヘルプ入力</h2>
          <div className="space-y-4 text-gray-700">
            <p>スタッフが他店舗にヘルプに行く場合の売上移動を設定します。</p>
            <div>
              <h3 className="font-bold mb-2">設定方法</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>年・月・所属店舗を選択</li>
                <li>スタッフの「+ ヘルプ追加」をクリック</li>
                <li>ヘルプ先店舗を選択</li>
                <li>所属店舗からの減算%を入力（加算%も自動入力）</li>
                <li>必要に応じて加算%を調整</li>
              </ol>
            </div>
            <div>
              <h3 className="font-bold mb-2">計算例</h3>
              <div className="ml-4 bg-gray-50 p-3 rounded text-sm">
                <p>スタッフAの基準売上: 施術100万、物販20万</p>
                <p>ヘルプ設定: 減算10%、加算10%</p>
                <p className="mt-2">結果:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>所属店舗: 施術90万、物販18万（-10%）</li>
                  <li>ヘルプ先: 施術+10万、物販+2万（+10%）</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">複数回ヘルプ</h3>
              <p className="ml-4">同じスタッフに複数のヘルプを登録可能（別店舗へのヘルプなど）</p>
            </div>
          </div>
        </section>

        {/* 予測履歴 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">5. 予測履歴</h2>
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>売上予測ページで「予測を保存」した履歴を確認</li>
              <li>年を選択して過去の予測を表示</li>
              <li>店舗別・月別の売上予測を一覧表示</li>
            </ul>
          </div>
        </section>

        {/* ランク別基準売上 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">ランク別基準売上（通常期）</h2>
          <div className="overflow-x-auto">
            <table className="border-collapse border border-gray-300 text-sm w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2">職種</th>
                  <th className="border border-gray-300 px-3 py-2">ランク</th>
                  <th className="border border-gray-300 px-3 py-2">施術</th>
                  <th className="border border-gray-300 px-3 py-2">物販</th>
                  <th className="border border-gray-300 px-3 py-2">合計</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">J-1</td><td className="border border-gray-300 px-3 py-2 text-right">¥350,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥20,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥370,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">J-2</td><td className="border border-gray-300 px-3 py-2 text-right">¥500,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥30,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥530,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">J-3</td><td className="border border-gray-300 px-3 py-2 text-right">¥600,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥40,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥640,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">S-1</td><td className="border border-gray-300 px-3 py-2 text-right">¥700,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥50,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥750,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">S-2</td><td className="border border-gray-300 px-3 py-2 text-right">¥800,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥60,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥860,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">S-3</td><td className="border border-gray-300 px-3 py-2 text-right">¥900,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥70,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥970,000</td></tr>
                <tr><td className="border border-gray-300 px-3 py-2">アイリスト</td><td className="border border-gray-300 px-3 py-2">M</td><td className="border border-gray-300 px-3 py-2 text-right">¥600,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥50,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥650,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">J-1</td><td className="border border-gray-300 px-3 py-2 text-right">¥250,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥15,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥265,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">J-2</td><td className="border border-gray-300 px-3 py-2 text-right">¥350,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥20,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥370,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">J-3</td><td className="border border-gray-300 px-3 py-2 text-right">¥450,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥30,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥480,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">S-1</td><td className="border border-gray-300 px-3 py-2 text-right">¥550,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥40,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥590,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">S-2</td><td className="border border-gray-300 px-3 py-2 text-right">¥650,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥50,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥700,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">S-3</td><td className="border border-gray-300 px-3 py-2 text-right">¥750,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥60,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥810,000</td></tr>
                <tr className="bg-gray-50"><td className="border border-gray-300 px-3 py-2">ネイリスト</td><td className="border border-gray-300 px-3 py-2">M</td><td className="border border-gray-300 px-3 py-2 text-right">¥450,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥40,000</td><td className="border border-gray-300 px-3 py-2 text-right">¥490,000</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-2">※ 季節により上記の係数が適用されます</p>
        </section>
      </div>
    </div>
  )
}
