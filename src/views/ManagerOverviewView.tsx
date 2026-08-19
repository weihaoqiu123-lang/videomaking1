import React, { useState } from 'react';
import { TaskItem, VideoPersonnel, VideoType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Users,
  LayoutDashboard,
  Zap,
  BarChart2,
  ListFilter
} from 'lucide-react';

interface ManagerOverviewViewProps {
  tasks: TaskItem[];
  videoPersonnel: VideoPersonnel[];
  videoTypes: VideoType[];
}

export const ManagerOverviewView: React.FC<ManagerOverviewViewProps> = ({
  tasks,
  videoPersonnel,
  videoTypes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedPersonFilter, setSelectedPersonFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedUrgentFilter, setSelectedUrgentFilter] = useState('all');

  const [activeDrawerTask, setActiveDrawerTask] = useState<TaskItem | null>(null);

  // Statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.mainStatus === 'pending').length;
  const inProgressCount = tasks.filter(t => t.mainStatus === 'in_progress').length;
  const reviewingCount = tasks.filter(t => t.mainStatus === 'reviewing').length;
  const urgentCount = tasks.filter(t => t.isUrgent || t.urgencyStatus === 'pending_approval').length;
  const completedCount = tasks.filter(t => t.mainStatus === 'completed').length;

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesQuery =
      t.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'all' || t.videoTypeId === selectedTypeFilter;
    const matchesPerson = selectedPersonFilter === 'all' || t.videoPersonId === selectedPersonFilter;
    const matchesStatus = selectedStatusFilter === 'all' || t.mainStatus === selectedStatusFilter;
    const matchesUrgent =
      selectedUrgentFilter === 'all'
        ? true
        : selectedUrgentFilter === 'urgent'
        ? t.isUrgent || t.urgencyStatus === 'pending_approval'
        : !t.isUrgent;

    return matchesQuery && matchesType && matchesPerson && matchesStatus && matchesUrgent;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">视频任务总览与监控</h2>
        <p className="text-sm text-slate-500">
          全组任务运行监控大盘，掌握团队人员负载与全部节点流转状态。
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
        {[
          { label: '全部任务', count: totalCount, bg: 'bg-white border-slate-200 text-slate-900' },
          { label: '排队中', count: pendingCount, bg: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: '制作中', count: inProgressCount, bg: 'bg-blue-50 border-blue-200 text-blue-900' },
          { label: '审核中', count: reviewingCount, bg: 'bg-amber-50 border-amber-200 text-amber-900' },
          { label: '加急任务', count: urgentCount, bg: 'bg-rose-50 border-rose-200 text-rose-900' },
          { label: '完结交货', count: completedCount, bg: 'bg-emerald-50 border-emerald-200 text-emerald-900' }
        ].map((s, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${s.bg} shadow-2xs`}>
            <span className="text-slate-500 block mb-1 font-medium">{s.label}</span>
            <span className="text-2xl font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Team Workload Card Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-600" />
            <span>视频团队人员实时负载情况</span>
          </h3>
          <span className="text-[11px] text-slate-500">上限: 5个/人</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {videoPersonnel.map((vp) => {
            const currentTasksCount = tasks.filter(
              t => t.videoPersonId === vp.id && t.mainStatus !== 'completed'
            ).length;
            const percentage = Math.min(100, Math.round((currentTasksCount / vp.maxTasks) * 100));
            const isFull = currentTasksCount >= vp.maxTasks;

            return (
              <div key={vp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={vp.avatar} alt={vp.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-bold text-slate-900">{vp.name}</span>
                  </div>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    isFull ? 'bg-rose-100 text-rose-800' : currentTasksCount >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentTasksCount} / {vp.maxTasks} {isFull ? '(满额)' : ''}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFull ? 'bg-rose-600' : currentTasksCount >= 3 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          
          {/* Keyword search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索 SKU / 关键词 / 运营提交人 / 任务单号..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">全部视频类型</option>
              {videoTypes.map(vt => (
                <option key={vt.id} value={vt.id}>{vt.name}</option>
              ))}
            </select>
          </div>

          {/* Staff Filter */}
          <div>
            <select
              value={selectedPersonFilter}
              onChange={(e) => setSelectedPersonFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">全部制作人员</option>
              {videoPersonnel.map(vp => (
                <option key={vp.id} value={vp.id}>{vp.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">全部主状态</option>
              <option value="pending">排队中</option>
              <option value="in_progress">制作中</option>
              <option value="reviewing">审核中</option>
              <option value="completed">完结</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">任务单号 / SKU</th>
                <th className="px-4 py-3.5">产品名称</th>
                <th className="px-4 py-3.5">视频类型</th>
                <th className="px-4 py-3.5">提交运营</th>
                <th className="px-4 py-3.5">视频人员</th>
                <th className="px-4 py-3.5">期望节点</th>
                <th className="px-4 py-3.5">主状态 / 当前节点</th>
                <th className="px-4 py-3.5">文案状态</th>
                <th className="px-4 py-3.5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    未查找到符合筛选条件的视频任务
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{t.taskNo}</div>
                      <div className="font-mono text-[11px] text-slate-500">{t.sku}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-[140px]">{t.productName}</div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {t.videoTypeName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {t.creatorName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {t.videoPersonName}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-blue-700">
                      {t.targetDate}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        mainStatus={t.mainStatus}
                        currentNode={t.currentNode}
                        needsCopy={t.needsCopy}
                        isUrgent={t.isUrgent}
                        urgencyStatus={t.urgencyStatus}
                        size="sm"
                      />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-[11px]">
                      {t.needsCopy ? (
                        t.nodeData.copyContent ? (
                          <span className="text-emerald-700 font-semibold">✓ 已完成</span>
                        ) : (
                          <span className="text-indigo-600 font-medium">文案准备中</span>
                        )
                      ) : (
                        <span className="text-slate-400">无需文案</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveDrawerTask(t)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        跟踪详情
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
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
