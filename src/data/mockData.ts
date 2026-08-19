import { VideoType, VideoPersonnel, TaskItem } from '../types';
import { SERVICE_CATALOG } from './serviceCatalog';
import { PRODUCT_CATALOG } from './productCatalog';
export { getProductBySku, searchProducts } from './productCatalog';

export const INITIAL_VIDEO_TYPES: VideoType[] = SERVICE_CATALOG.map((service) => ({
  id: service.id,
  num: service.number,
  name: service.name,
  shortDesc: service.summary,
  needsShoot: ['live_showcase', 'installation', 'custom'].includes(service.id),
}));

export const INITIAL_VIDEO_PERSONNEL: VideoPersonnel[] = [
  {
    id: 'vp_zhangchen',
    name: '张晨',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Kai&backgroundColor=cfff20',
    specialty: '产品实拍 / 安装 / 专项拍摄',
    supportedTypeIds: ['live_showcase', 'installation', 'custom'],
    currentTasks: 3,
    maxTasks: 20,
    status: 'idle', // 正常
    estimatedStartText: '预计约1周后开始'
  },
  {
    id: 'vp_lihao',
    name: '李浩',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Mia&backgroundColor=dbe8ff',
    specialty: '实拍 / UGC / 剪辑',
    supportedTypeIds: ['live_showcase', 'ugc', 'editing'],
    currentTasks: 8,
    maxTasks: 20,
    status: 'normal',
    estimatedStartText: '预计约2周后开始'
  },
  {
    id: 'vp_wangmin',
    name: '王敏',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Leo&backgroundColor=ffd8cd',
    specialty: 'AI 展示 / UGC',
    supportedTypeIds: ['ai_showcase', 'ugc'],
    currentTasks: 14,
    maxTasks: 20,
    status: 'busy', // 较忙
    estimatedStartText: '预计约3周后开始'
  },
  {
    id: 'vp_chenkai',
    name: '陈凯',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Nina&backgroundColor=cfff20',
    specialty: '产品实拍 / 安装 / 剪辑',
    supportedTypeIds: ['live_showcase', 'installation', 'editing'],
    currentTasks: 18,
    maxTasks: 20,
    status: 'busy', // 较忙
    estimatedStartText: '预计约4周后开始'
  },
  {
    id: 'vp_zhouyu',
    name: '周宇',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Ray&backgroundColor=ffd8cd',
    specialty: 'UGC / 视频剪辑',
    supportedTypeIds: ['ugc', 'editing'],
    currentTasks: 20,
    maxTasks: 20,
    status: 'full',
    estimatedStartText: '暂不可接单'
  },
  {
    id: 'vp_zhaoqi',
    name: '赵琪',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Eve&backgroundColor=cfff20',
    specialty: '数码实拍 / UGC',
    supportedTypeIds: ['live_showcase', 'ugc'],
    currentTasks: 3,
    maxTasks: 20,
    status: 'idle', // 正常
    estimatedStartText: '预计约1周后开始'
  },
  {
    id: 'vp_liuwei',
    name: '刘伟',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Yu&backgroundColor=dbe8ff',
    specialty: 'AI 展示 / 安装',
    supportedTypeIds: ['ai_showcase', 'installation'],
    currentTasks: 11,
    maxTasks: 20,
    status: 'busy', // 较忙
    estimatedStartText: '预计约3周后开始'
  },
  {
    id: 'vp_sunyue',
    name: '孙悦',
    avatar: 'https://api.dicebear.com/10.x/notionists/svg?seed=Lin&backgroundColor=ffd8cd',
    specialty: 'AI 展示 / UGC / 混剪',
    supportedTypeIds: ['ai_showcase', 'ugc', 'editing'],
    currentTasks: 7,
    maxTasks: 20,
    status: 'normal',
    estimatedStartText: '预计约2周后开始'
  }
];

export const MOCK_PRODUCTS_DATABASE = PRODUCT_CATALOG;

export const INITIAL_MOCK_TASKS: TaskItem[] = [
  {
    id: 'task_101',
    taskNo: 'VTD-20260811-001',
    sku: 'HUAWEI123',
    productName: 'Huawei Outdoor Smart Canopy',
    productCategory: '户外家具 / 遮阳篷',
    productImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    videoTypeId: 'live_showcase',
    videoTypeName: '产品实拍展示视频',
    serviceId: 'live_showcase',
    serviceTierName: '标准服务',
    outputFormatName: '16:9 横版',
    basePrice: 200,
    videoPersonId: 'vp_zhangchen',
    videoPersonName: '张晨',
    isUrgent: false,
    videoRatio: '16:9',
    videoDuration: '<60s',
    needsPerson: true,
    sampleStatus: 'arrived',
    remarks: '重点拍摄电动伸缩与防水布料特写，需要清晨阳光自然质感。',
    mainStatus: 'in_progress',
    currentNode: 'shooting',
    currentNodeName: '拍摄阶段',
    createdAt: '2026-08-11 09:30',
    updatedAt: '2026-08-11 11:20',
    creatorName: '运营-刘敏',
    nodeData: {
      appointmentDate: '2026-08-12',
      shootingScene: '户外草坪阳光场景',
      mainCameraman: '张晨',
      assistCameraman: '李浩',
      shootDate: '2026-08-11',
      shootLocation: '1号大棚影棚',
      shootAssetUrl: 'https://pan.example.com/raw_footage_001.zip'
    },
    logs: [
      {
        id: 'log_01',
        timestamp: '2026-08-11 09:30',
        actor: '运营-刘敏',
        roleName: '运营人员',
        action: '创建视频需求',
        detail: '提交产品实拍展示视频需求，指派张晨'
      },
      {
        id: 'log_02',
        timestamp: '2026-08-11 10:15',
        actor: '张晨',
        roleName: '视频人员',
        action: '完成预约排期',
        detail: '确定拍摄日期为 2026-08-12'
      },
      {
        id: 'log_03',
        timestamp: '2026-08-11 11:20',
        actor: '张晨',
        roleName: '视频人员',
        action: '上传素材并推进到剪辑',
        detail: '原始素材已归档至盘'
      }
    ]
  },
  {
    id: 'task_102',
    taskNo: 'VTD-20260811-002',
    sku: 'TP10241PI',
    productName: '电子炉灶厨房玩具套装',
    productCategory: '儿童玩具 / 模拟厨房',
    productImage: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    videoTypeId: 'installation',
    videoTypeName: '产品安装视频',
    serviceId: 'installation',
    serviceTierName: '标准服务',
    outputFormatName: '16:9 横版',
    basePrice: 30,
    urgentApprovedPrice: 36,
    videoPersonId: 'vp_zhangchen',
    videoPersonName: '张晨',
    isUrgent: true,
    urgencyStatus: 'approved',
    targetDate: '2026-08-14',
    urgencyReason: '安装说明需要配合新品上架。',
    videoRatio: '16:9',
    videoDuration: '<60s',
    needsPerson: true,
    sampleStatus: 'arrived',
    remarks: '加急任务：客户反馈说明书不清，急需清晰拼接步骤短视频。',
    mainStatus: 'pending',
    currentNode: 'queued',
    currentNodeName: '待视频组确认',
    createdAt: '2026-08-11 10:00',
    updatedAt: '2026-08-11 10:30',
    creatorName: '运营-张强',
    nodeData: {},
    logs: [
      {
        id: 'log_10',
        timestamp: '2026-08-11 10:00',
        actor: '运营-张强',
        roleName: '运营人员',
        action: '创建加急需求',
        detail: '提交加急产品安装视频需求'
      },
      {
        id: 'log_11',
        timestamp: '2026-08-11 10:30',
        actor: '负责人-王总',
        roleName: '视频负责人',
        action: '审核通过加急',
        detail: '同意加急排期，调整优先处理'
      }
    ]
  },
  {
    id: 'task_103',
    taskNo: 'VTD-20260811-003',
    sku: 'SP38244US',
    productName: '城市折叠越野电动自行车',
    productCategory: '运动户外 / 电动出行',
    productImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
    videoTypeId: 'ugc',
    videoTypeName: '社媒 UGC 广告',
    serviceId: 'ugc',
    serviceTierName: '单条',
    outputFormatName: '9:16 竖版',
    videoPersonId: 'vp_wangmin',
    videoPersonName: '王敏',
    isUrgent: false,
    videoRatio: '9:16',
    videoDuration: '<30s',
    needsPerson: false,
    sampleStatus: 'on_way',
    remarks: '新车上市社媒素材，突出折叠效率与城市通勤场景。',
    basePrice: 50,
    urgentApprovedPrice: null,
    mainStatus: 'reviewing',
    currentNode: 'operator_review',
    currentNodeName: '运营终审中',
    createdAt: '2026-08-11 11:00',
    updatedAt: '2026-08-11 11:00',
    creatorName: '运营-赵雪',
    nodeData: {
      previewVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-riding-a-bicycle-on-a-road-41315-large.mp4',
      managerReviewNotes: '视频主管初审通过，等待运营确认成片。'
    },
    logs: [
      {
        id: 'log_20',
        timestamp: '2026-08-11 11:00',
        actor: '运营-赵雪',
        roleName: '运营人员',
        action: '创建视频需求',
        detail: '提交社媒 UGC 广告需求，指派王敏'
      },
      {
        id: 'log_21',
        timestamp: '2026-08-11 15:10',
        actor: '视频负责人',
        roleName: '视频负责人',
        action: '视频主管初审通过',
        detail: '制作人已推送运营终审'
      }
    ]
  }
];

export const INITIAL_TASKS = INITIAL_MOCK_TASKS;
