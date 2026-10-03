import { test, expect } from '@playwright/test';
import '../candidates.js';
const { selectCandidates } = globalThis.KotobaCandidates;
for (const input of ['検討させてください','検討する','検討します','検討させていただく','ご検討','検 討させてください']) {
  test(`「${input}」と同じ検討語幹を除外する`, () => {
    const result = selectCandidates(input);
    expect(result).toHaveLength(5);
    expect(result.map(c => c.word)).not.toContain('検討する');
    expect(result.filter(c => c.group === 'normal').map(c => c.word)).toEqual(['確認する','精査する']);
  });
}
for (const input of ['確認します','調整させてください','相談させていただく','持ち帰らせてください','持ちかえます','もちかえたいです']) {
  test(`各カテゴリーでも「${input}」の語幹を除外して必要数を確保`, () => {
    const result = selectCandidates(input);
    expect(result.filter(c => c.group === 'normal')).toHaveLength(2);
    expect(result.filter(c => c.group === 'perspective')).toHaveLength(2);
    expect(result.filter(c => c.group === 'extra')).toHaveLength(1);
    expect(result.some(c => c.coreTerms.some(t => input.includes(t)))).toBe(false);
  });
}
test('候補同士の活用・敬語・複合語の重複をカテゴリー横断で除外', () => {
  const c = (group,word,coreTerms) => ({group,word,coreTerms});
  const pool = [
    c('normal','活用する',['活用']), c('normal','有効活用する',['有効活用']), c('normal','応用する',['応用']),
    c('perspective','ご活用',['活用']), c('perspective','共有する',['共有']), c('perspective','組み合わせる',['組み合わ']),
    c('extra','活用します',['活用']), c('extra','転換する',['転換']),
  ];
  expect(selectCandidates('',pool).map(c=>c.word)).toEqual(['活用する','応用する','共有する','組み合わせる','転換する']);
});
test('入力に複数の中心語があれば全カテゴリーで除外', () => {
  expect(selectCandidates('検討・確認・調整・相談・持ち帰る').map(c => c.word))
    .toEqual(['精査する','判断する','協議する','すり合わせる','整理する']);
});
test('ギブアップでは従来のサンプルを表示する', () => {
  expect(selectCandidates('').map(c=>c.word)).toEqual(['検討する','確認する','調整する','相談する','持ち帰る']);
});
test('候補不足でも除外した語彙を復活させない', () => {
  expect(selectCandidates('検討 確認 精査 判断 調整 相談 協議 すり合わせ 持ち帰る 整理 見直す')).toEqual([]);
});
