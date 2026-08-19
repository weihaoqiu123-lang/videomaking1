import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_TASKS } from '../src/data/mockData';
import { ManagerApprovalView } from '../src/views/ManagerApprovalView';
import { OperatorOrdersView } from '../src/views/OperatorOrdersView';
import { VideoTasksView } from '../src/views/VideoTasksView';
import { Navigation } from '../src/components/Navigation';

test('V1 navigation omits the task monitoring tab', () => {
  const html = renderToStaticMarkup(<Navigation currentRole="manager" currentPage="manager_approval" onNavigate={() => undefined} pendingUrgentCount={1} pendingManagerReviewCount={1} pendingVideoCount={1} />);
  assert.match(html, /待办审核（加急 \/ 初审）/);
  assert.doesNotMatch(html, /视频任务总览与监控/);
});

test('manager queue exposes task amount and initial-review wording', () => {
  const html = renderToStaticMarkup(<ManagerApprovalView tasks={INITIAL_TASKS} onApproveUrgency={() => undefined} onManagerReview={() => undefined} />);
  assert.match(html, /任务金额/);
  assert.match(html, /主管初审/);
  assert.match(html, /36 USD/);
});

test('operator can delete queued work and complete final review', () => {
  const html = renderToStaticMarkup(<OperatorOrdersView tasks={INITIAL_TASKS} onCancelTask={() => undefined} onOperatorReview={() => undefined} />);
  assert.match(html, /删除需求/);
  assert.match(html, /查看成片/);
  assert.match(html, /终审通过/);
});

test('creator queue supports confirming work before production', () => {
  const html = renderToStaticMarkup(<VideoTasksView tasks={INITIAL_TASKS} currentStaffName="张晨" onUpdateTaskNode={() => undefined} />);
  assert.match(html, /待视频组确认/);
  assert.match(html, /处理此节点/);
});
