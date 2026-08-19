import type { FormatId, ServiceId, ServiceTierId } from './serviceCatalog';
import { SAMPLE_STATUS_OPTIONS } from './serviceCatalog';

export type EditingMode = 'basic' | 'mix';

export interface OrderFormConfig {
  materialTitle: string;
  materialHint: string;
  formatIds: FormatId[];
  defaultFormatId?: FormatId;
  sampleStatuses?: readonly string[];
  packageNote?: string;
}

const configs: Record<ServiceId, OrderFormConfig> = {
  ai_showcase: {
    materialTitle: '商品与摄影资料',
    materialHint: '商品链接、SKU 和产品名称为必填，摄影原图地址为选填。',
    formatIds: ['landscape', 'portrait', 'dual'],
    defaultFormatId: 'landscape',
  },
  live_showcase: {
    materialTitle: '产品与实拍资料',
    materialHint: '请说明重点实拍要求、样品物流状态和是否需要人物讲解。',
    formatIds: ['landscape', 'portrait'],
    defaultFormatId: 'landscape',
    sampleStatuses: SAMPLE_STATUS_OPTIONS,
  },
  ugc: {
    materialTitle: '产品卖点与投放资料',
    materialHint: '请提供产品资料、核心卖点和希望测试的表达方向。',
    formatIds: ['portrait', 'landscape', 'dual'],
    defaultFormatId: 'portrait',
    packageNote: '三条测试包会制作三种不同钩子或卖点方向，不是同一条视频替换文字。',
  },
  installation: {
    materialTitle: '安装资料与样品',
    materialHint: '请提供安装步骤、说明书、配件情况和样品物流状态。',
    formatIds: ['landscape'],
    defaultFormatId: 'landscape',
    sampleStatuses: SAMPLE_STATUS_OPTIONS,
  },
  editing: {
    materialTitle: '原始素材',
    materialHint: '请提供可访问的原始素材地址，并确认是基础修改还是常规混剪。',
    formatIds: ['landscape', 'portrait', 'dual'],
    defaultFormatId: 'landscape',
  },
  custom: {
    materialTitle: '项目 Brief 与品牌资料',
    materialHint: '请提供项目描述、品牌资料和参考作品。',
    formatIds: ['landscape', 'portrait', 'dual'],
    defaultFormatId: 'landscape',
  },
};

export const getOrderFormConfig = (serviceId: ServiceId) => configs[serviceId];

export const getAllowedDurations = (
  serviceId: ServiceId,
  options: { tierId?: ServiceTierId; editingMode?: EditingMode } = {},
): string[] => {
  switch (serviceId) {
    case 'ai_showcase':
      return options.tierId === 'custom' ? ['30 秒以内', '60 秒以内'] : ['30 秒以内'];
    case 'live_showcase':
      return ['30 秒', '45 秒', '60 秒'];
    case 'ugc':
      return ['15 秒', '20 秒', '30 秒'];
    case 'installation':
      return ['按实际安装流程'];
    case 'editing':
      return ['60 秒以内'];
    case 'custom':
      return ['由视频组确认'];
  }
};

const clearLabels: Record<ServiceId, string[]> = {
  ai_showcase: ['商品、SKU 与摄影原图'],
  live_showcase: ['实拍要求与样品状态'],
  ugc: ['产品卖点与钩子方向'],
  installation: ['安装步骤、说明书与样品状态'],
  editing: ['原始素材与剪辑方式'],
  custom: ['项目 Brief 与品牌资料'],
};

export const getTypeSwitchClearLabels = (from: ServiceId, to: ServiceId) => {
  if (from === to) return [];
  return [...clearLabels[from], '规格与价格设置', '已选制作人'];
};
