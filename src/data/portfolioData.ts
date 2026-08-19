import type { ServiceId, ServiceTierId } from './serviceCatalog';
import { INITIAL_VIDEO_PERSONNEL } from './mockData';
import { getPersonnelLoad } from '../utils/serviceRules';

export interface PortfolioItem {
  id: string;
  title: string;
  productName: string;
  sku: string;
  serviceId: ServiceId;
  videoTypeId: ServiceId;
  videoTypeName: string;
  creatorId: string;
  creatorName: string;
  duration: string;
  thumbnail: string;
  image: string;
  videoUrl: string;
  description: string;
  tierId?: ServiceTierId;
  tierName?: string;
  aspectRatio: '16:9' | '9:16' | '4:3' | '1:1';
}

export interface PortfolioTier {
  id: ServiceTierId;
  name: string;
  works: PortfolioItem[];
}

export interface PortfolioSection {
  serviceId: Exclude<ServiceId, 'custom'>;
  title: string;
  shortTitle: string;
  intro: string;
  price: string;
  duration: string;
  works: PortfolioItem[];
  tiers?: PortfolioTier[];
}

export interface PortfolioGroup {
  id: 'product' | 'marketing' | 'postproduction';
  title: string;
  description: string;
  serviceIds: ServiceId[];
}

export interface PopularWork extends PortfolioItem {
  metric: {
    label: string;
    value: string;
    period: '最近 30 天';
    isDemo: true;
  };
}

export interface PortfolioMember {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  currentTasks: number;
  status: '空闲' | '正常' | '较忙' | '爆满';
  statusKey: 'idle' | 'normal' | 'busy' | 'full';
  estimate: string;
  representativeWorkId: string;
}

const images = {
  canopy: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=84',
  camping: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1400&q=84',
  kitchen: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1400&q=84',
  bike: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=84',
  interior: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1400&q=84',
  sofa: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=84',
  studio: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=84',
  bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=84',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=84',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=84',
  portrait: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=84',
  desk: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=84',
} as const;

const work = (
  value: Omit<PortfolioItem, 'videoTypeId' | 'thumbnail' | 'image' | 'videoUrl'> & { image: string; videoUrl?: string },
): PortfolioItem => ({
  ...value,
  videoTypeId: value.serviceId,
  thumbnail: value.image,
  image: value.image,
  videoUrl: value.videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-product-showcase-on-a-clean-background-49472-large.mp4',
});

const aiStandardWorks = [
  work({ id: 'ai_standard_01', title: 'Breeze Control', productName: '户外智能遮阳篷', sku: 'HUAWEI123', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_wangmin', creatorName: '王敏', duration: '28 秒', image: images.canopy, description: '通过光影变化展示遮阳篷展开结构、防雨材质和庭院使用场景。', tierId: 'standard', tierName: '标准版', aspectRatio: '16:9' }),
  work({ id: 'ai_standard_02', title: 'Weekend Power', productName: '户外便携电源', sku: 'PWR-208', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_liuwei', creatorName: '刘伟', duration: '26 秒', image: images.camping, description: '围绕露营用电场景快速呈现接口、续航与便携卖点。', tierId: 'standard', tierName: '标准版', aspectRatio: '16:9' }),
  work({ id: 'ai_standard_03', title: 'Countertop Daily', productName: '多功能空气炸锅', sku: 'AF-3001', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_sunyue', creatorName: '孙悦', duration: '25 秒', image: images.kitchen, description: '以日常厨房节奏呈现容量、触控面板和多菜单功能。', tierId: 'standard', tierName: '标准版', aspectRatio: '16:9' }),
];

const aiCreativeWorks = [
  work({ id: 'ai_creative_01', title: 'Urban Fold', productName: '城市折叠电动自行车', sku: 'SP38244US', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_wangmin', creatorName: '王敏', duration: '30 秒', image: images.bike, description: '用城市通勤场景和结构动画解释折叠效率与动力表现。', tierId: 'creative', tierName: '创意版', aspectRatio: '16:9' }),
  work({ id: 'ai_creative_02', title: 'Quiet Geometry', productName: '智能空气净化器', sku: 'AIR-90', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_liuwei', creatorName: '刘伟', duration: '29 秒', image: images.interior, description: '使用空气流动和空间层次表现静音净化与家居融合。', tierId: 'creative', tierName: '创意版', aspectRatio: '16:9' }),
  work({ id: 'ai_creative_03', title: 'Material Shift', productName: '模块化客厅沙发', sku: 'SOFA-72', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_sunyue', creatorName: '孙悦', duration: '30 秒', image: images.sofa, description: '通过模块重组动画展示不同户型下的组合方式。', tierId: 'creative', tierName: '创意版', aspectRatio: '16:9' }),
];

const aiCustomWorks = [
  work({ id: 'ai_custom_01', title: 'Future Workspace', productName: '智能升降办公桌', sku: 'DESK-PRO', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_wangmin', creatorName: '王敏', duration: '52 秒', image: images.desk, description: '以完整分镜串联办公状态、结构变化和智能控制体验。', tierId: 'custom', tierName: '定制版', aspectRatio: '16:9' }),
  work({ id: 'ai_custom_02', title: 'Light Archive', productName: '全屋智能灯光系统', sku: 'LIGHT-08', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_liuwei', creatorName: '刘伟', duration: '48 秒', image: images.bedroom, description: '以晨起、阅读和睡眠场景组织完整灯光叙事。', tierId: 'custom', tierName: '定制版', aspectRatio: '16:9' }),
  work({ id: 'ai_custom_03', title: 'Precision Frame', productName: '4K 运动相机', sku: 'CAM-4K', serviceId: 'ai_showcase', videoTypeName: '产品 AI 展示视频', creatorId: 'vp_sunyue', creatorName: '孙悦', duration: '56 秒', image: images.camera, description: '结合高速运动、微距结构和防抖画面对产品能力进行完整表达。', tierId: 'custom', tierName: '定制版', aspectRatio: '16:9' }),
];

const liveWorks = [
  work({ id: 'live_01', title: 'Surface Detail', productName: '真皮软包双人床', sku: 'BED-303', serviceId: 'live_showcase', videoTypeName: '产品实拍展示视频', creatorId: 'vp_zhangchen', creatorName: '张晨', duration: '42 秒', image: images.bedroom, description: '自然光棚拍突出皮革纹理、框架回弹和床体比例。', aspectRatio: '16:9' }),
  work({ id: 'live_02', title: 'Kitchen Routine', productName: '30L 智能空气炸锅', sku: 'AF-3001', serviceId: 'live_showcase', videoTypeName: '产品实拍展示视频', creatorId: 'vp_lihao', creatorName: '李浩', duration: '38 秒', image: images.kitchen, description: '真实演示触控、烘焙和清洁过程，建立产品可信度。', aspectRatio: '16:9' }),
  work({ id: 'live_03', title: 'Ride Ready', productName: '城市折叠电动自行车', sku: 'SP38244US', serviceId: 'live_showcase', videoTypeName: '产品实拍展示视频', creatorId: 'vp_zhaoqi', creatorName: '赵琪', duration: '45 秒', image: images.bike, description: '在通勤环境中展示折叠、搬运、启动和骑行体验。', aspectRatio: '16:9' }),
];

const ugcWorks = [
  work({ id: 'ugc_01', title: 'Three Second Hook', productName: '无线便携榨汁杯', sku: 'JUICE-11', serviceId: 'ugc', videoTypeName: '社媒 UGC 广告', creatorId: 'vp_sunyue', creatorName: '孙悦', duration: '18 秒', image: images.portrait, description: '用通勤早餐痛点作为开场钩子，快速展示便携和清洗卖点。', aspectRatio: '9:16' }),
  work({ id: 'ugc_02', title: 'Desk Reset', productName: '折叠桌面收纳架', sku: 'DESK-18', serviceId: 'ugc', videoTypeName: '社媒 UGC 广告', creatorId: 'vp_lihao', creatorName: '李浩', duration: '22 秒', image: images.desk, description: '通过桌面整理前后对比建立直接的视觉收益。', aspectRatio: '9:16' }),
  work({ id: 'ugc_03', title: 'One Hand Fold', productName: '轻量折叠电动自行车', sku: 'BIKE-21', serviceId: 'ugc', videoTypeName: '社媒 UGC 广告', creatorId: 'vp_wangmin', creatorName: '王敏', duration: '20 秒', image: images.bike, description: '用单手折叠演示验证轻量和快速收纳。', aspectRatio: '9:16' }),
];

const installationWorks = [
  work({ id: 'installation_01', title: 'Build the Shade', productName: '户外防腐木凉亭', sku: 'GZ-8820', serviceId: 'installation', videoTypeName: '产品安装视频', creatorId: 'vp_zhangchen', creatorName: '张晨', duration: '3 分 20 秒', image: images.canopy, description: '分步展示立柱、横梁、顶棚和紧固件安装顺序。', aspectRatio: '16:9' }),
  work({ id: 'installation_02', title: 'Chair in Five', productName: '人体工学办公椅', sku: 'CHR-202', serviceId: 'installation', videoTypeName: '产品安装视频', creatorId: 'vp_liuwei', creatorName: '刘伟', duration: '4 分 10 秒', image: images.studio, description: '聚焦气压棒、托盘和扶手螺丝的易错安装点。', aspectRatio: '16:9' }),
  work({ id: 'installation_03', title: 'Kitchen Playset', productName: '儿童模拟厨房套装', sku: 'TP10241PI', serviceId: 'installation', videoTypeName: '产品安装视频', creatorId: 'vp_chenkai', creatorName: '陈凯', duration: '5 分 05 秒', image: images.kitchen, description: '按配件分类和板件编号完成完整安装说明。', aspectRatio: '16:9' }),
];

const editingWorks = [
  work({ id: 'editing_01', title: 'Conversion Cut', productName: '多功能旋转切菜器', sku: 'CUT-102', serviceId: 'editing', videoTypeName: '纯剪辑任务', creatorId: 'vp_chenkai', creatorName: '陈凯', duration: '20 秒', image: images.kitchen, description: '把长素材重组为快节奏投放版本，并强化前 3 秒卖点。', aspectRatio: '9:16' }),
  work({ id: 'editing_02', title: 'Social Rhythm', productName: '轻量折叠电动自行车', sku: 'EBK-2026', serviceId: 'editing', videoTypeName: '纯剪辑任务', creatorId: 'vp_sunyue', creatorName: '孙悦', duration: '15 秒', image: images.bike, description: '重新安排镜头节奏、字幕和音乐卡点。', aspectRatio: '9:16' }),
  work({ id: 'editing_03', title: 'Brand Sequence', productName: '真无线空间音频耳机', sku: 'EAR-888', serviceId: 'editing', videoTypeName: '纯剪辑任务', creatorId: 'vp_zhouyu', creatorName: '周宇', duration: '30 秒', image: images.phone, description: '将分散素材整理为统一的品牌叙事和视觉包装。', aspectRatio: '16:9' }),
];

const aiTiers: PortfolioTier[] = [
  { id: 'standard', name: '标准版', works: aiStandardWorks },
  { id: 'creative', name: '创意版', works: aiCreativeWorks },
  { id: 'custom', name: '定制版', works: aiCustomWorks },
];

export const portfolioSections: PortfolioSection[] = [
  { serviceId: 'ai_showcase', title: '产品 AI 展示视频', shortTitle: 'AI 展示', intro: '用产品图片和资料构建动态场景，快速讲清外观、用途和核心卖点。', price: '80 USD 起', duration: '30 秒以内起', works: aiStandardWorks, tiers: aiTiers },
  { serviceId: 'live_showcase', title: '产品实拍展示视频', shortTitle: '实拍展示', intro: '用真实样品呈现材质、结构、尺寸和使用过程。', price: '200 USD / 条', duration: '30-60 秒', works: liveWorks },
  { serviceId: 'ugc', title: '社媒 UGC 广告', shortTitle: 'UGC 广告', intro: '用真实用户感和不同开场钩子制作可测试的社媒短视频。', price: '50 USD 起', duration: '15-30 秒', works: ugcWorks },
  { serviceId: 'installation', title: '产品安装视频', shortTitle: '安装视频', intro: '把完整安装流程、易错点和安全提示拍清楚。', price: '30 USD / 条', duration: '按安装流程', works: installationWorks },
  { serviceId: 'editing', title: '纯剪辑任务', shortTitle: '纯剪辑', intro: '使用现有成片或素材完成基础修改与常规混剪。', price: '5 USD 起', duration: '60 秒以内起', works: editingWorks },
];

export const portfolioGroups: PortfolioGroup[] = [
  { id: 'product', title: '常规产品视频', description: '用于商品详情、功能展示与安装说明。', serviceIds: ['ai_showcase', 'live_showcase', 'installation'] },
  { id: 'marketing', title: '营销创意视频', description: '用于社媒内容测试和广告投放。', serviceIds: ['ugc'] },
  { id: 'postproduction', title: '后期与专项', description: '用于已有素材处理及非标准项目。', serviceIds: ['editing', 'custom'] },
];

export const portfolioWorks = portfolioSections.flatMap((section) =>
  section.tiers ? section.tiers.flatMap((tier) => tier.works) : section.works,
);

const popular = [
  { id: 'ai_creative_01', metric: { label: '播放量', value: '128.6 万', period: '最近 30 天' as const, isDemo: true as const } },
  { id: 'ugc_01', metric: { label: '广告归因销售额', value: 'US$ 18.4k', period: '最近 30 天' as const, isDemo: true as const } },
  { id: 'live_01', metric: { label: '销售转化提升', value: '+21.7%', period: '最近 30 天' as const, isDemo: true as const } },
];

export const popularWorks: PopularWork[] = popular.map(({ id, metric }) => {
  const selected = portfolioWorks.find((item) => item.id === id);
  if (!selected) throw new Error(`Missing popular portfolio work: ${id}`);
  return { ...selected, metric };
});

const representativeWorkByPerson: Record<string, string> = {
  vp_zhangchen: 'live_01',
  vp_lihao: 'live_02',
  vp_wangmin: 'ai_creative_01',
  vp_chenkai: 'editing_01',
  vp_zhouyu: 'editing_03',
  vp_zhaoqi: 'live_03',
  vp_liuwei: 'installation_02',
  vp_sunyue: 'ugc_01',
};

export const portfolioMembers: PortfolioMember[] = INITIAL_VIDEO_PERSONNEL.map((person) => {
  const load = getPersonnelLoad(person.currentTasks);
  return {
    id: person.id,
    name: person.name,
    specialty: person.specialty,
    avatar: person.avatar,
    currentTasks: person.currentTasks,
    status: load.label,
    statusKey: load.key,
    estimate: load.estimate,
    representativeWorkId: representativeWorkByPerson[person.id],
  };
});

export const findPortfolioWork = (workId: string) =>
  portfolioWorks.find((item) => item.id === workId);
