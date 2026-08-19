import React from 'react';
import { MainStatus, NodeStage } from '../types';
import { getMainStatusBadge, getNodeBadge } from '../utils/taskUtils';
import { Zap } from 'lucide-react';

interface StatusBadgeProps {
  mainStatus?: MainStatus;
  currentNode?: NodeStage;
  isUrgent?: boolean;
  urgencyStatus?: 'none' | 'pending' | 'pending_approval' | 'approved' | 'rejected';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  mainStatus,
  currentNode,
  isUrgent = false,
  urgencyStatus = 'none',
  size = 'md'
}) => {
  const py = size === 'sm' ? 'py-0.5 px-2 text-xs' : 'py-1 px-2.5 text-xs font-medium';

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      {/* 紧急度标签 */}
      {(urgencyStatus === 'pending' || urgencyStatus === 'pending_approval') && (
        <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${py}`}>
          <Zap className="w-3 h-3 text-amber-600 animate-pulse" />
          加急审核中
        </span>
      )}
      {isUrgent && urgencyStatus === 'approved' && (
        <span className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold ${py}`}>
          <Zap className="w-3 h-3 text-rose-600 fill-rose-600" />
          加急已通过
        </span>
      )}

      {/* 主状态 */}
      {mainStatus && (
        <span className={`inline-flex items-center rounded-md border ${getMainStatusBadge(mainStatus).bg} ${py}`}>
          {getMainStatusBadge(mainStatus).label}
        </span>
      )}

      {/* 当前节点 */}
      {currentNode && (
        <span className={`inline-flex items-center rounded-md border ${getNodeBadge(currentNode).bg} ${py}`}>
          {getNodeBadge(currentNode).label}
        </span>
      )}
    </div>
  );
};
