import React, { useState } from 'react';
import { GraphNode, NodeType } from '../types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (node: GraphNode) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<NodeType>('Person');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNode: GraphNode = {
      id: `N_${Date.now()}`,
      label,
      type,
      details,
      ...(date ? { date } : {}),
      isNew: true
    };
    onAdd(newNode);
    setLabel('');
    setDetails('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 border-t-4 border-emerald-500">
        <h2 className="text-xl font-bold text-slate-800 mb-4">新增图谱节点</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">名称</label>
            <input 
              required 
              type="text" 
              value={label} 
              onChange={e => setLabel(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
              placeholder="例如：王小明"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">类型</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value as NodeType)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="Person">人员</option>
              <option value="Vehicle">车辆</option>
              <option value="Case">案件</option>
              <option value="Express">快递</option>
              <option value="Shop">经营信息/店铺</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期 (可选)</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" 
              rows={3}
              placeholder="输入实体的详细描述..."
            ></textarea>
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
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
