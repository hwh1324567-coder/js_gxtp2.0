import React from 'react';
import { GraphNode, GraphLink } from '../types';
import { User, Car, Briefcase, Package, Store, Box, Calendar, DollarSign, Link as LinkIcon, X, Trash2, Edit2 } from 'lucide-react';

interface DetailPanelProps {
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onClose: () => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onEditLink: (link: GraphLink) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'Person': return <User className="w-5 h-5" />;
    case 'Vehicle': return <Car className="w-5 h-5" />;
    case 'Case': return <Briefcase className="w-5 h-5" />;
    case 'Express': return <Package className="w-5 h-5" />;
    case 'Shop': return <Store className="w-5 h-5" />;
    default: return <Box className="w-5 h-5" />;
  }
};

export const DetailPanel: React.FC<DetailPanelProps> = ({ selectedNode, selectedLink, onClose, onDeleteNode, onDeleteLink, onEditLink }) => {
  if (!selectedNode && !selectedLink) return null;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full text-slate-700 shadow-xl absolute right-0 top-0 bottom-0 z-10 transition-transform duration-300">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {selectedNode ? '实体详情' : '关系详情'}
        </h2>
        <div className="flex items-center gap-1">
          {selectedLink && (
            <button 
              onClick={() => onEditLink(selectedLink)} 
              className="text-emerald-500 hover:text-emerald-700 transition-colors p-1 hover:bg-emerald-50 rounded-md"
              title="修改"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => {
              if (selectedNode) onDeleteNode(selectedNode.id);
              if (selectedLink) onDeleteLink(selectedLink.id);
            }} 
            className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-md"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-200 rounded-md" title="关闭">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {selectedNode && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-slate-100 border border-slate-200 text-emerald-600 shadow-sm`}>
                {getIcon(selectedNode.type)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedNode.label}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">实体类型</p>
                <p className="text-sm font-medium text-slate-700">{selectedNode.type}</p>
              </div>
              
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">标识 ID</p>
                <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                  {selectedNode.id}
                </p>
              </div>

              {selectedNode.date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 日期
                  </p>
                  <p className="text-sm font-medium text-slate-700">{selectedNode.date}</p>
                </div>
              )}

              {selectedNode.details && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">备注</p>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedNode.details}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedLink && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 py-5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1 font-medium">起点</p>
                <p className="text-sm font-bold text-slate-800 truncate w-24">
                  {typeof selectedLink.source === 'object' ? selectedLink.source.label : selectedLink.source}
                </p>
              </div>
              <div className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1 font-medium">终点</p>
                <p className="text-sm font-bold text-slate-800 truncate w-24">
                  {typeof selectedLink.target === 'object' ? selectedLink.target.label : selectedLink.target}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">关系类型</p>
                <p className="text-lg font-bold text-emerald-600">{selectedLink.type}</p>
              </div>

              {selectedLink.date && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 发生时间
                  </p>
                  <p className="text-sm font-medium text-slate-700">{selectedLink.date}</p>
                </div>
              )}

              {selectedLink.amount && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> 涉及金额
                  </p>
                  <p className="text-xl font-mono text-emerald-600 font-bold">¥{selectedLink.amount.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
