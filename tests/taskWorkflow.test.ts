import assert from 'node:assert/strict';
import test from 'node:test';
import { INITIAL_TASKS } from '../src/data/mockData';
import { SERVICE_CATALOG } from '../src/data/serviceCatalog';
import type { TaskItem } from '../src/types';
import * as taskUtils from '../src/utils/taskUtils';

test('historical demo orders use active service names only', () => {
  const approvedNames = new Set(SERVICE_CATALOG.map((service) => service.name));

  for (const task of INITIAL_TASKS) {
    assert.equal(approvedNames.has(task.videoTypeName), true, task.taskNo);
    assert.doesNotMatch(task.videoTypeName, /精品广告/);
  }
});

test('all ordinary orders start queued and urgent orders start in urgency review', () => {
  assert.equal(taskUtils.getInitialNodeForService('editing', false), 'queued');
  assert.equal(taskUtils.getInitialNodeForService('live_showcase', false), 'queued');
  assert.equal(taskUtils.getInitialNodeForService('editing', true), 'pending_urgency');
});

test('accepting a queued task starts editing directly only for editing service', () => {
  const utils = taskUtils as typeof taskUtils & {
    getProductionStartNode?: (serviceId: string) => string;
  };

  assert.equal(typeof utils.getProductionStartNode, 'function');
  assert.equal(utils.getProductionStartNode?.('editing'), 'editing');
  assert.equal(utils.getProductionStartNode?.('live_showcase'), 'shooting');
  assert.equal(utils.getProductionStartNode?.('ai_showcase'), 'editing');
});

test('operator cancellation is limited to urgency review and queued tasks', () => {
  const utils = taskUtils as typeof taskUtils & {
    canOperatorCancel?: (task: Pick<TaskItem, 'currentNode'>) => boolean;
  };

  assert.equal(typeof utils.canOperatorCancel, 'function');
  assert.equal(utils.canOperatorCancel?.({ currentNode: 'pending_urgency' }), true);
  assert.equal(utils.canOperatorCancel?.({ currentNode: 'queued' } as Pick<TaskItem, 'currentNode'>), true);
  assert.equal(utils.canOperatorCancel?.({ currentNode: 'editing' }), false);
  assert.equal(utils.canOperatorCancel?.({ currentNode: 'operator_review' } as Pick<TaskItem, 'currentNode'>), false);
});

test('workflow includes manager initial review and operator final review', () => {
  assert.deepEqual(
    taskUtils.getNodeSteps('editing').map((step) => step.key),
    ['queued', 'editing', 'manager_review', 'ready_for_operator_review', 'operator_review', 'finished'],
  );
  assert.equal(taskUtils.getMainStatusFromNode('manager_review'), 'reviewing');
  assert.equal(taskUtils.getMainStatusFromNode('ready_for_operator_review' as never), 'reviewing');
  assert.equal(taskUtils.getMainStatusFromNode('operator_review' as never), 'reviewing');
  assert.equal(taskUtils.getMainStatusFromNode('returned' as never), 'returned');
  assert.equal(taskUtils.getMainStatusFromNode('revision' as never), 'in_progress');
  assert.equal(taskUtils.getMainStatusFromNode('cancelled' as never), 'cancelled');
});

test('task amount changes only after urgency approval', () => {
  const utils = taskUtils as typeof taskUtils & {
    getEffectiveTaskAmount?: (task: Pick<TaskItem, 'basePrice' | 'urgentApprovedPrice' | 'urgencyStatus'>) => number | null;
  };

  assert.equal(typeof utils.getEffectiveTaskAmount, 'function');
  assert.equal(utils.getEffectiveTaskAmount?.({ basePrice: 100, urgentApprovedPrice: 120, urgencyStatus: 'pending' }), 100);
  assert.equal(utils.getEffectiveTaskAmount?.({ basePrice: 100, urgentApprovedPrice: 120, urgencyStatus: 'approved' }), 120);
  assert.equal(utils.getEffectiveTaskAmount?.({ basePrice: null, urgentApprovedPrice: null, urgencyStatus: 'approved' }), null);
});
