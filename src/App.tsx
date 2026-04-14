/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TobaccoGraph } from './components/TobaccoGraph';
import { DetailPanel } from './components/DetailPanel';
import { AddNodeModal } from './components/AddNodeModal';
import { AddLinkModal } from './components/AddLinkModal';
import { mockData } from './data/mockData';
import { GraphNode, GraphLink, GraphData, NodeType } from './types';
import { Plus, Link as LinkIcon } from 'lucide-react';

export default function App() {
  const [graphData, setGraphData] = useState<GraphData>(mockData);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [isAddingLinkMode, setIsAddingLinkMode] = useState(false);
  const [editingLink, setEditingLink] = useState<GraphLink | null>(null);
  const [linkSourceNode, setLinkSourceNode] = useState<GraphNode | null>(null);
  const [linkTargetNode, setLinkTargetNode] = useState<GraphNode | null>(null);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<Set<NodeType>>(
    new Set(['Person', 'Vehicle', 'Case', 'Express', 'Shop'])
  );

  const handleNodeClick = (node: GraphNode) => {
    if (isAddingLinkMode) {
      if (!linkSourceNode) {
        setLinkSourceNode(node);
      } else if (!linkTargetNode && node.id !== linkSourceNode.id) {
        setLinkTargetNode(node);
        setIsAddLinkModalOpen(true);
      }
      return;
    }
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleLinkClick = (link: GraphLink) => {
    if (isAddingLinkMode) return;
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
    setSelectedLink(null);
  };

  const handleAddNode = (newNode: GraphNode) => {
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const handleAddLink = (newLink: GraphLink) => {
    setGraphData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
    setIsAddLinkModalOpen(false);
    setIsAddingLinkMode(false);
    setLinkSourceNode(null);
    setLinkTargetNode(null);
    setEditingLink(null);
  };

  const handleUpdateLink = (updatedLink: GraphLink) => {
    setGraphData(prev => ({
      ...prev,
      links: prev.links.map(l => l.id === updatedLink.id ? updatedLink : l)
    }));
    
    if (selectedLink?.id === updatedLink.id) {
      setSelectedLink(updatedLink);
    }
    
    setIsAddLinkModalOpen(false);
    setEditingLink(null);
    setLinkSourceNode(null);
    setLinkTargetNode(null);
  };

  const handleEditLink = (link: GraphLink) => {
    setEditingLink(link);
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    const source = graphData.nodes.find(n => n.id === sourceId) || null;
    const target = graphData.nodes.find(n => n.id === targetId) || null;
    
    setLinkSourceNode(source);
    setLinkTargetNode(target);
    setIsAddLinkModalOpen(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return sourceId !== nodeId && targetId !== nodeId;
      })
    }));
    setSelectedNode(null);
  };

  const handleDeleteLink = (linkId: string) => {
    setGraphData(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== linkId)
    }));
    setSelectedLink(null);
  };

  const toggleAddLinkMode = () => {
    if (isAddingLinkMode) {
      setIsAddingLinkMode(false);
      setLinkSourceNode(null);
      setLinkTargetNode(null);
    } else {
      setIsAddingLinkMode(true);
      setLinkSourceNode(null);
      setLinkTargetNode(null);
      setSelectedNode(null);
      setSelectedLink(null);
    }
  };

  const handleCancelAddLink = () => {
    setIsAddLinkModalOpen(false);
    setIsAddingLinkMode(false);
    setLinkSourceNode(null);
    setLinkTargetNode(null);
    setEditingLink(null);
  };

  // Filter graph data based on displayLevel
  const filteredGraphData = useMemo(() => {
    // Find root nodes (Cases). If no cases, use the node with the most links.
    let rootNodeIds = graphData.nodes.filter(n => n.type === 'Case').map(n => n.id);
    
    if (rootNodeIds.length === 0 && graphData.nodes.length > 0) {
      const linkCounts: Record<string, number> = {};
      graphData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        linkCounts[sourceId] = (linkCounts[sourceId] || 0) + 1;
        linkCounts[targetId] = (linkCounts[targetId] || 0) + 1;
      });
      let maxId = graphData.nodes[0].id;
      let maxCount = 0;
      Object.entries(linkCounts).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxId = id;
        }
      });
      rootNodeIds = [maxId];
    }

    if (rootNodeIds.length === 0) return graphData;

    // BFS to find distances from root
    const distances: Record<string, number> = {};
    const queue: { id: string; dist: number }[] = rootNodeIds.map(id => ({ id, dist: 0 }));
    
    rootNodeIds.forEach(id => { distances[id] = 0; });

    // Build adjacency list
    const adj: Record<string, string[]> = {};
    graphData.nodes.forEach(n => { adj[n.id] = []; });
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      if (adj[sourceId] && adj[targetId]) {
        adj[sourceId].push(targetId);
        adj[targetId].push(sourceId);
      }
    });

    let head = 0;
    while (head < queue.length) {
      const { id, dist } = queue[head++];
      if (dist >= displayLevel) continue;

      (adj[id] || []).forEach(neighbor => {
        if (distances[neighbor] === undefined) {
          distances[neighbor] = dist + 1;
          queue.push({ id: neighbor, dist: dist + 1 });
        }
      });
    }

    // Find all nodes reachable from root (without distance limit) to identify disconnected components
    const reachableFromRoot = new Set<string>(rootNodeIds);
    const fullQueue = [...rootNodeIds];
    let fullHead = 0;
    while (fullHead < fullQueue.length) {
      const id = fullQueue[fullHead++];
      (adj[id] || []).forEach(neighbor => {
        if (!reachableFromRoot.has(neighbor)) {
          reachableFromRoot.add(neighbor);
          fullQueue.push(neighbor);
        }
      });
    }

    const filteredNodes = graphData.nodes
      .filter(n => selectedEntityTypes.has(n.type))
      .filter(n => {
        if (!startDate && !endDate) return true;
        if (!n.date) return false; // If date filter is active, hide nodes without date? Or show them? Let's hide nodes without date if filter is active, or maybe only filter if they have a date. Usually, if a filter is applied, we only show items that match.
        const nodeDate = new Date(n.date).getTime();
        const start = startDate ? startDate.getTime() : -Infinity;
        const end = endDate ? endDate.getTime() : Infinity;
        return nodeDate >= start && nodeDate <= end;
      })
      .filter(n => n.isNew || (distances[n.id] !== undefined && distances[n.id] <= displayLevel) || !reachableFromRoot.has(n.id))
      .map(n => ({ ...n, level: distances[n.id] !== undefined ? distances[n.id] : displayLevel }));
      
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks, rootNodeIds };
  }, [graphData, displayLevel, selectedEntityTypes, startDate, endDate]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar 
        displayLevel={displayLevel} 
        setDisplayLevel={setDisplayLevel} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedEntityTypes={selectedEntityTypes}
        setSelectedEntityTypes={setSelectedEntityTypes}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />
      <div className="flex-1 relative flex flex-col p-4 gap-4">
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">案件关系图谱分析</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={toggleAddLinkMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${isAddingLinkMode ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              <LinkIcon className="w-4 h-4" />
              {isAddingLinkMode ? '取消添加关系' : '新增关系'}
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              新增节点
            </button>
          </div>
        </header>

        <main className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          {isAddingLinkMode && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
              <LinkIcon className="w-4 h-4" />
              <span className="font-medium">
                {!linkSourceNode 
                  ? '请在图谱中点击选择【起点】节点' 
                  : `已选择起点：${linkSourceNode.label}，请点击选择【终点】节点`}
              </span>
              <button 
                onClick={toggleAddLinkMode}
                className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
              >
                取消
              </button>
            </div>
          )}
          <TobaccoGraph
            data={filteredGraphData}
            centerNodeIds={filteredGraphData.rootNodeIds}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            selectedNodeId={selectedNode?.id}
            linkSourceNodeId={linkSourceNode?.id}
            searchQuery={searchQuery}
          />
          
          <DetailPanel
            selectedNode={selectedNode}
            selectedLink={selectedLink}
            onClose={handleClosePanel}
            onDeleteNode={handleDeleteNode}
            onDeleteLink={handleDeleteLink}
            onEditLink={handleEditLink}
          />
        </main>
      </div>
      
      <AddNodeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddNode} 
      />
      <AddLinkModal
        isOpen={isAddLinkModalOpen}
        onClose={handleCancelAddLink}
        onAdd={handleAddLink}
        onUpdate={handleUpdateLink}
        sourceNode={linkSourceNode}
        targetNode={linkTargetNode}
        editingLink={editingLink}
      />
    </div>
  );
}
