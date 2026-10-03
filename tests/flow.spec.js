import { test, expect } from '@playwright/test';
async function answer(page, text = '検討したいです') {
  await page.goto('/');
  await page.getByLabel('「考えさせてください」を').fill(text);
  await page.getByRole('button', { name: 'この言葉にする' }).click();
}
test('空・空白だけでは進まず、候補を先に見せない', async ({page}) => {
  await page.goto('/');
  await expect(page.getByRole('button', {name:'この言葉にする'})).toBeDisabled();
  await page.locator('input').fill('　 ');
  await expect(page.getByRole('button', {name:'この言葉にする'})).toBeDisabled();
  await expect(page.locator('.candidate')).toHaveCount(0);
});
test('回答、追加候補の開閉、選択変更、今日の一言、ことば帳', async ({page}) => {
  await answer(page);
  await expect(page.locator('.own-word')).toHaveText('検討したいです');
  await expect(page.locator('.sentence strong')).toHaveText('検討したいです');
  await expect(page.locator('[data-index="4"]')).toBeHidden();
  await page.getByRole('button', {name:'こんな表現もあります'}).click();
  await expect(page.locator('[data-index="4"]')).toBeVisible();
  await page.getByRole('button', {name:'閉じる'}).click();
  await expect(page.locator('[data-index="4"]')).toBeHidden();
  await page.locator('[data-index="0"]').click();
  await expect(page.locator('[data-index="0"]')).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', {name:'こんな表現もあります'}).click();
  await page.locator('[data-index="4"]').click();
  await expect(page.locator('[data-index="0"]')).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button', {name:'今日の一言にする'}).click();
  await expect(page.getByRole('heading', {name:/おしまい/})).toBeVisible();
  await expect(page.locator('.saved')).toContainText('いったん持ち帰らせてください');
  await page.getByRole('button', {name:'ことば帳を見る'}).click();
  await expect(page.getByRole('status')).toHaveText('ことば帳は次の開発段階で実装します');
  await page.getByRole('button', {name:'もう一度試す'}).click();
  await expect(page.locator('input')).toHaveValue('');
});
for (const index of [0,1,2,3,4]) {
  test(`候補${index+1}を今日の一言にできる`, async ({page}) => {
    await answer(page);
    if (index === 4) await page.getByRole('button', {name:'こんな表現もあります'}).click();
    const word = await page.locator(`[data-index="${index}"] .card-heading strong`).textContent();
    await page.locator(`[data-index="${index}"]`).click();
    await expect(page.locator('[aria-pressed="true"]')).toContainText(word);
    await page.getByRole('button', {name:'今日の一言にする'}).click();
    await expect(page.getByRole('heading', {name:'🌱 今日の一言'})).toBeVisible();
  });
}
test('選択後でも今日は選ばないで完了する', async ({page}) => {
  await answer(page);
  await page.locator('[data-index="2"]').click();
  await page.getByRole('button', {name:'今日は選ばない'}).click();
  await expect(page.getByRole('heading', {name:/おしまい/})).toBeVisible();
  await expect(page.getByRole('heading', {name:'🌱 今日の一言'})).toHaveCount(0);
  await expect(page.locator('.own')).toContainText('検討したいです');
});
test('ギブアップ後でも選択できる／選ばず完了できる', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:'ギブアップ'}).click();
  await expect(page.getByText('まだ自分の言葉が見つかっていません')).toBeVisible();
  await expect(page.locator('.candidate:visible')).toHaveCount(4);
  await page.locator('[data-index="1"]').click();
  await page.getByRole('button', {name:'今日の一言にする'}).click();
  await expect(page.locator('.saved')).toContainText('一度確認させてください');
  await page.getByRole('button', {name:'もう一度試す'}).click();
  await page.getByRole('button', {name:'ギブアップ'}).click();
  await page.getByRole('button', {name:'今日は選ばない'}).click();
  await expect(page.locator('.saved')).toHaveCount(0);
});
test('入力をHTMLとして実行しない', async ({page}) => {
  await answer(page, '<img src=x onerror=alert(1)>');
  await expect(page.locator('.own-word')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.own img')).toHaveCount(0);
});
for (const width of [320,390,768,1440]) {
  test(`${width}px幅で横にはみ出さない`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(await fits()).toBe(true);
    await page.locator('input').fill('あ'.repeat(150));
    await page.getByRole('button', {name:'この言葉にする'}).click();
    await page.getByRole('button', {name:'こんな表現もあります'}).click();
    expect(await fits()).toBe(true);
    await page.locator('[data-index="3"]').click();
    await page.getByRole('button', {name:'今日の一言にする'}).click();
    expect(await fits()).toBe(true);
  });
}
test('JavaScriptの例外なし', async ({page}) => {
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await answer(page); await page.locator('[data-index="0"]').click();
  await page.getByRole('button', {name:'今日の一言にする'}).click();
  expect(errors).toEqual([]);
});

test('元のお題の対象だけを置換し、結果と完了画面に表示する', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('blockquote')).toHaveText('「納期については、もう少し『考えさせてください』。」');
  await page.locator('input').fill('検討させてください');
  await page.getByRole('button', {name:'この言葉にする'}).click();
  const expected = '「納期については、もう少し『検討させてください』。」';
  await expect(page.locator('.own .sentence')).toHaveText(expected);
  await expect(page.locator('.own .sentence strong')).toHaveText('検討させてください');
  await page.getByRole('button', {name:'今日は選ばない'}).click();
  await expect(page.locator('.own .sentence')).toHaveText(expected);
});
test('入力の前後の空白も置換結果に保持する', async ({page}) => {
  await answer(page, '  検討させてください  ');
  expect(await page.locator('.own .sentence').textContent())
    .toBe('「納期については、もう少し『  検討させてください  』。」');
});

test('AIコメントは表現カードの下にあり、カードには入力と置換文だけを表示', async ({page}) => {
  await answer(page, '検討させてください');
  const comment = 'この言葉を手がかりに、相手に伝わる表現を考えてみましょう。状況に合わせた別の言い方も見てみます。';
  const own = page.locator('.own');
  await expect(own.locator('h2')).toHaveText('あなたの表現');
  await expect(own.locator('.own-word')).toHaveText('検討させてください');
  await expect(own.locator('h3')).toHaveText('あなたの言葉で文章にすると');
  await expect(own.locator('.sentence')).toHaveText('「納期については、もう少し『検討させてください』。」');
  await expect(own).not.toContainText(comment);
  await expect(own.locator(':scope > *')).toHaveCount(4);
  const feedback = page.getByRole('complementary', {name:'あなたの表現へのAIコメント'});
  await expect(feedback.locator('p')).toHaveCount(1);
  await expect(feedback.locator('p')).toHaveText(comment);
  await expect(page.getByText('あなたの表現へのAIコメント', {exact:true})).toHaveCount(0);
  expect(await feedback.evaluate(el => el.previousElementSibling.classList.contains('own'))).toBe(true);
  const cardBox = await own.boundingBox();
  const feedbackBox = await feedback.boundingBox();
  expect(feedbackBox.y).toBeGreaterThan(cardBox.y + cardBox.height);
  expect(feedbackBox.y - (cardBox.y + cardBox.height)).toBeLessThanOrEqual(24);
  expect(await feedback.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(15);
});

test('検討させてくださいの回答では別の語彙の候補を5つ表示する', async ({page}) => {
  await answer(page, '検討させてください');
  await page.getByRole('button', {name:'こんな表現もあります'}).click();
  await expect(page.locator('.candidate .card-heading strong')).toHaveText(['確認する','精査する','調整する','相談する','持ち帰る']);
  await expect(page.locator('.own-word')).toHaveText('検討させてください');
  await expect(page.locator('.own .sentence')).toHaveText('「納期については、もう少し『検討させてください』。」');
  await page.locator('[data-index="1"]').click();
  await page.getByRole('button', {name:'今日の一言にする'}).click();
  await expect(page.locator('.saved')).toContainText('条件を精査させてください');
});
test('候補プールの全語彙を入力しても今日は選ばないで完了できる', async ({page}) => {
  await answer(page, '検討 確認 精査 判断 調整 相談 協議 すり合わせ 持ち帰る 整理 見直す');
  await expect(page.locator('.candidate')).toHaveCount(0);
  await page.getByRole('button', {name:'今日は選ばない'}).click();
  await expect(page.getByRole('heading', {name:/おしまい/})).toBeVisible();
});
