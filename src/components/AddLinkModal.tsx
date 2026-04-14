import React, { useState } from 'react';
import { GraphNode, GraphLink } from '../types';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (link: GraphLink) => void;
  onUpdate?: (link: GraphLink) => void;
  sourceNode: GraphNode | null;
  targetNode: GraphNode | null;
  editingLink?: GraphLink | null;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onAdd, onUpdate, sourceNode, targetNode, editingLink }) => {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [directed, setDirected] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      if (editingLink) {
        setType(editingLink.type || '');
        setAmount(editingLink.amount ? String(editingLink.amount) : '');
        setDate(editingLink.date || '');
        setDirected(editingLink.directed !== false);
      } else {
        setType('');
        setAmount('');
        setDate('');
        setDirected(true);
      }
    }
  }, [isOpen, editingLink]);

  if (!isOpen || !sourceNode || !targetNode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    const newLink: GraphLink = {
      id: editingLink ? editingLink.id : `L_${Date.now()}`,
      source: sourceNode.id,
      target: targetNode.id,
      type,
      directed,
      ...(amount ? { amount: Number(amount) } : {}),
      ...(date ? { date } : {})
    };
    
    if (editingLink && onUpdate) {
      onUpdate(newLink);
    } else {
      onAdd(newLink);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 border-t-4 border-emerald-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {editingLink ? '修改关联关系' : '新增关联关系'}
        </h2>
        
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
          <div className="text-center flex-1 overflow-hidden">
            <p className="text-xs text-slate-500 mb-1">起点</p>
            <p className="font-semibold text-slate-800 truncate" title={sourceNode.label}>{sourceNode.label}</p>
          </div>
          
          <button
            type="button"
            onClick={() => setDirected(!directed)}
            className={`flex flex-col items-center justify-center px-3 py-1.5 mx-2 rounded-md transition-all ${
              directed 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
            title={directed ? "点击切换为无向关系" : "点击切换为有向关系"}
          >
            {directed ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
              </svg>
            )}
            <span className="text-[10px] font-medium mt-0.5">
              {directed ? '有向' : '无向'}
            </span>
          </button>

          <div className="text-center flex-1 overflow-hidden">
            <p className="text-xs text-slate-500 mb-1">终点</p>
            <p className="font-semibold text-slate-800 truncate" title={targetNode.label}>{targetNode.label}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关系类型</label>
            <input 
              required 
              type="text" 
              value={type} 
              onChange={e => setType(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
              placeholder="例如：转账、通话、法人..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">涉及金额 (可选)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
                placeholder="¥"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">发生时间 (可选)</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-md shadow-emerald-500/20 font-medium"
            >
              {editingLink ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
