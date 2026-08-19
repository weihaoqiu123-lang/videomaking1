import React from 'react';
import { VideoCaseSample } from '../types';
import { X, Play, Clock, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

interface VideoCaseModalProps {
  sample: VideoCaseSample | null;
  onClose: () => void;
  onSelectType?: () => void;
  selectBtnLabel?: string;
}

export const VideoCaseModal: React.FC<VideoCaseModalProps> = ({
  sample,
  onClose,
  onSelectType,
  selectBtnLabel = '选择该视频类型'
}) => {
  if (!sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">{sample.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player or Simulated Canvas */}
        <div className="relative bg-slate-950 aspect-video flex items-center justify-center overflow-hidden">
          {sample.videoUrl ? (
            <video
              src={sample.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={sample.thumbnail}
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
              <img
                src={sample.thumbnail}
                alt={sample.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 backdrop-blur-xs">
                  <Play className="w-8 h-8 ml-1 fill-white" />
                </div>
                <p className="text-sm font-medium text-slate-200">代表视频参考案例展示</p>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white">
                  时长: {sample.duration}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-500 mb-1">效果亮点说明</h4>
            <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {sample.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>推荐成片时长: {sample.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-400" />
              <div className="flex items-center gap-1">
                {sample.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            关闭预览
          </button>
          {onSelectType && (
            <button
              onClick={() => {
                onSelectType();
                onClose();
              }}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {selectBtnLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
