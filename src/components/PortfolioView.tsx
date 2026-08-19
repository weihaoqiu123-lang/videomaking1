import React, { useEffect } from 'react';
import { ExternalLink, Film, FolderOpen, PlusCircle, Users } from 'lucide-react';
import type { ServiceId } from '../data/serviceCatalog';
import { getServiceById } from '../data/serviceCatalog';
import {
  findPortfolioWork,
  portfolioGroups,
  portfolioMembers,
  portfolioSections,
  type PortfolioItem,
} from '../data/portfolioData';

interface PortfolioViewProps {
  onNavigateToOrderCreate: (videoTypeId?: ServiceId) => void;
  onSelectWorkToOrder?: (work?: PortfolioItem, videoTypeId?: ServiceId) => void;
  focusWorkId?: string | null;
  onFocusWorkConsumed?: () => void;
}

const openWork = (videoUrl?: string) => {
  if (videoUrl && typeof window !== 'undefined') {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  }
};

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onNavigateToOrderCreate,
  focusWorkId,
  onFocusWorkConsumed,
}) => {
  useEffect(() => {
    if (!focusWorkId) return;
    openWork(findPortfolioWork(focusWorkId)?.videoUrl);
    onFocusWorkConsumed?.();
  }, [focusWorkId, onFocusWorkConsumed]);

  return (
    <div className="min-h-full bg-[#f4f5f7] py-7">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
        <header className="border border-[#dfe1e6] bg-white px-6 py-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold text-[#0052cc]">视频服务 / 作品集</p>
              <h1 className="text-2xl font-bold text-[#172b4d]">HOOYA 视频制作服务</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5e6c84]">
                按业务用途查看视频服务和代表作品。作品与成员链接会在新窗口打开，确认方向后可创建视频需求。
              </p>
            </div>
            <button type="button" onClick={() => onNavigateToOrderCreate()} className="inline-flex items-center gap-2 bg-[#0052cc] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0747a6]">
              <PlusCircle className="h-4 w-4" /> 创建视频需求
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          {portfolioGroups.map((group, index) => (
            <a key={group.id} href={`#group-${group.id}`} className="border border-[#dfe1e6] bg-white p-4 hover:border-[#4c9aff]">
              <span className="text-xs font-bold text-[#6b778c]">0{index + 1}</span>
              <strong className="mt-2 block text-base text-[#172b4d]">{group.title}</strong>
              <span className="mt-1 block text-xs leading-5 text-[#6b778c]">{group.description}</span>
            </a>
          ))}
        </div>

        {portfolioGroups.map((group) => (
          <section key={group.id} id={`group-${group.id}`} className="border border-[#dfe1e6] bg-white shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#dfe1e6] bg-[#fafbfc] px-5 py-4">
              <FolderOpen className="h-5 w-5 text-[#0052cc]" />
              <div><h2 className="font-bold text-[#172b4d]">{group.title}</h2><p className="text-xs text-[#6b778c]">{group.description}</p></div>
            </div>

            <div className="divide-y divide-[#ebecf0]">
              {group.serviceIds.map((serviceId) => {
                const service = getServiceById(serviceId);
                const section = portfolioSections.find((item) => item.serviceId === serviceId);
                if (!service) return null;
                const works = section?.tiers ? section.tiers.flatMap((tier) => tier.works) : section?.works || [];

                return (
                  <article key={serviceId} className="grid gap-5 px-5 py-5 lg:grid-cols-[260px_1fr_auto]">
                    <div>
                      <h3 className="font-bold text-[#172b4d]">{service.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-[#6b778c]">{section?.intro || service.summary}</p>
                      <p className="mt-2 text-xs font-semibold text-[#0052cc]">{service.priceLabel}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {works.length > 0 ? works.map((work) => (
                        <a key={work.id} href={work.videoUrl} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 border border-[#dfe1e6] bg-[#fafbfc] p-3 hover:border-[#4c9aff] hover:bg-[#deebff]">
                          <Film className="h-4 w-4 shrink-0 text-[#0052cc]" />
                          <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#172b4d]">{work.title}</strong><small className="mt-0.5 block truncate text-[#6b778c]">{work.tierName ? `${work.tierName} · ` : ''}{work.creatorName} · {work.duration}</small></span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#6b778c]" />
                        </a>
                      )) : <span className="text-xs text-[#8993a4]">视频素材待补充</span>}
                    </div>

                    <button type="button" onClick={() => onNavigateToOrderCreate(serviceId)} className="h-fit whitespace-nowrap border border-[#0052cc] px-3 py-2 text-xs font-semibold text-[#0052cc] hover:bg-[#deebff]">
                      创建此类型视频需求
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        <section className="border border-[#dfe1e6] bg-white shadow-xs">
          <div className="flex items-center gap-3 border-b border-[#dfe1e6] bg-[#fafbfc] px-5 py-4">
            <Users className="h-5 w-5 text-[#0052cc]" />
            <div><h2 className="font-bold text-[#172b4d]">制作团队与代表作</h2><p className="text-xs text-[#6b778c]">点击成员名称或代表作可直接打开对应视频。</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-[#dfe1e6] bg-[#fafbfc] text-[#5e6c84]"><tr><th className="px-5 py-3">成员</th><th className="px-5 py-3">擅长方向</th><th className="px-5 py-3">排队状态</th><th className="px-5 py-3">代表作品</th></tr></thead>
              <tbody className="divide-y divide-[#ebecf0]">
                {portfolioMembers.map((member) => {
                  const work = findPortfolioWork(member.representativeWorkId);
                  return <tr key={member.id} className="hover:bg-[#fafbfc]">
                    <td className="px-5 py-3 font-semibold"><a href={work?.videoUrl} target="_blank" rel="noreferrer" className="text-[#0052cc] hover:underline">{member.name}</a></td>
                    <td className="px-5 py-3 text-[#5e6c84]">{member.specialty}</td>
                    <td className="px-5 py-3"><span className="border border-[#dfe1e6] bg-[#f4f5f7] px-2 py-1 font-semibold text-[#42526e]">{member.status}</span></td>
                    <td className="px-5 py-3"><a href={work?.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#0052cc] hover:underline">{work?.title || '素材待补充'} <ExternalLink className="h-3.5 w-3.5" /></a></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
