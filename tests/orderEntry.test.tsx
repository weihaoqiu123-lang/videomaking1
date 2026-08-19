import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as AppModule from '../src/App';
import { INITIAL_VIDEO_PERSONNEL, INITIAL_VIDEO_TYPES } from '../src/data/mockData';
import { OrderCreateView } from '../src/views/OrderCreateView';

test('a service entry opens an empty product-information form', () => {
  const html = renderToStaticMarkup(
    <OrderCreateView
      videoTypes={INITIAL_VIDEO_TYPES}
      videoPersonnel={INITIAL_VIDEO_PERSONNEL}
      preselectedVideoTypeId="ai_showcase"
      onSubmitTask={() => undefined}
      onNavigateToOrders={() => undefined}
    />,
  );

  assert.match(html, /placeholder="输入 SKU 搜索商品" value=""/);
  assert.match(html, /产品名称/);
  assert.match(html, /placeholder="选择商品后自动填充，也可手动输入" value=""/);
  assert.match(html, /摄影原图地址（选填）/);
  assert.doesNotMatch(html, /产品图片与资料地址/);
  assert.doesNotMatch(html, /产品 AI 精品广告/);
  assert.doesNotMatch(html, /TP10241PI|电子炉灶厨房玩具套装|B08X9ZPXYZ/);
});

test('ordinary custom orders choose a format but do not expose an expected date', () => {
  const html = renderToStaticMarkup(
    <OrderCreateView
      videoTypes={INITIAL_VIDEO_TYPES}
      videoPersonnel={INITIAL_VIDEO_PERSONNEL}
      preselectedVideoTypeId="custom"
      onSubmitTask={() => undefined}
      onNavigateToOrders={() => undefined}
    />,
  );

  assert.match(html, /输出比例/);
  assert.match(html, /16:9 横版/);
  assert.match(html, /9:16 竖版/);
  assert.equal((html.match(/期望完成时间/g) || []).length, 0);
  assert.equal((html.match(/type="date"/g) || []).length, 0);
});

test('urgency summary always places the requested date before the optional reason', () => {
  const module = OrderCreateView as typeof OrderCreateView & {
    buildUrgencySummary?: never;
  };
  const helpers = AppModule as typeof AppModule & {
    buildUrgencySummary?: (date: string, reason: string) => string;
  };

  assert.equal(typeof helpers.buildUrgencySummary, 'function');
  assert.equal(
    helpers.buildUrgencySummary?.('2026-08-25', '新品发布'),
    '期望完成日期：2026-08-25\n加急说明：新品发布',
  );
  assert.equal(helpers.buildUrgencySummary?.('2026-08-25', ''), '期望完成日期：2026-08-25');
  assert.equal(typeof module, 'function');
});

test('portfolio order navigation resets the browser viewport to the page top', () => {
  const app = AppModule as typeof AppModule & {
    scrollPageToTop?: (scrollTo: (options: ScrollToOptions) => void) => void;
  };
  let received: ScrollToOptions | undefined;

  assert.equal(typeof app.scrollPageToTop, 'function');
  app.scrollPageToTop?.((options) => { received = options; });
  assert.deepEqual(received, { top: 0, left: 0, behavior: 'auto' });
});
