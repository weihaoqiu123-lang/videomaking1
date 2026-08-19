import type { FormatId, ServiceId, ServiceTierId } from './data/serviceCatalog';

export type RoleType = 'operator' | 'video_creator' | 'manager';

export type NavPage =
  | 'portfolio'
  | 'order_create'
  | 'operator_orders'
  | 'video_tasks'
  | 'manager_approval';

export type MainStatus = 'pending' | 'in_progress' | 'reviewing' | 'returned' | 'completed' | 'cancelled';

export type NodeStage =
  | 'pending_urgency'  // 待加急审核
  | 'queued'           // 待视频组确认
  | 'shooting'         // 拍摄阶段
  | 'editing'          // 剪辑阶段
  | 'manager_review'   // 视频主管初审
  | 'ready_for_operator_review' // 待制作人推送运营
  | 'operator_review'  // 运营终审
  | 'returned'         // 运营退回
  | 'revision'         // 修改中
  | 'finished'         // 完结
  | 'cancelled';       // 运营取消

export interface VideoType {
  id: ServiceId;
  num: string;
  name: string;
  shortDesc: string;
  needsShoot: boolean;
}

export interface VideoPersonnel {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  supportedTypeIds: ServiceId[];
  currentTasks: number; // 内部保留任务数量做逻辑计算，但不向运营展示具体数字
  maxTasks: number; // 20
  status: 'idle' | 'normal' | 'busy' | 'full'; // 兼容旧视图，展示状态以 currentTasks 实时计算为准
  estimatedStartText: string;
}

export interface VideoCaseSample {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  tags: string[];
}

export interface TaskLogItem {
  id: string;
  timestamp: string;
  actor: string;
  roleName: string;
  action: string;
  detail?: string;
}

export interface NodeData {
  appointmentDate?: string;
  shootingScene?: string;
  appointmentRemarks?: string;
  mainCameraman?: string;
  assistCameraman?: string;
  shootDate?: string;
  shootLocation?: string;
  shootAssetUrl?: string;
  shootRemarks?: string;
  editorName?: string;
  editingAssetUrl?: string;
  previewVideoUrl?: string;
  editingNotes?: string;
  managerReviewNotes?: string;
  operatorReviewNotes?: string;
  returnReason?: string;
  cancellationReason?: string;
}

export interface TaskItem {
  id: string;
  taskNo: string;
  sku: string;
  productName: string;
  productCategory: string;
  productImage: string;
  productLink?: string;
  videoTypeId: string;
  videoTypeName: string;
  serviceId?: ServiceId;
  intendedUses?: string[];
  serviceTierId?: ServiceTierId;
  serviceTierName?: string;
  outputFormatId?: FormatId;
  outputFormatName?: string;
  quantity?: number;
  basePrice?: number | null;
  urgentApprovedPrice?: number | null;
  serviceDetails?: Record<string, string | number | boolean | string[]>;
  videoPersonId: string;
  videoPersonName: string;
  isUrgent: boolean;
  urgencyStatus?: 'pending' | 'approved' | 'rejected';
  urgencyReason?: string;
  targetDate?: string;
  contentFocus?: string;
  
  // 视频制作要求
  videoRatio: '16:9' | '9:16';
  videoDuration: '<30s' | '<60s' | '<90s' | '自定义';
  needsPerson: boolean;
  sampleStatus: 'arrived' | 'on_way' | 'not_needed';
  remarks?: string;

  // 辅助外链
  refVideoUrl?: string;
  productAssetUrl?: string;

  // 状态流转
  mainStatus: MainStatus;
  currentNode: NodeStage;
  currentNodeName: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;

  // 节点操作记录
  nodeData: NodeData;
  logs: TaskLogItem[];
}
