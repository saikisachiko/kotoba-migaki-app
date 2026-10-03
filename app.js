const app = document.querySelector('#app');
const problem = {
  context: '取引先から、当初の予定より早い納品を求められました。',
  original: '「納期については、もう少し『考えさせてください』。」',
  target: '考えさせてください',
};
const candidates = [
  { word: '検討する', description: '内容をよく調べ、判断しようとするときに使われる表現です。', phrase: 'もう少し検討させてください' },
  { word: '確認する', description: '状況や条件を確かめてから返答したいときに使われる表現です。', phrase: '一度確認させてください' },
  { word: '調整する', description: '「自分が考える」から「相手や条件との折り合いをつける」方向へ視点を移した表現です。', phrase: '社内で調整させてください' },
  { word: '相談する', description: '「自分一人で考える」から「関係者と話し合う」方向へ視点を移した表現です。', phrase: '一度社内で相談させてください' },
  { word: '持ち帰る', description: '「その場で判断する」から「いったん場を離れて検討する」という方向へ視点を広げた表現です。', phrase: 'いったん持ち帰らせてください' },
];
let answer = '', selected = null;
const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const renderReplacement = input => {
  const { before, after } = KotobaText.splitTargetPhrase(problem.original, problem.target);
  return `${escape(before)}<strong>${escape(input)}</strong>${escape(after)}`;
};
const ownSentence = () => renderReplacement(answer);
const sentence = candidate => `納期については、<strong>${candidate.phrase}</strong>。`;
function move(render) { render(); window.scrollTo(0, 0); app.querySelector('h1').focus(); }
function start() {
  selected = null;
  app.innerHTML = `<p class="step">01 / 自分の言葉を出す</p><h1 tabindex="-1">今日の言葉磨き</h1><section class="prompt"><p>${escape(problem.context)}</p><blockquote>${renderReplacement(problem.target)}</blockquote></section><form id="answer-form"><label for="answer">「${escape(problem.target)}」を<br>別の表現にしてみましょう。</label><p class="hint" id="input-hint">1語、または短いフレーズで大丈夫です。</p><input id="answer" name="answer" type="text" placeholder="あなたなら、どんな言葉にしますか" aria-describedby="input-hint" autocomplete="off"><button class="primary" id="submit" disabled>この言葉にする <span aria-hidden="true">→</span></button></form><div class="giveup"><p>思いつかないときは</p><button class="text-button" id="giveup">ギブアップ</button></div>`;
  const input = app.querySelector('input');
  input.addEventListener('input', () => { app.querySelector('#submit').disabled = !input.value.trim(); });
  app.querySelector('form').addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) return; answer = input.value; move(expand); });
  app.querySelector('#giveup').onclick = () => { answer = ''; move(expand); };
}
function card(index) {
  const c = candidates[index];
  return `<button class="candidate" data-index="${index}" aria-pressed="false"><span class="card-heading"><strong>${c.word}</strong><span class="choice">選ぶ ＞</span></span><span class="description">${c.description}</span>${index >= 2 ? `<span class="example">例：${sentence(c)}</span>` : ''}</button>`;
}
function expand() {
  app.innerHTML = `<p class="step">02 / 表現を広げて、選ぶ</p><h1 tabindex="-1">言葉が広がる</h1><section class="own"><h2>あなたの表現</h2>${answer ? `<p class="own-word">${escape(answer)}</p><p>この言葉を手がかりに、相手に伝わる表現を考えてみましょう。状況に合わせた別の言い方も見てみます。</p><h3>あなたの言葉で文章にすると</h3><p class="sentence">${ownSentence()}</p>` : '<p class="quiet">まだ自分の言葉が見つかっていません</p><p>ほかの表現を眺めながら、使ってみたい言葉を探してみましょう。</p>'}</section><p class="sample-note">AIコメント・候補はプロトタイプ用の固定サンプルです。</p><h2 class="instruction">使ってみたい言葉を<br>ひとつ選んでください。</h2><section><h3 class="group-title">通常の言い換え</h3>${card(0)}${card(1)}</section><section><h3 class="group-title">少し視点を変えた言い換え</h3>${card(2)}${card(3)}</section><section class="more"><p>もう少し発想を広げてみる？</p><button class="disclosure" id="more" aria-expanded="false" aria-controls="extra">こんな表現もあります ＞</button><div id="extra" hidden>${card(4)}</div></section><div class="actions"><p id="selection-status" role="status"></p><button class="primary" id="finish" hidden>今日の一言にする →</button><button class="text-button" id="skip">今日は選ばない</button></div>`;
  app.querySelector('#more').onclick = event => {
    const open = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.textContent = open ? '閉じる ∧' : 'こんな表現もあります ＞';
    app.querySelector('#extra').hidden = !open;
  };
  app.querySelectorAll('.candidate').forEach(button => button.onclick = () => {
    selected = Number(button.dataset.index);
    app.querySelectorAll('.candidate').forEach(b => { const active = Number(b.dataset.index) === selected; b.setAttribute('aria-pressed', String(active)); b.querySelector('.choice').textContent = active ? '✓ 選択中' : '選ぶ ＞'; });
    app.querySelector('#selection-status').textContent = `「${candidates[selected].word}」を選びました。`;
    app.querySelector('#finish').hidden = false;
  });
  app.querySelector('#finish').onclick = () => move(done);
  app.querySelector('#skip').onclick = () => { selected = null; move(done); };
}
function done() {
  app.innerHTML = `<p class="step">03 / 今日のページを閉じる</p><h1 tabindex="-1">今日の言葉磨き、<br>おしまい 🌱</h1><section class="own"><h2>✏️ 自分の言葉</h2><p class="sentence">${answer ? ownSentence() : 'まだ自分の言葉が見つかっていません'}</p></section>${selected !== null ? `<section class="saved"><h2>🌱 今日の一言</h2><p class="sentence">${sentence(candidates[selected])}</p><p>ことば帳に追加しました。</p><p class="hint">プロトタイプの仮表示です。データは保存されません。</p><button class="secondary" id="notebook">ことば帳を見る</button><p id="notebook-message" role="status"></p></section>` : '<p class="quiet">今日は、表現を眺めるところまで。</p>'}<p class="farewell">お疲れさまでした。また明日！</p><button class="text-button" id="restart">もう一度試す</button>`;
  app.querySelector('#notebook')?.addEventListener('click', () => { app.querySelector('#notebook-message').textContent = 'ことば帳は次の開発段階で実装します'; });
  app.querySelector('#restart').onclick = () => { answer = ''; move(start); };
}
start();
