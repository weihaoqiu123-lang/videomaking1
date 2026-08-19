import type { ServiceId } from '../data/serviceCatalog';
import type { MainStatus, NodeStage, TaskItem } from '../types';

export interface StepDefinition {
  key: NodeStage;
  label: string;
  roleHint: string;
}

const shootingServices = new Set<ServiceId>(['live_showcase', 'installation', 'custom']);

export const getProductionStartNode = (serviceId: string): NodeStage =>
  shootingServices.has(serviceId as ServiceId) ? 'shooting' : 'editing';

export const getNodeSteps = (serviceId?: string): StepDefinition[] => {
  const productionSteps: StepDefinition[] = getProductionStartNode(serviceId || '') === 'shooting'
    ? [
        { key: 'shooting', label: '拍摄', roleHint: '视频人员' },
        { key: 'editing', label: '剪辑', roleHint: '视频人员' },
      ]
    : [{ key: 'editing', label: '剪辑', roleHint: '视频人员' }];

  return [
    { key: 'queued', label: '待视频组确认', roleHint: '视频人员' },
    ...productionSteps,
    { key: 'manager_review', label: '视频主管初审', roleHint: '视频负责人' },
    { key: 'ready_for_operator_review', label: '待推送运营', roleHint: '视频人员' },
    { key: 'operator_review', label: '运营终审', roleHint: '运营人员' },
    { key: 'finished', label: '已完成', roleHint: '系统完结' },
  ];
};

export const getMainStatusBadge = (status: MainStatus) => {
  switch (status) {
    case 'pending':
      return { label: '排队中', bg: 'bg-[#fffae6] text-[#a65b00] border-[#ffe380] font-semibold' };
    case 'in_progress':
      return { label: '制作中', bg: 'bg-[#deebff] text-[#0052cc] border-[#b3d4ff] font-semibold' };
    case 'reviewing':
      return { label: '审核中', bg: 'bg-[#fff0b3] text-[#172b4d] border-[#ffe380] font-semibold' };
    case 'returned':
      return { label: '已退回', bg: 'bg-[#ffebe6] text-[#bf2600] border-[#ffbdad] font-semibold' };
    case 'completed':
      return { label: '已完成', bg: 'bg-[#e3fcef] text-[#006644] border-[#abf5d1] font-semibold' };
    case 'cancelled':
      return { label: '已取消', bg: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold' };
  }
};

export const getNodeBadge = (node: NodeStage) => {
  switch (node) {
    case 'pending_urgency':
      return { label: '加急审核中', bg: 'bg-[#ffebe6] text-[#de350b] border-[#ffbdad] font-semibold' };
    case 'queued':
      return { label: '待视频组确认', bg: 'bg-[#deebff] text-[#0052cc] border-[#b3d4ff] font-medium' };
    case 'shooting':
      return { label: '拍摄中', bg: 'bg-[#deebff] text-[#0052cc] border-[#b3d4ff] font-medium' };
    case 'editing':
      return { label: '剪辑中', bg: 'bg-[#e6fcff] text-[#006f83] border-[#b3f5fc] font-medium' };
    case 'manager_review':
      return { label: '视频主管初审中', bg: 'bg-[#fff0b3] text-[#6b5200] border-[#ffe380] font-medium' };
    case 'ready_for_operator_review':
      return { label: '待推送运营', bg: 'bg-[#eae6ff] text-[#403294] border-[#c0b6f2] font-medium' };
    case 'operator_review':
      return { label: '运营终审中', bg: 'bg-[#eae6ff] text-[#403294] border-[#c0b6f2] font-medium' };
    case 'returned':
      return { label: '已退回', bg: 'bg-[#ffebe6] text-[#bf2600] border-[#ffbdad] font-medium' };
    case 'revision':
      return { label: '修改中', bg: 'bg-[#e6fcff] text-[#006f83] border-[#b3f5fc] font-medium' };
    case 'finished':
      return { label: '已完成', bg: 'bg-[#e3fcef] text-[#006644] border-[#abf5d1] font-medium' };
    case 'cancelled':
      return { label: '已取消', bg: 'bg-slate-100 text-slate-600 border-slate-200 font-medium' };
  }
};

export const getInitialNodeForService = (_serviceId: string, isUrgent: boolean): NodeStage =>
  isUrgent ? 'pending_urgency' : 'queued';

export const getNextNode = (currentNode: NodeStage, serviceId?: string): NodeStage => {
  if (currentNode === 'pending_urgency') return 'queued';
  if (currentNode === 'returned') return 'revision';
  if (currentNode === 'revision') return 'manager_review';
  const steps = getNodeSteps(serviceId);
  const index = steps.findIndex((step) => step.key === currentNode);
  return index >= 0 && index < steps.length - 1 ? steps[index + 1].key : 'finished';
};

export const getMainStatusFromNode = (node: NodeStage): MainStatus => {
  if (node === 'pending_urgency' || node === 'queued') return 'pending';
  if (node === 'shooting' || node === 'editing' || node === 'revision') return 'in_progress';
  if (node === 'manager_review' || node === 'ready_for_operator_review' || node === 'operator_review') return 'reviewing';
  if (node === 'returned') return 'returned';
  if (node === 'cancelled') return 'cancelled';
  return 'completed';
};

export const getNodeOrder = (node: NodeStage, serviceId?: string): number => {
  if (node === 'pending_urgency') return -1;
  if (node === 'returned') return 3;
  if (node === 'revision') return 4;
  if (node === 'cancelled') return 99;
  const index = getNodeSteps(serviceId).findIndex((step) => step.key === node);
  return index === -1 ? 0 : index;
};

export const canOperatorCancel = (task: Pick<TaskItem, 'currentNode'>) =>
  task.currentNode === 'pending_urgency' || task.currentNode === 'queued';

export const getEffectiveTaskAmount = (
  task: Pick<TaskItem, 'basePrice' | 'urgentApprovedPrice' | 'urgencyStatus'>,
): number | null => {
  if (task.urgencyStatus === 'approved') return task.urgentApprovedPrice ?? task.basePrice ?? null;
  return task.basePrice ?? null;
};

interface VideoQueueTask {
  id: string;
  isUrgent: boolean;
  createdAt: string;
}

export const orderVideoTasks = <T extends VideoQueueTask>(tasks: T[], manualOrder: string[] = []): T[] => {
  const manualRank = new Map(manualOrder.map((taskId, index) => [taskId, index]));
  return [...tasks].sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
    const rankA = manualRank.get(a.id);
    const rankB = manualRank.get(b.id);
    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

export const reorderVideoTasks = <T extends VideoQueueTask>(
  tasks: T[],
  sourceId: string,
  targetId: string,
): T[] => {
  if (sourceId === targetId) return [...tasks];
  const source = tasks.find((task) => task.id === sourceId);
  const target = tasks.find((task) => task.id === targetId);
  if (!source || !target || source.isUrgent !== target.isUrgent) return [...tasks];
  const reordered = tasks.filter((task) => task.id !== sourceId);
  const targetIndex = reordered.findIndex((task) => task.id === targetId);
  reordered.splice(targetIndex, 0, source);
  return reordered;
};
export const buildUrgencySummary = (targetDate?: string, reason?: string) => {
  const lines: string[] = [];
  if (targetDate) lines.push(`期望完成日期：${targetDate}`);
  if (reason?.trim()) lines.push(`加急说明：${reason.trim()}`);
  return lines.join('\n');
};
