export type ServiceId =
  | 'ai_showcase'
  | 'live_showcase'
  | 'ugc'
  | 'installation'
  | 'editing'
  | 'custom';

export type ServiceTierId = 'standard' | 'creative' | 'custom';
export type FormatId = 'landscape' | 'portrait' | 'dual';

export interface ServiceTier {
  id: ServiceTierId;
  name: string;
  description: string;
  duration: string;
  resolution: string;
  price: number;
}

export interface ServiceFormat {
  id: FormatId;
  name: string;
}

export interface ServiceDefinition {
  id: ServiceId;
  legacyId: string;
  number: string;
  name: string;
  shortName: string;
  summary: string;
  materialHint: string;
  duration: string;
  priceLabel: string;
  formats: ServiceFormat[];
  tiers?: ServiceTier[];
  supportsMultipleSku?: boolean;
  requiresSample?: boolean;
  customQuote?: boolean;
}

export const SAMPLE_STATUS_OPTIONS = ['待寄送', '寄送中', '已到样'] as const;

export const INTENDED_USE_OPTIONS = [
  '商品展示',
  '广告投放',
  '社媒发布',
  '品牌传播',
  '其他',
] as const;

export const AI_SHOWCASE_TIERS: ServiceTier[] = [
  {
    id: 'standard',
    name: '标准版',
    description: '使用成熟结构呈现产品与核心卖点。',
    duration: '30 秒以内',
    resolution: '720p',
    price: 80,
  },
  {
    id: 'creative',
    name: '创意版',
    description: '适合结构复杂、人物互动或场景生成难度较高的产品。',
    duration: '30 秒以内',
    resolution: '720p',
    price: 100,
  },
  {
    id: 'custom',
    name: '定制版',
    description: '适合对创意、分镜、时长或清晰度有高规格要求的项目。',
    duration: '30 秒以内或 60 秒以内',
    resolution: '1080p',
    price: 160,
  },
];

const LANDSCAPE: ServiceFormat = { id: 'landscape', name: '16:9 横版' };
const PORTRAIT: ServiceFormat = { id: 'portrait', name: '9:16 竖版' };
const DUAL: ServiceFormat = { id: 'dual', name: '横竖双版' };

export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: 'ai_showcase',
    legacyId: 'vt_03',
    number: '01',
    name: '产品 AI 展示视频',
    shortName: 'AI 展示视频',
    summary: '利用产品图片和资料制作动态展示，突出外观、场景和核心卖点。',
    materialHint: '提供商品链接、SKU、产品名称；摄影原图地址为选填。',
    duration: '标准版/创意版 30 秒以内，定制版可选 30 秒或 60 秒以内',
    priceLabel: '80 USD 起',
    formats: [LANDSCAPE, PORTRAIT, DUAL],
    tiers: AI_SHOWCASE_TIERS,
  },
  {
    id: 'live_showcase',
    legacyId: 'vt_01',
    number: '02',
    name: '产品实拍展示视频',
    shortName: '实拍展示',
    summary: '通过真实样品呈现产品外观、材质、细节和使用过程。',
    materialHint: '提供实拍要求、重点细节、人物讲解需求和样品状态。',
    duration: '30-60 秒',
    priceLabel: '200 USD / 条',
    formats: [LANDSCAPE, PORTRAIT],
    requiresSample: true,
  },
  {
    id: 'ugc',
    legacyId: 'vt_06',
    number: '03',
    name: '社媒 UGC 广告',
    shortName: 'UGC 广告',
    summary: '以真实用户感表达制作多钩子短视频，用于社媒发布和广告测试。',
    materialHint: '提供产品资料、核心卖点和希望测试的表达方向。',
    duration: '15-30 秒',
    priceLabel: '50 USD 起',
    formats: [PORTRAIT, LANDSCAPE, DUAL],
  },
  {
    id: 'installation',
    legacyId: 'vt_02',
    number: '04',
    name: '产品安装视频',
    shortName: '安装视频',
    summary: '真实拍摄完整组装和安装步骤，帮助用户完成操作并减少售后沟通。',
    materialHint: '提供安装步骤、说明书、配件情况和样品状态。',
    duration: '按实际安装流程',
    priceLabel: '30 USD / 条',
    formats: [LANDSCAPE],
    requiresSample: true,
  },
  {
    id: 'editing',
    legacyId: 'vt_05',
    number: '05',
    name: '纯剪辑任务',
    shortName: '纯剪辑',
    summary: '使用已有视频或素材完成基础修改或常规混剪。',
    materialHint: '提供原始素材地址，并区分输出版本数量和成片数量。',
    duration: '60 秒以内',
    priceLabel: '5 USD 起',
    formats: [LANDSCAPE, PORTRAIT, DUAL],
  },
  {
    id: 'custom',
    legacyId: 'vt_07',
    number: '06',
    name: '定制 / 专项需求',
    shortName: '定制需求',
    summary: '承接品牌宣传片、特殊人物拍摄和其他非标准视频项目。',
    materialHint: '提供项目描述、品牌资料和参考作品。',
    duration: '按项目确认',
    priceLabel: '确认后报价',
    formats: [LANDSCAPE, PORTRAIT, DUAL],
    customQuote: true,
  },
];

export const getServiceById = (serviceId: ServiceId) =>
  SERVICE_CATALOG.find((service) => service.id === serviceId);

export const getServiceByLegacyId = (legacyId: string) =>
  SERVICE_CATALOG.find((service) => service.legacyId === legacyId);
