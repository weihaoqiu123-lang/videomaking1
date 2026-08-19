import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PortfolioView } from '../src/components/PortfolioView';

const renderPortfolio = () => renderToStaticMarkup(
  <PortfolioView onNavigateToOrderCreate={() => undefined} />,
);

test('portfolio is a restrained ERP page with three approved groups', () => {
  const html = renderPortfolio();
  assert.match(html, /HOOYA 视频制作服务/);
  assert.match(html, /常规产品视频/);
  assert.match(html, /营销创意视频/);
  assert.match(html, /后期与专项/);
  assert.doesNotMatch(html, /近期热门视频|hero-video|SOUND OFF/);
});

test('every work and team representative is an external video link', () => {
  const html = renderPortfolio();
  assert.match(html, /target="_blank"/);
  assert.match(html, /制作团队与代表作/);
  assert.match(html, /创建此类型视频需求/);
  assert.doesNotMatch(html, /产品 AI 精品广告/);
});
