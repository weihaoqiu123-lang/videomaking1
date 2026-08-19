import React, { useState } from 'react';
import { TaskItem, NodeStage } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import {
  Zap,
  X,
  Eye,
  Clock,
  CheckCircle2,
  GripVertical,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import { getProductionStartNode, orderVideoTasks, reorderVideoTasks } from '../utils/taskUtils';

interface VideoTasksViewProps {
  tasks: TaskItem[];
  currentStaffName: string;
  onUpdateTaskNode: (taskId: string, nextNode: NodeStage, updatedNodeData: any, logAction: string) => void;
}

export const VideoTasksView: React.FC<VideoTasksViewProps> = ({
  tasks,
  currentStaffName = '张晨',
  onUpdateTaskNode
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'reviewing' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingTask, setProcessingTask] = useState<TaskItem | null>(null);
  const [activeDrawerTask, setActiveDrawerTask] = useState<TaskItem | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [manualOrderByTab, setManualOrderByTab] = useState<Record<string, string[]>>({});
  const [orderNotice, setOrderNotice] = useState('');

  // Form State for Node Execution
  const [appointmentDate, setAppointmentDate] = useState('2026-08-13 10:00');
  const [shootingScene, setShootingScene] = useState('A栋3楼 摄影棚2号大容积场景');
  const [appointmentRemarks, setAppointmentRemarks] = useState('已确认样品完好到达，预约大件影棚场地');

  const [mainCameraman, setMainCameraman] = useState(currentStaffName);
  const [assistCameraman, setAssistCameraman] = useState('小李');
  const [shootDate, setShootDate] = useState('2026-08-13 14:00');
  const [shootLocation, setShootLocation] = useState('摄影棚A区 + 户外场景');
  const [shootAssetUrl, setShootAssetUrl] = useState('https://nas.company.com/raw_footage/SP38244US.zip');
  const [shootRemarks, setShootRemarks] = useState('主轮特写与折叠扣加光完成，素材已同步NAS。');

  const [editorName, setEditorName] = useState(currentStaffName);
  const [editingAssetUrl, setEditingAssetUrl] = useState('https://nas.company.com/projects/SP38244US.pr');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-man-riding-a-bicycle-on-a-road-41315-large.mp4');
  const [editingNotes, setEditingNotes] = useState('一审成片已完成剪辑、调色与卡点音效。');

  const staffTasks = tasks.filter(t => t.videoPersonName.includes(currentStaffName) || true);

  const filteredStaffTasks = staffTasks.filter(t =>
    t.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTasks = filteredStaffTasks.filter(t => t.currentNode === 'queued' || t.currentNode === 'pending_urgency');
  const inProgressTasks = filteredStaffTasks.filter(t => ['shooting', 'editing', 'returned', 'revision'].includes(t.currentNode));
  const reviewingTasks = filteredStaffTasks.filter(t => ['manager_review', 'ready_for_operator_review', 'operator_review'].includes(t.currentNode));
  const completedTasks = filteredStaffTasks.filter(t => t.currentNode === 'finished' || t.currentNode === 'cancelled');

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending':
        return staffTasks.filter(t => t.currentNode === 'queued' || t.currentNode === 'pending_urgency').length;
      case 'in_progress':
        return staffTasks.filter(t => ['shooting', 'editing', 'returned', 'revision'].includes(t.currentNode)).length;
      case 'reviewing':
        return staffTasks.filter(t => ['manager_review', 'ready_for_operator_review', 'operator_review'].includes(t.currentNode)).length;
      case 'completed':
        return staffTasks.filter(t => t.currentNode === 'finished' || t.currentNode === 'cancelled').length;
      default: return 0;
    }
  };

  const currentRawTasks =
    activeTab === 'pending'
      ? pendingTasks
      : activeTab === 'in_progress'
      ? inProgressTasks
      : activeTab === 'reviewing'
      ? reviewingTasks
      : completedTasks;

  const sortedTasks = orderVideoTasks<TaskItem>(currentRawTasks, manualOrderByTab[activeTab]);

  const handleTaskDrop = (targetTaskId: string) => {
    if (!draggedTaskId) return;

    const source = sortedTasks.find((task) => task.id === draggedTaskId);
    const target = sortedTasks.find((task) => task.id === targetTaskId);
    if (!source || !target) return;

    if (source.isUrgent !== target.isUrgent) {
      setOrderNotice('加急任务和普通任务只能在各自区域内调整。');
      setDraggedTaskId(null);
      return;
    }

    const reordered = reorderVideoTasks<TaskItem>(sortedTasks, draggedTaskId, targetTaskId);
    setManualOrderByTab((current) => ({
      ...current,
      [activeTab]: reordered.map((task) => task.id),
    }));
    setOrderNotice('任务顺序已更新');
    setDraggedTaskId(null);
  };

  // Node Completion Handler
  const handleCompleteCurrentNode = (task: TaskItem) => {
    if (task.currentNode === 'queued') {
      const nextNode = getProductionStartNode(task.serviceId || task.videoTypeId);
      onUpdateTaskNode(
        task.id,
        nextNode,
        {
          appointmentDate,
          shootingScene,
          appointmentRemarks
        },
        nextNode === 'editing' ? '确认接单，直接进入剪辑' : '确认接单，进入拍摄阶段'
      );
    } else if (task.currentNode === 'shooting') {
      onUpdateTaskNode(
        task.id,
        'editing',
        {
          mainCameraman,
          assistCameraman,
          shootDate,
          shootLocation,
          shootAssetUrl,
          shootRemarks
        },
        '完成现场拍摄，素材已上云'
      );
    } else if (task.currentNode === 'editing' || task.currentNode === 'revision') {
      onUpdateTaskNode(
        task.id,
        'manager_review',
        {
          editorName,
          editingAssetUrl,
          previewVideoUrl,
          editingNotes
        },
        '完成剪辑，提交视频主管初审'
      );
    } else if (task.currentNode === 'ready_for_operator_review') {
      onUpdateTaskNode(task.id, 'operator_review', {}, '推送成片给运营终审');
    } else if (task.currentNode === 'returned') {
      onUpdateTaskNode(task.id, 'revision', {}, '查看运营退回原因，开始修改');
    }
    setProcessingTask(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Page Header & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">视频人员待办</h2>
          <p className="text-sm text-slate-500">
            当前制作人员: <span className="font-bold text-slate-900">{currentStaffName}</span>
          </p>
        </div>

        {/* Top Tabs / Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'pending', label: '待处理' },
            { id: 'in_progress', label: '制作与修改中' },
            { id: 'reviewing', label: '审核与待推送' },
            { id: 'completed', label: '已完结任务' }
          ].map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
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

      {/* Notice Bar for Priority Rule & Search */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-medium">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
          默认加急优先、同级按时间正序；拖动任务行左侧手柄可在同一优先级内调整。
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

      {orderNotice && (
        <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${orderNotice === '任务顺序已更新' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          {orderNotice}
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">优先级</th>
                <th className="px-4 py-3.5">任务单号 / SKU</th>
                <th className="px-4 py-3.5">产品信息</th>
                <th className="px-4 py-3.5">视频类型 / 规格</th>
                <th className="px-4 py-3.5">当前节点</th>
                <th className="px-4 py-3.5">提单时间</th>
                <th className="px-4 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    该分类下暂无匹配的视频任务
                  </td>
                </tr>
              ) : (
                sortedTasks.map((t, idx) => (
                  <tr
                    key={t.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleTaskDrop(t.id)}
                    className={`hover:bg-slate-50/80 transition-colors ${t.isUrgent ? 'bg-rose-50/30' : ''} ${draggedTaskId === t.id ? 'opacity-50' : ''}`}
                  >
                    
                    {/* Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          draggable
                          onDragStart={() => { setDraggedTaskId(t.id); setOrderNotice(''); }}
                          onDragEnd={() => setDraggedTaskId(null)}
                          aria-label={`拖动调整 ${t.taskNo} 的顺序`}
                          title="拖动调整同级任务顺序"
                          className="cursor-grab rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        {t.isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200 text-[11px]">
                            <Zap className="w-3 h-3 text-rose-600 fill-rose-600" /> 加急置顶
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">P{idx + 1}</span>
                        )}
                      </div>
                    </td>

                    {/* Task No / SKU */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-900 font-bold text-xs">{t.taskNo}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.sku}</div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={t.productImage} alt={t.productName} className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1 max-w-[160px]">{t.productName}</p>
                          <span className="text-[10px] text-slate-400">{t.productCategory}</span>
                        </div>
                      </div>
                    </td>

                    {/* Video Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">{t.videoTypeName}</span>
                      <span className="text-[10px] text-slate-400 block">{t.serviceTierName || t.outputFormatName || '标准规格'}</span>
                    </td>

                    {/* Node */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        mainStatus={t.mainStatus}
                        currentNode={t.currentNode}
                        isUrgent={t.isUrgent}
                        urgencyStatus={t.urgencyStatus}
                        size="sm"
                      />
                    </td>

                    {/* Created Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                      {t.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => setActiveDrawerTask(t)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        详情
                      </button>

                      {['queued', 'shooting', 'editing', 'ready_for_operator_review', 'returned', 'revision'].includes(t.currentNode) && (
                        <button
                          onClick={() => setProcessingTask(t)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          处理此节点
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NODE ACTION MODAL */}
      {processingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-blue-400">
                  当前节点操作: {processingTask.currentNodeName}
                </span>
                <h3 className="text-base font-bold text-white">
                  {processingTask.productName} ({processingTask.sku})
                </h3>
              </div>
              <button
                onClick={() => setProcessingTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Context bar */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 space-y-1">
                <p><span className="text-slate-500">制作要求:</span> {processingTask.remarks || '无'}</p>
              </div>

              {/* Node 1: 制作人确认接单 */}
              {processingTask.currentNode === 'queued' && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">确认接单</h4>
                  <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800">确认后，实拍、安装与专项任务进入拍摄；AI、UGC 和纯剪辑任务直接进入剪辑。</p>
                </div>
              )}

              {/* Node 2: 拍摄 */}
              {processingTask.currentNode === 'shooting' && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">【完成拍摄】表单填写</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">主拍摄人员</label>
                      <input
                        type="text"
                        value={mainCameraman}
                        onChange={(e) => setMainCameraman(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">辅助人员</label>
                      <input
                        type="text"
                        value={assistCameraman}
                        onChange={(e) => setAssistCameraman(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">拍摄素材地址 / NAS路径 *</label>
                    <input
                      type="text"
                      value={shootAssetUrl}
                      onChange={(e) => setShootAssetUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {/* Node 3: 剪辑 */}
              {(processingTask.currentNode === 'editing' || processingTask.currentNode === 'revision') && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-bold text-slate-900 text-sm">【提交剪辑成片】表单填写</h4>
                  {processingTask.currentNode === 'revision' && processingTask.nodeData.returnReason && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">运营退回原因：{processingTask.nodeData.returnReason}</p>}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">剪辑负责人员</label>
                    <input
                      type="text"
                      value={editorName}
                      onChange={(e) => setEditorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">成片预览视频地址 *</label>
                    <input
                      type="text"
                      value={previewVideoUrl}
                      onChange={(e) => setPreviewVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">剪辑说明 / 审片提示</label>
                    <textarea
                      rows={2}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {processingTask.currentNode === 'ready_for_operator_review' && (
                <div className="space-y-3 pt-2"><h4 className="font-bold text-slate-900 text-sm">推送运营终审</h4><p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">主管初审已通过。确认后，运营人员会收到成片终审请求。</p></div>
              )}

              {processingTask.currentNode === 'returned' && (
                <div className="space-y-3 pt-2"><h4 className="font-bold text-slate-900 text-sm">运营已退回</h4><p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">退回原因：{processingTask.nodeData.returnReason || '运营未填写具体原因'}</p><p>确认后任务进入“修改中”，修改完成后需再次提交主管初审。</p></div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setProcessingTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleCompleteCurrentNode(processingTask)}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                确认完成该节点并推进
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Task Drawer */}
      {activeDrawerTask && (
        <TaskDetailDrawer
          task={activeDrawerTask}
          onClose={() => setActiveDrawerTask(null)}
          currentRole="video_creator"
          onProcessTask={(t) => setProcessingTask(t)}
        />
      )}
    </div>
  );
};
