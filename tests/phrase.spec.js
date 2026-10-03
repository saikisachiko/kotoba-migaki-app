import { test, expect } from '@playwright/test';
import '../phrase.js';
const { replaceTargetPhrase } = globalThis.KotobaText;
test('指定例の対象箇所だけを入力に置換する', () => {
  expect(replaceTargetPhrase(
    '「納期については、もう少し『考えさせてください』。」',
    '考えさせてください', '検討させてください',
  )).toBe('「納期については、もう少し『検討させてください』。」');
});
test('別のお題でも前後の文を変更しない', () => {
  expect(replaceTargetPhrase('昨日は「楽しかった」です！', '楽しかった', '心が弾んだ'))
    .toBe('昨日は「心が弾んだ」です！');
});
test('空白や置換用特殊文字を含む入力をそのまま保つ', () => {
  expect(replaceTargetPhrase('前『対象』後。', '対象', '  $& $` $\' <b>言葉</b>  '))
    .toBe('前『  $& $` $\' <b>言葉</b>  』後。');
});
test('対象が複数ある場合は指定する最初の箇所だけ変える', () => {
  expect(replaceTargetPhrase('考える。もう一度考える。', '考える', '検討する'))
    .toBe('検討する。もう一度考える。');
});
test('不正なお題設定を黙って表示しない', () => {
  expect(() => replaceTargetPhrase('元文', '', '入力')).toThrow();
  expect(() => replaceTargetPhrase('元文', '対象なし', '入力')).toThrow();
});
