import React from 'react';
import { RoleType, NavPage } from '../types';
import {
  PlusCircle,
  ListOrdered,
  CheckSquare,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NavigationProps {
  currentRole: RoleType;
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  pendingUrgentCount: number;
  pendingManagerReviewCount: number;
  pendingVideoCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRole,
  currentPage,
  onNavigate,
  pendingUrgentCount,
  pendingManagerReviewCount,
  pendingVideoCount
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'operator':
        return [
          {
            id: 'portfolio' as NavPage,
            label: '作品集',
            icon: <Sparkles className="w-4 h-4 text-amber-300" />,
            badge: undefined
          },
          {
            id: 'order_create' as NavPage,
            label: '创建视频需求',
            icon: <PlusCircle className="w-4 h-4" />,
            badge: undefined
          },
          {
            id: 'operator_orders' as NavPage,
            label: '我的视频订单',
            icon: <ListOrdered className="w-4 h-4" />,
            badge: undefined
          }
        ];
      case 'video_creator':
        return [
          {
            id: 'video_tasks' as NavPage,
            label: '我的视频任务待办',
            icon: <CheckSquare className="w-4 h-4" />,
            badge: pendingVideoCount
          }
        ];
      case 'manager':
        return [
          {
            id: 'manager_approval' as NavPage,
            label: '待办审核（加急 / 初审）',
            icon: <ShieldAlert className="w-4 h-4" />,
            badge: pendingUrgentCount + pendingManagerReviewCount
          }
        ];
    }
  };

  const items = getNavItems();

  return (
    <nav className="bg-[#0747a6] text-white/80 border-b border-[#0052cc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {items.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0052cc] shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#de350b] text-white' : 'bg-[#de350b] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
