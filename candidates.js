// coreTerms は活用形・敬語・複合語に共通する語幹と表記ゆれ。
// 自由な日本語の語幹を自動解析するものではない。AI接続時も検証用メタデータを必須とする。
const samplePool = [
  { group: 'normal', coreTerms: ['検討'], word: '検討する', description: '内容をよく調べ、判断しようとするときに使われる表現です。', phrase: 'もう少し検討させてください' },
  { group: 'normal', coreTerms: ['確認'], word: '確認する', description: '状況や条件を確かめてから返答したいときに使われる表現です。', phrase: '一度確認させてください' },
  { group: 'normal', coreTerms: ['精査'], word: '精査する', description: '細かな条件まで詳しく調べたうえで返答したいときに使われる表現です。', phrase: '条件を精査させてください' },
  { group: 'normal', coreTerms: ['判断'], word: '判断する', description: '対応できるかどうかを見極めて、結論を出すことに焦点を置いた表現です。', phrase: '対応の可否を判断するため、少しお時間をいただけますか' },
  { group: 'perspective', coreTerms: ['調整'], word: '調整する', description: '「自分が考える」から「相手や条件との折り合いをつける」方向へ視点を移した表現です。', phrase: '社内で調整させてください' },
  { group: 'perspective', coreTerms: ['相談'], word: '相談する', description: '「自分一人で考える」から「関係者と話し合う」方向へ視点を移した表現です。', phrase: '一度社内で相談させてください' },
  { group: 'perspective', coreTerms: ['協議'], word: '協議する', description: '関係者で意見を交わし、対応方針を決める方向へ視点を移した表現です。', phrase: '関係者と協議させてください' },
  { group: 'perspective', coreTerms: ['すり合わ', '擦り合わ', 'すりあわ'], word: 'すり合わせる', description: '互いの希望や認識の違いを確かめ、歩み寄る方向へ視点を移した表現です。', phrase: '条件をすり合わせるお時間をいただけますか' },
  { group: 'extra', coreTerms: ['持ち帰', '持ちかえ', 'もちかえ', '持帰'], word: '持ち帰る', description: '「その場で判断する」から「いったん場を離れて検討する」という方向へ視点を広げた表現です。', phrase: 'いったん持ち帰らせてください' },
  { group: 'extra', coreTerms: ['整理'], word: '整理する', description: 'すぐに結論を出すのではなく、必要な条件や課題をまとめ直す方向へ視点を広げた表現です。', phrase: '必要な条件を整理させてください' },
  { group: 'extra', coreTerms: ['見直', '見なお', 'みなお'], word: '見直す', description: '今の計画を別の角度から見直すことで、対応の可能性を探る表現です。', phrase: '一度計画を見直させてください' },
];
const normalizeVocabulary = text => text.normalize('NFKC').replace(/\s/g, '').toLowerCase();
function selectCandidates(userInput, pool = samplePool) {
  const input = normalizeVocabulary(userInput);
  const selected = [];
  for (const [group, count] of [['normal', 2], ['perspective', 2], ['extra', 1]]) {
    let added = 0;
    for (const candidate of pool.filter(c => c.group === group)) {
      if (!candidate.coreTerms?.length || candidate.coreTerms.some(term => !normalizeVocabulary(term))) {
        throw new Error('候補には空でない中心語・語幹が必要です');
      }
      const terms = candidate.coreTerms.map(normalizeVocabulary);
      if (terms.some(term => input.includes(term))) continue;
      if (selected.some(other => other.coreTerms.some(otherTerm => terms.some(term => {
        const normalized = normalizeVocabulary(otherTerm);
        return term.includes(normalized) || normalized.includes(term);
      })))) continue;
      selected.push(candidate);
      if (++added === count) break;
    }
    // 重複した候補で枠を埋めない。AI接続時は再生成してから表示する。

  }
  return selected;
}
globalThis.KotobaCandidates = Object.freeze({ selectCandidates });
