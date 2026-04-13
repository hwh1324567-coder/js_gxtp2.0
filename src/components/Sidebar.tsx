import React from 'react';
import { Search, Filter, Layers, Activity, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { NodeType } from '../types';

interface SidebarProps {
  displayLevel: number;
  setDisplayLevel: (level: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedEntityTypes: Set<NodeType>;
  setSelectedEntityTypes: React.Dispatch<React.SetStateAction<Set<NodeType>>>;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  displayLevel, 
  setDisplayLevel, 
  searchQuery, 
  setSearchQuery,
  selectedEntityTypes,
  setSelectedEntityTypes,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const toggleEntityType = (type: NodeType) => {
    setSelectedEntityTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full text-slate-700 shadow-sm z-10">
      <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
        <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          烟草关系图谱
        </h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索实体、账号、车牌..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Date Range Picker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              时间范围
            </h3>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(null); setEndDate(null); }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                清除
              </button>
            )}
          </div>
          <div className="relative">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                const [start, end] = update;
                setStartDate(start);
                setEndDate(end);
              }}
              placeholderText="选择起止时间"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              dateFormat="yyyy-MM-dd"
              isClearable={false}
            />
          </div>
        </div>

        {/* Display Level */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-800 mb-3">显示层级</h3>
          <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-y-3 gap-x-2">
            {[
              { value: 1, label: '一层关系' },
              { value: 2, label: '二层关系' },
              { value: 3, label: '三层关系' },
              { value: 4, label: '四层关系' },
              { value: 5, label: '五层关系' },
            ].map((level) => (
              <label key={level.value} className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input 
                    type="radio" 
                    name="displayLevel" 
                    value={level.value}
                    checked={displayLevel === level.value}
                    onChange={() => setDisplayLevel(level.value)}
                    className="peer appearance-none w-4 h-4 border border-slate-300 rounded-full checked:border-emerald-600 checked:border-[4px] transition-all cursor-pointer bg-white"
                  />
                </div>
                <span className={`text-sm transition-colors ${displayLevel === level.value ? 'text-emerald-700 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {level.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Filter className="w-3 h-3" />
            实体类型
          </h3>
          <div className="space-y-3">
            {(
              [
                { id: 'Person', label: '人员', color: 'bg-blue-500' },
                { id: 'Vehicle', label: '车辆', color: 'bg-purple-500' },
                { id: 'Case', label: '案件', color: 'bg-red-500' },
                { id: 'Express', label: '快递', color: 'bg-emerald-500' },
                { id: 'Shop', label: '经营信息/店铺', color: 'bg-cyan-500' },
              ] as const
            ).map((type) => (
              <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedEntityTypes.has(type.id)}
                  onChange={() => toggleEntityType(type.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/50 w-4 h-4" 
                />
                <span className={`w-2.5 h-2.5 rounded-full ${type.color} shadow-sm`}></span>
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
