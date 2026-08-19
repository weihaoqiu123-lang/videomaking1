import React, { useState } from 'react';
import { TaskItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { canOperatorCancel } from '../utils/taskUtils';
import {
  Search,
  Eye,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  X
} from 'lucide-react';

interface OperatorOrdersViewProps {
  tasks: TaskItem[];
  onSelectTaskDetail?: (task: TaskItem) => void;
  onCancelTask: (taskId: string, reason: string) => void;
  onOperatorReview: (taskId: string, approved: boolean, notes: string) => void;
}

export const OperatorOrdersView: React.FC<OperatorOrdersViewProps> = ({
  tasks,
  onCancelTask,
  onOperatorReview,
}) => {
  const [selectedMainStatus, setSelectedMainStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTaskForDrawer, setActiveTaskForDrawer] = useState<TaskItem | null>(null);
  const [previewingVideoUrl, setPreviewingVideoUrl] = useState<string | null>(null);
  const [returningTask, setReturningTask] = useState<TaskItem | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.mainStatus === 'pending').length;
  const inProgressCount = tasks.filter(t => t.mainStatus === 'in_progress').length;
  const reviewingCount = tasks.filter(t => t.mainStatus === 'reviewing').length;
  const completedCount = tasks.filter(t => t.mainStatus === 'completed').length;

  // Filtered Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      selectedMainStatus === 'all' || task.mainStatus === selectedMainStatus;
    const matchesQuery =
      task.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Page Title & Intro */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">我的视频订单</h2>
        <p className="text-sm text-slate-500">
          实时追踪您提交的所有视频需求进度、节点与执行状态。
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'all', label: '全部需求', count: totalCount, color: 'border-slate-300 text-slate-900 bg-white' },
          { key: 'pending', label: '排队中', count: pendingCount, color: 'border-slate-200 text-slate-700 bg-slate-50' },
          { key: 'in_progress', label: '制作中', count: inProgressCount, color: 'border-blue-200 text-blue-800 bg-blue-50/60' },
          { key: 'reviewing', label: '审核中', count: reviewingCount, color: 'border-amber-200 text-amber-800 bg-amber-50/60' },
          { key: 'completed', label: '已完成', count: completedCount, color: 'border-emerald-200 text-emerald-800 bg-emerald-50/60' }
        ].map((s) => {
          const isSelected = selectedMainStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setSelectedMainStatus(s.key)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer shadow-2xs ${s.color} ${
                isSelected ? 'ring-2 ring-blue-600 font-bold' : 'hover:border-slate-400'
              }`}
            >
              <span className="text-xs text-slate-500 block mb-1">{s.label}</span>
              <span className="text-2xl font-bold">{s.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索 SKU / 产品名称 / 任务单号..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">状态筛选:</span>
          <select
            value={selectedMainStatus}
            onChange={(e) => setSelectedMainStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
          >
            <option value="all">全部主状态</option>
            <option value="pending">排队中</option>
            <option value="in_progress">制作中</option>
            <option value="reviewing">审核中</option>
            <option value="completed">已完成</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">任务单号 / SKU</th>
                <th className="px-4 py-3.5">产品信息</th>
                <th className="px-4 py-3.5">视频类型 / 规格</th>
                <th className="px-4 py-3.5">视频人员</th>
                <th className="px-4 py-3.5">紧急度</th>
                <th className="px-4 py-3.5">主状态 / 当前节点</th>
                <th className="px-4 py-3.5">创建时间</th>
                <th className="px-4 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    暂无匹配的视频订单数据
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Task No / SKU */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-900 font-bold text-xs">{t.taskNo}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.sku}</div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={t.productImage}
                          alt={t.productName}
                          className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-semibold text-slate-900 line-clamp-1 max-w-[160px]" title={t.productName}>
                          {t.productName}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">{t.videoTypeName}</span>
                      <span className="text-[10px] text-slate-400 block">{t.serviceTierName || t.outputFormatName || '标准规格'}</span>
                    </td>

                    {/* Person */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {t.videoPersonName}
                    </td>

                    {/* Urgency */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {t.isUrgent && t.urgencyStatus === 'approved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                          <Zap className="w-3 h-3 text-rose-600 fill-rose-600" /> 加急已通过
                        </span>
                      ) : t.currentNode === 'pending_urgency' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-200 text-[11px]">
                          <Zap className="w-3 h-3 text-amber-600 animate-pulse" /> 待加急审核
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">普通</span>
                      )}
                    </td>

                    {/* Status & Node */}
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        mainStatus={t.mainStatus}
                        currentNode={t.currentNode}
                        isUrgent={t.isUrgent}
                        urgencyStatus={t.urgencyStatus}
                        size="sm"
                      />
                    </td>

                    {/* Create Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {t.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1.5">
                      {canOperatorCancel(t) && (
                        <button
                          onClick={() => {
                            if (window.confirm('确认删除这条尚未开始制作的视频需求？')) {
                              onCancelTask(t.id, '运营在视频组正式确认前取消需求');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> 删除需求
                        </button>
                      )}
                      {t.currentNode === 'operator_review' && (
                        <>
                          <button
                            onClick={() => setPreviewingVideoUrl(t.nodeData.previewVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-tent-in-a-forest-at-sunset-41270-large.mp4')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
                          >
                            <Play className="w-3.5 h-3.5" /> 查看成片
                          </button>
                          <button
                            onClick={() => { setReturningTask(t); setReturnReason(''); }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs"
                          >退回</button>
                          <button
                            onClick={() => onOperatorReview(t.id, true, '运营终审通过，成片确认交付。')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                          >终审通过</button>
                        </>
                      )}
                      <button
                        onClick={() => setActiveTaskForDrawer(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        查看详情
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Progress Timeline Drawer */}
      {activeTaskForDrawer && (
        <TaskDetailDrawer
          task={activeTaskForDrawer}
          onClose={() => setActiveTaskForDrawer(null)}
          currentRole="operator"
        />
      )}

      {returningTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="font-bold text-slate-900">运营终审退回</h3>
              <button onClick={() => setReturningTask(null)} aria-label="关闭"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">请填写退回原因，制作人修改后会重新经过主管初审并推送给你。</p>
              <textarea rows={4} value={returnReason} onChange={(event) => setReturnReason(event.target.value)} className="w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="填写需要修改的具体内容" />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button onClick={() => setReturningTask(null)} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600">取消</button>
              <button disabled={!returnReason.trim()} onClick={() => { onOperatorReview(returningTask.id, false, returnReason.trim()); setReturningTask(null); }} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">确认退回</button>
            </div>
          </div>
        </div>
      )}

      {previewingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onMouseDown={(event) => event.target === event.currentTarget && setPreviewingVideoUrl(null)}>
          <div className="relative w-full max-w-4xl aspect-video overflow-hidden rounded-xl bg-black">
            <button onClick={() => setPreviewingVideoUrl(null)} className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white" aria-label="关闭"><X className="w-5 h-5" /></button>
            <video controls autoPlay src={previewingVideoUrl} className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
