/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoleType, NavPage, TaskItem, NodeStage, VideoPersonnel } from './types';
import { INITIAL_TASKS, INITIAL_VIDEO_PERSONNEL, INITIAL_VIDEO_TYPES } from './data/mockData';
import { PortfolioItem } from './data/portfolioData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OrderCreateView } from './views/OrderCreateView';
import { OperatorOrdersView } from './views/OperatorOrdersView';
import { VideoTasksView } from './views/VideoTasksView';
import { ManagerApprovalView } from './views/ManagerApprovalView';
import { PortfolioView } from './components/PortfolioView';
import { buildUrgencySummary, getInitialNodeForService, getMainStatusFromNode, getNodeBadge } from './utils/taskUtils';
import type { ServiceId } from './data/serviceCatalog';

export const scrollPageToTop = (
  scrollTo: (options: ScrollToOptions) => void = (options) => window.scrollTo(options),
) => {
  scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

export { buildUrgencySummary };

export default function App() {
  const [currentRole, setCurrentRole] = useState<RoleType>('operator');
  const [currentPage, setCurrentPage] = useState<NavPage>('portfolio');

  // Portfolio State & Pre-selected Order Options
  const [referenceWork, setReferenceWork] = useState<PortfolioItem | null>(null);
  const [preselectedVideoTypeId, setPreselectedVideoTypeId] = useState<ServiceId | null>(null);
  const [portfolioFocusWorkId, setPortfolioFocusWorkId] = useState<string | null>(null);

  // Application State
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [videoPersonnel, setVideoPersonnel] = useState<VideoPersonnel[]>(INITIAL_VIDEO_PERSONNEL);
  const [videoTypes] = useState(INITIAL_VIDEO_TYPES);

  // Badge Counts
  const pendingUrgentCount = tasks.filter(t => t.currentNode === 'pending_urgency').length;
  const pendingManagerReviewCount = tasks.filter(t => t.currentNode === 'manager_review').length;
  const pendingVideoCount = tasks.filter(t => ['queued', 'shooting', 'editing', 'ready_for_operator_review', 'returned', 'revision'].includes(t.currentNode)).length;

  // Handle Role Switching
  const handleRoleChange = (role: RoleType) => {
    setCurrentRole(role);
    if (role === 'operator') setCurrentPage('portfolio');
    else if (role === 'video_creator') setCurrentPage('video_tasks');
    else if (role === 'manager') setCurrentPage('manager_approval');
  };

  // Task Creation Handler
  const handleCreateTask = (
    newTaskData: Omit<TaskItem, 'id' | 'taskNo' | 'createdAt' | 'updatedAt' | 'logs' | 'nodeData'>
  ) => {
    const taskCount = tasks.length + 1;
    const taskNo = `VT20260810${taskCount.toString().padStart(3, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newTask: TaskItem = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      taskNo,
      createdAt: nowStr,
      updatedAt: nowStr,
      nodeData: {},
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: nowStr,
          actor: newTaskData.creatorName,
          roleName: '运营人员',
          action: newTaskData.isUrgent ? '创建加急视频需求' : '创建标准视频需求',
          detail: newTaskData.isUrgent
            ? `申请加急，进入【待加急审核】队列`
            : `派发至视频制作人员 ${newTaskData.videoPersonName}`
        }
      ]
    };

    setTasks(prev => [newTask, ...prev]);

    // Update video person workload
    setVideoPersonnel(prev =>
      prev.map(p => {
        if (p.id === newTaskData.videoPersonId) {
          const newCurrent = p.currentTasks + 1;
          return {
            ...p,
            currentTasks: newCurrent,
            status: newCurrent >= p.maxTasks ? 'full' : newCurrent >= 11 ? 'busy' : newCurrent >= 6 ? 'normal' : 'idle'
          };
        }
        return p;
      })
    );
  };

  // Node Advancement Handler
  const handleUpdateTaskNode = (
    taskId: string,
    nextNode: NodeStage,
    updatedNodeData: any,
    logAction: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const newMainStatus = getMainStatusFromNode(nextNode);
          const newNodeName = getNodeBadge(nextNode).label;

          return {
            ...t,
            currentNode: nextNode,
            currentNodeName: newNodeName,
            mainStatus: newMainStatus,
            updatedAt: nowStr,
            nodeData: {
              ...t.nodeData,
              ...updatedNodeData
            },
            logs: [
              ...t.logs,
              {
                id: `log_${Date.now()}`,
                timestamp: nowStr,
                actor: t.videoPersonName,
                roleName: '视频人员',
                action: logAction,
                detail: `节点推至【${newNodeName}】`
              }
            ]
          };
        }
        return t;
      })
    );
  };

  // Urgent Approval Handler (Manager)
  const handleApproveUrgency = (taskId: string, approved: boolean) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            isUrgent: approved,
            urgencyStatus: approved ? 'approved' : 'rejected',
            currentNode: getInitialNodeForService(t.serviceId || t.videoTypeId, false),
            currentNodeName: '待视频组确认',
            mainStatus: getMainStatusFromNode(getInitialNodeForService(t.serviceId || t.videoTypeId, false)),
            updatedAt: nowStr,
            logs: [
              ...t.logs,
              {
                id: `log_${Date.now()}`,
                timestamp: nowStr,
                actor: '视频负责人',
                roleName: '视频负责人',
                action: approved ? '通过加急申请' : '未通过加急申请',
                detail: approved ? '同意加急，标记置顶优先级' : '不通过加急，转为普通单排队'
              }
            ]
          };
        }
        return t;
      })
    );
  };

  // Initial quality review handler (manager)
  const handleManagerReview = (taskId: string, approved: boolean, notes: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextNode: NodeStage = approved ? 'ready_for_operator_review' : 'revision';
          const nextNodeName = approved ? '待推送运营终审' : '主管退回修改';

          return {
            ...t,
            currentNode: nextNode,
            currentNodeName: nextNodeName,
            mainStatus: getMainStatusFromNode(nextNode),
            updatedAt: nowStr,
            nodeData: {
              ...t.nodeData,
              managerReviewNotes: notes
            },
            logs: [
              ...t.logs,
              {
                id: `log_${Date.now()}`,
                timestamp: nowStr,
                actor: '视频负责人',
                roleName: '视频负责人',
                action: approved ? '主管初审通过' : '主管初审退回修改',
                detail: notes
              }
            ]
          };
        }
        return t;
      })
    );
  };

  const handleCancelTask = (taskId: string, reason: string) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    setTasks(prev => prev.filter(item => item.id !== taskId));
    setVideoPersonnel(prev => prev.map(person => person.id !== task.videoPersonId ? person : {
      ...person,
      currentTasks: Math.max(0, person.currentTasks - 1),
    }));
    void reason;
  };

  const handleOperatorReview = (taskId: string, approved: boolean, notes: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextNode: NodeStage = approved ? 'finished' : 'returned';
      return {
        ...t,
        currentNode: nextNode,
        currentNodeName: approved ? '运营终审通过' : '运营终审退回',
        mainStatus: getMainStatusFromNode(nextNode),
        updatedAt: nowStr,
        nodeData: {
          ...t.nodeData,
          operatorReviewNotes: notes,
          returnReason: approved ? undefined : notes,
        },
        logs: [...t.logs, {
          id: `log_${Date.now()}`,
          timestamp: nowStr,
          actor: t.creatorName,
          roleName: '运营人员',
          action: approved ? '运营终审通过，任务完成' : '运营终审退回修改',
          detail: notes,
        }],
      };
    }));
    if (approved) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setVideoPersonnel(prev => prev.map(person => person.id !== task.videoPersonId ? person : {
          ...person,
          currentTasks: Math.max(0, person.currentTasks - 1),
        }));
      }
    }
  };

  // Select work or video type from Portfolio and transition to order flow
  const handleSelectWorkToOrder = (work?: PortfolioItem, videoTypeId?: ServiceId) => {
    if (work) {
      setReferenceWork(work);
      setPreselectedVideoTypeId(work.videoTypeId);
    } else if (videoTypeId) {
      setPreselectedVideoTypeId(videoTypeId);
    }
    setCurrentRole('operator');
    setCurrentPage('order_create');
    scrollPageToTop();
  };

  // Reset Mock Data
  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setVideoPersonnel(INITIAL_VIDEO_PERSONNEL);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingUrgentCount={pendingUrgentCount}
        pendingManagerReviewCount={pendingManagerReviewCount}
        pendingVideoCount={pendingVideoCount}
        onResetData={handleResetData}
      />

      {/* Role Context Navigation */}
      <Navigation
        currentRole={currentRole}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        pendingUrgentCount={pendingUrgentCount}
        pendingManagerReviewCount={pendingManagerReviewCount}
        pendingVideoCount={pendingVideoCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRole === 'operator' && currentPage === 'portfolio' && (
          <PortfolioView
            onNavigateToOrderCreate={(videoTypeId?: ServiceId) => handleSelectWorkToOrder(undefined, videoTypeId)}
            onSelectWorkToOrder={handleSelectWorkToOrder}
            focusWorkId={portfolioFocusWorkId}
            onFocusWorkConsumed={() => setPortfolioFocusWorkId(null)}
          />
        )}

        {currentRole === 'operator' && currentPage === 'order_create' && (
          <OrderCreateView
            videoTypes={videoTypes}
            videoPersonnel={videoPersonnel}
            onSubmitTask={handleCreateTask}
            onNavigateToOrders={() => setCurrentPage('operator_orders')}
            onOpenPortfolio={() => setCurrentPage('portfolio')}
            onOpenPortfolioWork={(workId) => {
              setPortfolioFocusWorkId(workId);
              setCurrentPage('portfolio');
            }}
            referenceWork={referenceWork}
            preselectedVideoTypeId={preselectedVideoTypeId}
            onClearReferenceWork={() => {
              setReferenceWork(null);
              setPreselectedVideoTypeId(null);
            }}
          />
        )}

        {currentRole === 'operator' && currentPage === 'operator_orders' && (
          <OperatorOrdersView
            tasks={tasks}
            onCancelTask={handleCancelTask}
            onOperatorReview={handleOperatorReview}
          />
        )}

        {currentRole === 'video_creator' && (
          <VideoTasksView
            tasks={tasks}
            currentStaffName="张晨"
            onUpdateTaskNode={handleUpdateTaskNode}
          />
        )}

        {currentRole === 'manager' && currentPage === 'manager_approval' && (
          <ManagerApprovalView
            tasks={tasks}
            onApproveUrgency={handleApproveUrgency}
            onManagerReview={handleManagerReview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>视频任务管理 V1.0 - 企业内部高保真原型</span>
          <span className="text-slate-500">支持运营、视频与负责人多角色全流程交互演示</span>
        </div>
      </footer>
    </div>
  );
}
