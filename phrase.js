// 元文の最初の対象箇所だけを置換する。入力の補完・整形は行わない。
function splitTargetPhrase(original, target) {
  if (!target) throw new Error('言い換え対象が空です');
  const index = original.indexOf(target);
  if (index === -1) throw new Error('元文に言い換え対象がありません');
  return { before: original.slice(0, index), after: original.slice(index + target.length) };
}
function replaceTargetPhrase(original, target, userInput) {
  const { before, after } = splitTargetPhrase(original, target);
  return before + userInput + after;
}
globalThis.KotobaText = Object.freeze({ replaceTargetPhrase, splitTargetPhrase });
