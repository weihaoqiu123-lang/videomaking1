import React from 'react';
import { RoleType, NavPage } from '../types';
import {
  Video,
  UserCheck,
  PenTool,
  ShieldCheck,
  Bell,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  pendingUrgentCount: number;
  pendingManagerReviewCount: number;
  pendingVideoCount: number;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentPage,
  onNavigate,
  pendingUrgentCount,
  pendingManagerReviewCount,
  pendingVideoCount,
  onResetData
}) => {
  const roles: { id: RoleType; name: string; icon: React.ReactNode; desc: string; badge?: number }[] = [
    {
      id: 'operator',
      name: '运营人员',
      icon: <Video className="w-4 h-4 text-blue-600" />,
      desc: '提交需求 & 订单进度追踪'
    },
    {
      id: 'video_creator',
      name: '视频人员',
      icon: <UserCheck className="w-4 h-4 text-cyan-600" />,
      desc: '确认接单、拍摄与剪辑执行',
      badge: pendingVideoCount
    },
    {
      id: 'manager',
      name: '视频负责人',
      icon: <ShieldCheck className="w-4 h-4 text-amber-600" />,
      desc: '加急审核与成片初审',
      badge: pendingUrgentCount + pendingManagerReviewCount
    }
  ];

  const handleRoleSwitch = (newRole: RoleType) => {
    onRoleChange(newRole);
    // Auto navigate to default first page of that role
    if (newRole === 'operator') onNavigate('portfolio');
    else if (newRole === 'video_creator') onNavigate('video_tasks');
    else if (newRole === 'manager') onNavigate('manager_approval');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dfe1e6] shadow-xs">
      {/* Top Banner / Title & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between min-h-16 py-2 gap-2 md:gap-4">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#0052cc] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Video className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#172b4d] tracking-tight">视频任务管理</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#deebff] text-[#0052cc] border border-[#b3d4ff]">
                  V1.0 Demo
                </span>
              </div>
              <p className="text-xs text-[#6b778c] hidden sm:block">企业内部视频需求提单与节点协作系统</p>
            </div>
          </div>

          {/* Role Switcher Bar */}
          <div className="order-3 md:order-none flex items-center gap-1.5 w-full md:w-auto max-w-full overflow-x-auto bg-[#f4f7fa] p-1 rounded-lg border border-[#dfe1e6]">
            {roles.map((r) => {
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleSwitch(r.id)}
                  className={`relative shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0052cc] text-white shadow-xs'
                      : 'text-[#6b778c] hover:text-[#172b4d] hover:bg-[#ebecf0]'
                  }`}
                >
                  {r.icon}
                  <span>{r.name}</span>
                  {r.badge !== undefined && r.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-[#0052cc]' : 'bg-[#de350b] text-white'
                    }`}>
                      {r.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetData}
              title="重置测试数据"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-[#6b778c] hover:text-[#172b4d] hover:bg-[#f4f7fa] border border-[#dfe1e6] transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">重置数据</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-[#dfe1e6]" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#6b778c] bg-[#f4f7fa] px-2.5 py-1 rounded-md border border-[#dfe1e6]">
              <span className="w-2 h-2 rounded-full bg-[#36b37e] animate-pulse" />
              <span className="font-semibold text-[#172b4d]">
                当前角色: {roles.find(r => r.id === currentRole)?.name}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
