import React from 'react';
import { TaskItem, RoleType } from '../types';
import { buildUrgencySummary, getNodeSteps, getNodeOrder } from '../utils/taskUtils';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Clock,
  FileText,
  Video,
  CheckCircle2,
  FileCode,
  Link,
  Zap,
  History
} from 'lucide-react';

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  onClose: () => void;
  currentRole: RoleType;
  onProcessTask?: (task: TaskItem) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  currentRole,
  onProcessTask
}) => {
  if (!task) return null;

  const serviceId = task.serviceId || task.videoTypeId;
  const steps = getNodeSteps(serviceId);
  const currentStepIdx = getNodeOrder(task.currentNode, serviceId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {task.taskNo}
                </span>
                <StatusBadge
                  mainStatus={task.mainStatus}
                  currentNode={task.currentNode}
                  isUrgent={task.isUrgent}
                  urgencyStatus={task.urgencyStatus}
                />
              </div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{task.productName}</span>
                <span className="text-xs text-slate-400 font-normal">({task.sku})</span>
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 divide-y divide-slate-100">
            
            {/* Context Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-500 block mb-0.5">视频类型</span>
                <span className="font-semibold text-slate-800">{task.videoTypeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">视频制作人员</span>
                <span className="font-semibold text-slate-800">{task.videoPersonName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">需求提交人</span>
                <span className="font-semibold text-slate-800">{task.creatorName}</span>
                <span className="text-[11px] text-slate-400 block">{task.createdAt}</span>
              </div>
            </div>

            {/* 1. 任务进度 Vertical Timeline */}
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>视频制作流程节点</span>
                </h3>
              </div>

              {/* Status Notice if Urgency pending */}
              {(task.currentNode === 'pending_urgency' || task.isUrgent) && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">{task.urgencyStatus === 'approved' ? '加急已通过' : '当前阶段：等待视频负责人加急审核'}</span>
                    <p className="whitespace-pre-line text-amber-700">{buildUrgencySummary(task.targetDate, task.urgencyReason) || '运营提交加急申请，等待负责人审批后进入队列。'}</p>
                  </div>
                </div>
              )}

              {/* Node Steps Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx || task.currentNode === 'finished';
                  const isCurrent = idx === currentStepIdx && task.currentNode !== 'finished';

                  return (
                    <div key={step.key} className="relative flex items-start gap-4 text-xs">
                      {/* Node Bullet Icon */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 rounded-lg p-3 border transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50/60 border-slate-200/70'
                          : 'bg-white border-slate-200/50 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isCurrent ? 'text-blue-900 text-sm' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-600">
                              {step.roleHint}
                            </span>
                          </div>
                          {isCurrent && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-600 text-white shadow-2xs">
                              当前执行节点
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              ✓ 已完成
                            </span>
                          )}
                        </div>

                        {/* Node Specific Details Preview */}
                        {step.key === 'shooting' && (task.nodeData.shootDate || isCurrent) && (
                          <div className="mt-2 text-slate-600 space-y-1 text-[11px] pt-1 border-t border-slate-200/60">
                            {task.nodeData.shootDate ? (
                              <p>拍摄时间: <span className="font-medium text-slate-800">{task.nodeData.shootDate}</span> (主拍: {task.nodeData.mainCameraman || task.videoPersonName})</p>
                            ) : (
                              <p className="text-blue-700">视频人员开展现场拍摄...</p>
                            )}
                          </div>
                        )}

                        {step.key === 'editing' && (task.nodeData.editingAssetUrl || isCurrent) && (
                          <div className="mt-2 text-slate-600 space-y-1 text-[11px] pt-1 border-t border-slate-200/60">
                            {task.nodeData.previewVideoUrl ? (
                              <div className="flex items-center gap-2 text-blue-600 font-medium">
                                <Video className="w-3.5 h-3.5" />
                                <span>预览视频已生成</span>
                              </div>
                            ) : (
                              <p className="text-cyan-700">视频人员进行剪辑与特效包装...</p>
                            )}
                          </div>
                        )}

                        {step.key === 'manager_review' && (task.nodeData.managerReviewNotes || isCurrent) && (
                          <div className="mt-2 text-slate-600 space-y-1 text-[11px] pt-1 border-t border-slate-200/60">
                            {task.nodeData.managerReviewNotes ? (
                              <p>初审意见: {task.nodeData.managerReviewNotes}</p>
                            ) : (
                              <p className="text-amber-700">等待视频主管初审...</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. 原始需求信息 (只读展示) */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>需求信息</span>
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">产品类目</span>
                    <p className="font-medium text-slate-800">{task.productCategory}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">视频规格</span>
                    <p className="font-medium text-slate-800">{task.videoRatio} | {task.videoDuration}</p>
                  </div>
                </div>

                {task.remarks && (
                  <div>
                    <span className="text-slate-500">需求描述 / 补充说明</span>
                    <p className="font-medium text-slate-800">{task.remarks}</p>
                  </div>
                )}

                {/* Links / Assets */}
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3">
                  {task.refVideoUrl && (
                    <a
                      href={task.refVideoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <Link className="w-3.5 h-3.5 text-blue-500" />
                      参考视频链接
                    </a>
                  )}
                  {task.productAssetUrl && (
                    <a
                      href={task.productAssetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                      产品素材/共享盘
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 任务动态 (Activity Logs) */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>任务操作动态 ({task.logs.length})</span>
              </h3>

              <div className="space-y-2">
                {task.logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.actor}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                          {log.roleName}
                        </span>
                        <span className="font-semibold text-blue-700">{log.action}</span>
                      </div>
                      {log.detail && (
                        <p className="text-slate-600 text-[11px]">{log.detail}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-mono">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              最近更新时间: {task.updatedAt}
            </span>
            <div className="flex items-center gap-2">
              {onProcessTask && task.currentNode !== 'finished' && (
                <button
                  onClick={() => {
                    onClose();
                    onProcessTask(task);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  去处理当前节点
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs rounded-lg transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
