import React, { useState } from 'react';
import { TaskItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { buildUrgencySummary, getEffectiveTaskAmount } from '../utils/taskUtils';
import {
  Zap,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Play,
  Search,
  SlidersHorizontal
} from 'lucide-react';

interface ManagerApprovalViewProps {
  tasks: TaskItem[];
  onApproveUrgency: (taskId: string, approved: boolean) => void;
  onManagerReview: (taskId: string, approved: boolean, notes: string) => void;
}

export const ManagerApprovalView: React.FC<ManagerApprovalViewProps> = ({
  tasks,
  onApproveUrgency,
  onManagerReview
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'urgency' | 'final' | 'handled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerTask, setActiveDrawerTask] = useState<TaskItem | null>(null);

  // Rejection/Approval modal
  const [rejectingTask, setRejectingTask] = useState<TaskItem | null>(null);
  const [rejectNotes, setRejectNotes] = useState('成片开头3秒转场过慢，请重新调整背景BGM卡点并修正字幕对齐。');

  // Preview Video Modal
  const [previewingVideoUrl, setPreviewingVideoUrl] = useState<string | null>(null);

  // Search filter
  const filteredTasks = tasks.filter(t =>
    t.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categorized tasks
  const urgentTasks = filteredTasks.filter(t => t.currentNode === 'pending_urgency');
  const finalReviewTasks = filteredTasks.filter(t => t.currentNode === 'manager_review');
  const handledTasks = filteredTasks.filter(t => t.currentNode !== 'pending_urgency' && t.currentNode !== 'manager_review');

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'all': return tasks.length;
      case 'urgency': return tasks.filter(t => t.currentNode === 'pending_urgency').length;
      case 'final': return tasks.filter(t => t.currentNode === 'manager_review').length;
      case 'handled': return tasks.filter(t => t.currentNode !== 'pending_urgency' && t.currentNode !== 'manager_review').length;
      default: return 0;
    }
  };

  const displayTasks =
    activeTab === 'urgency'
      ? urgentTasks
      : activeTab === 'final'
      ? finalReviewTasks
      : activeTab === 'handled'
      ? handledTasks
      : filteredTasks;

  const handleConfirmFinalReject = () => {
    if (!rejectingTask) return;
    onManagerReview(rejectingTask.id, false, rejectNotes);
    setRejectingTask(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Title & Top Tabs Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">视频负责人待办审核</h2>
          <p className="text-sm text-slate-500">
            处理加急申请并完成成片初审；运营终审通过后任务才会正式完成。
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'all', label: '全部' },
            { id: 'urgency', label: '加急审核' },
            { id: 'final', label: '主管初审' },
            { id: 'handled', label: '已处理' }
          ].map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-50/90 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar with Search */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-medium">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
          快捷提示：加急申请需优先审批，通过后进入紧急制作队列。
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 SKU / 单号 / 产品"
            className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">任务单号 / SKU</th>
                <th className="px-4 py-3.5">产品信息</th>
                <th className="px-4 py-3.5">视频人员</th>
                <th className="px-4 py-3.5">任务金额</th>
                <th className="px-4 py-3.5">当前节点 / 状态</th>
                <th className="px-4 py-3.5">加急说明 / 成片预览</th>
                <th className="px-4 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    该筛选条件下暂无任务记录
                  </td>
                </tr>
              ) : (
                displayTasks.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${t.isUrgent ? 'bg-rose-50/20' : ''}`}>
                    
                    {/* Task No / SKU */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{t.taskNo}</div>
                      <div className="font-mono text-[11px] text-slate-500">{t.sku}</div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 line-clamp-1">{t.productName}</div>
                      <span className="text-[10px] text-slate-400">{t.videoTypeName}</span>
                    </td>

                    {/* Video Personnel */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {t.videoPersonName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-900">
                      {getEffectiveTaskAmount(t) === null ? '确认后报价' : `${getEffectiveTaskAmount(t)} USD`}
                    </td>

                    {/* Current Node */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        mainStatus={t.mainStatus}
                        currentNode={t.currentNode}
                        isUrgent={t.isUrgent}
                        urgencyStatus={t.urgencyStatus}
                        size="sm"
                      />
                    </td>

                    {/* Content / Video Preview */}
                    <td className="px-4 py-3.5">
                      {t.currentNode === 'pending_urgency' ? (
                        <p className="text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 text-[11px] line-clamp-2 font-medium">
                          {buildUrgencySummary(t.targetDate, t.urgencyReason) || '申请加急处理排期。'}
                        </p>
                      ) : t.nodeData?.previewVideoUrl || t.currentNode === 'manager_review' || t.currentNode === 'finished' ? (
                        <button
                          onClick={() => setPreviewingVideoUrl(t.nodeData?.previewVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-tent-in-a-forest-at-sunset-41270-large.mp4')}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-mono text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>播放成片</span>
                        </button>
                      ) : (
                        <p className="text-slate-500 text-[11px] line-clamp-1">{t.remarks || '标准制作流程中'}</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setActiveDrawerTask(t)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        详情
                      </button>

                      {/* Action buttons based on current node */}
                      {t.currentNode === 'pending_urgency' && (
                        <>
                          <button
                            onClick={() => onApproveUrgency(t.id, false)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            拒绝加急
                          </button>
                          <button
                            onClick={() => onApproveUrgency(t.id, true)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            同意加急
                          </button>
                        </>
                      )}

                      {t.currentNode === 'manager_review' && (
                        <>
                          <button
                            onClick={() => setRejectingTask(t)}
                            className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
                          >
                            退回修改
                          </button>
                          <button
                            onClick={() => onManagerReview(t.id, true, '主管初审通过，可以推送运营终审。')}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            初审通过
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="text-base font-bold">初审退回修改 - {rejectingTask.sku}</h3>
              <button onClick={() => setRejectingTask(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">请详细填写退回原因及具体需要修正的镜头或细节：</p>
              <textarea
                rows={4}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button onClick={() => setRejectingTask(null)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer">
                取消
              </button>
              <button onClick={handleConfirmFinalReject} className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs cursor-pointer">
                确认退回至剪辑节点
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {previewingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewingVideoUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/80 text-white hover:bg-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            >
              ✕
            </button>
            <video
              controls
              autoPlay
              src={previewingVideoUrl}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Drawer */}
      {activeDrawerTask && (
        <TaskDetailDrawer
          task={activeDrawerTask}
          onClose={() => setActiveDrawerTask(null)}
          currentRole="manager"
        />
      )}
    </div>
  );
};
