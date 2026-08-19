import assert from 'node:assert/strict';
import test from 'node:test';
import * as taskUtils from '../src/utils/taskUtils';

type QueueTask = {
  id: string;
  isUrgent: boolean;
  createdAt: string;
};

const tasks: QueueTask[] = [
  { id: 'normal-late', isUrgent: false, createdAt: '2026-08-18 11:00' },
  { id: 'urgent-late', isUrgent: true, createdAt: '2026-08-18 10:00' },
  { id: 'normal-early', isUrgent: false, createdAt: '2026-08-18 08:00' },
  { id: 'urgent-early', isUrgent: true, createdAt: '2026-08-18 09:00' },
];

test('video task queue defaults to urgent first and FIFO inside each priority group', () => {
  const utils = taskUtils as typeof taskUtils & {
    orderVideoTasks?: <T extends QueueTask>(items: T[], manualOrder?: string[]) => T[];
  };

  assert.equal(typeof utils.orderVideoTasks, 'function');
  assert.deepEqual(
    utils.orderVideoTasks?.(tasks).map((task) => task.id),
    ['urgent-early', 'urgent-late', 'normal-early', 'normal-late'],
  );
});

test('drag reorder changes order only inside the same priority group', () => {
  const utils = taskUtils as typeof taskUtils & {
    reorderVideoTasks?: <T extends QueueTask>(items: T[], sourceId: string, targetId: string) => T[];
  };

  assert.equal(typeof utils.reorderVideoTasks, 'function');

  const ordered = [tasks[3], tasks[1], tasks[2], tasks[0]];
  assert.deepEqual(
    utils.reorderVideoTasks?.(ordered, 'urgent-late', 'urgent-early').map((task) => task.id),
    ['urgent-late', 'urgent-early', 'normal-early', 'normal-late'],
  );
  assert.deepEqual(
    utils.reorderVideoTasks?.(ordered, 'normal-early', 'urgent-early').map((task) => task.id),
    ['urgent-early', 'urgent-late', 'normal-early', 'normal-late'],
  );
});
