const app = document.querySelector('#app');
const problem = {
  context: '取引先から、当初の予定より早い納品を求められました。',
  original: '「納期については、もう少し『考えさせてください』。」',
  target: '考えさせてください',
};
let candidates = [];
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
  return `<button class="candidate" data-index="${index}" aria-pressed="false"><span class="card-heading"><strong>${c.word}</strong><span class="choice">選ぶ ＞</span></span><span class="description">${c.description}</span>${c.group !== 'normal' ? `<span class="example">例：${sentence(c)}</span>` : ''}</button>`;
}
function groupCards(group) {
  return candidates.map((candidate, index) => candidate.group === group ? card(index) : '').join('');
}
function expand() {
  candidates = KotobaCandidates.selectCandidates(answer);
  app.innerHTML = `<p class="step">02 / 表現を広げて、選ぶ</p><h1 tabindex="-1">言葉が広がる</h1><section class="own"><h2>あなたの表現</h2>${answer ? `<p class="own-word">${escape(answer)}</p><h3>あなたの言葉で文章にすると</h3><p class="sentence">${ownSentence()}</p>` : '<p class="quiet">まだ自分の言葉が見つかっていません</p><p>ほかの表現を眺めながら、使ってみたい言葉を探してみましょう。</p>'}</section>${answer ? `<aside class="ai-feedback" aria-label="あなたの表現へのAIコメント"><p>この言葉を手がかりに、相手に伝わる表現を考えてみましょう。状況に合わせた別の言い方も見てみます。</p></aside>` : ''}<p class="sample-note">AIコメント・候補はプロトタイプ用の固定サンプルです。</p><section><h3 class="group-title">通常の言い換え</h3><p class="selection-hint">覚えたい言葉があれば「選ぶ」を押してください。（今日の一言に保存されます）</p>${groupCards('normal')}</section><section><h3 class="group-title">少し視点を変えた言い換え</h3>${groupCards('perspective')}</section><section class="more"><p>もう少し発想を広げてみる？</p><button class="disclosure" id="more" aria-expanded="false" aria-controls="extra">こんな表現もあります ＞</button><div id="extra" hidden>${groupCards('extra')}</div></section><div class="actions"><p id="selection-status" role="status"></p><button class="primary" id="finish" disabled>今日の一言にする →</button><button class="text-button" id="skip">今日は選ばない</button></div>`;
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
    app.querySelector('#finish').disabled = false;
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
