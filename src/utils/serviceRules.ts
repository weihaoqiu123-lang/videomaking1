import {
  AI_SHOWCASE_TIERS,
  ServiceId,
  ServiceTierId,
} from '../data/serviceCatalog';

export interface PriceSelection {
  serviceId: ServiceId;
  tierId?: ServiceTierId;
  formatId?: 'landscape' | 'portrait' | 'dual';
  packageId?: 'single' | 'triple';
  addLandscape?: boolean;
  editingMode?: 'basic' | 'mix';
  outputVersionCount?: number;
  finishedVideoCount?: number;
  quantity?: number;
}

export interface PersonnelLoadDisplay {
  key: 'idle' | 'normal' | 'busy' | 'full';
  label: '空闲' | '正常' | '较忙' | '爆满';
  isDisabled: boolean;
  estimate: string;
}

const positiveCount = (value: number | undefined) => Math.max(1, value ?? 1);

export const calculateBasePrice = (selection: PriceSelection): number | null => {
  const quantity = positiveCount(selection.quantity);

  switch (selection.serviceId) {
    case 'ai_showcase': {
      const tier = AI_SHOWCASE_TIERS.find((item) => item.id === selection.tierId);
      if (!tier) return null;
      const formatMultiplier = selection.formatId === 'dual' ? 1.5 : 1;
      return tier.price * formatMultiplier * quantity;
    }
    case 'live_showcase':
      return 200 * quantity;
    case 'ugc': {
      const packagePrice = selection.packageId === 'triple' ? 120 : 50;
      const landscapeMultiplier = selection.formatId === 'dual' || selection.addLandscape ? 1.5 : 1;
      return packagePrice * landscapeMultiplier * quantity;
    }
    case 'installation':
      return 30 * quantity;
    case 'editing':
      if (selection.editingMode === 'basic') {
        return 5 * positiveCount(selection.outputVersionCount);
      }
      if (selection.editingMode === 'mix') {
        return 40 * positiveCount(selection.finishedVideoCount);
      }
      return null;
    case 'custom':
      return null;
  }
};

export const calculateUrgentPrice = (basePrice: number | null): number | null => {
  if (basePrice === null) return null;
  return Math.round(basePrice * 1.2 * 100) / 100;
};

export const getPersonnelLoad = (currentTasks: number): PersonnelLoadDisplay => {
  if (currentTasks >= 20) {
    return { key: 'full', label: '爆满', isDisabled: true, estimate: '暂不可接单' };
  }
  if (currentTasks >= 11) {
    return { key: 'busy', label: '较忙', isDisabled: false, estimate: '预计约 3-4 周后开始' };
  }
  if (currentTasks >= 6) {
    return { key: 'normal', label: '正常', isDisabled: false, estimate: '预计约 2 周后开始' };
  }
  return { key: 'idle', label: '空闲', isDisabled: false, estimate: '预计约 1 周后开始' };
};

export const supportsService = (supportedTypeIds: string[], serviceId: ServiceId) =>
  supportedTypeIds.includes(serviceId);
