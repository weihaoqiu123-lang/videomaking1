import assert from 'node:assert/strict';
import test from 'node:test';
import {
  portfolioMembers,
  portfolioGroups,
  portfolioSections,
  portfolioWorks,
  popularWorks,
} from '../src/data/portfolioData';

test('portfolio shows three recent popular works with scoped demo metrics', () => {
  assert.equal(popularWorks.length, 3);
  for (const work of popularWorks) {
    assert.equal(work.metric.period, '最近 30 天');
    assert.equal(work.metric.isDemo, true);
    assert.ok(work.metric.value.length > 0);
  }
});

test('AI showcase has three tiers and three works in every tier', () => {
  const aiSection = portfolioSections.find((section) => section.serviceId === 'ai_showcase');
  assert.ok(aiSection);
  assert.deepEqual(aiSection.tiers?.map((tier) => tier.name), ['标准版', '创意版', '定制版']);
  assert.deepEqual(aiSection.tiers?.map((tier) => tier.works.length), [3, 3, 3]);
});

test('portfolio categories follow the approved portfolio order', () => {
  assert.deepEqual(
    portfolioSections.map((section) => section.serviceId),
    ['ai_showcase', 'live_showcase', 'ugc', 'installation', 'editing'],
  );
});

test('portfolio uses the three approved ERP groups', () => {
  assert.deepEqual(portfolioGroups.map((group) => group.title), ['常规产品视频', '营销创意视频', '后期与专项']);
  assert.deepEqual(portfolioGroups[0].serviceIds, ['ai_showcase', 'live_showcase', 'installation']);
  assert.deepEqual(portfolioGroups[1].serviceIds, ['ugc']);
  assert.deepEqual(portfolioGroups[2].serviceIds, ['editing', 'custom']);
  assert.ok(portfolioWorks.every((work) => work.videoUrl.startsWith('http')));
});

test('UGC work covers are explicitly vertical', () => {
  const ugcWorks = portfolioWorks.filter((work) => work.serviceId === 'ugc');
  assert.equal(ugcWorks.length, 3);
  assert.ok(ugcWorks.every((work) => work.aspectRatio === '9:16'));
});

test('every displayed creator links to a real representative work', () => {
  const workIds = new Set(portfolioWorks.map((work) => work.id));
  for (const creator of portfolioMembers) {
    assert.equal(workIds.has(creator.representativeWorkId), true, creator.name);
  }
});
