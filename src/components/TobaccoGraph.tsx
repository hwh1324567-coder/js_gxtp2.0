import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '../types';

interface TobaccoGraphProps {
  data: GraphData;
  centerNodeIds?: string[];
  onNodeClick: (node: GraphNode) => void;
  onLinkClick: (link: GraphLink) => void;
  selectedNodeId?: string | null;
  linkSourceNodeId?: string | null;
  searchQuery?: string;
}

const colorScale = d3.scaleOrdinal<string>()
  .domain(['Person', 'Vehicle', 'Case', 'Express', 'Shop'])
  .range(['#3b82f6', '#a855f7', '#ef4444', '#10b981', '#06b6d4']);

export const TobaccoGraph: React.FC<TobaccoGraphProps> = ({ data, centerNodeIds = [], onNodeClick, onLinkClick, selectedNodeId, linkSourceNodeId, searchQuery }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = dimensions;

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Deep copy data to avoid mutating original props
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Pre-calculate positions to ensure 360-degree distribution
    const levelCounts: Record<number, number> = {};
    nodes.forEach(n => {
      const lvl = n.level || 0;
      levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;
    });

    const levelIndices: Record<number, number> = {};
    
    nodes.forEach(node => {
      const lvl = node.level || 0;
      if (centerNodeIds.includes(node.id)) {
        node.fx = width / 2;
        node.fy = height / 2;
      } else {
        const idx = levelIndices[lvl] || 0;
        levelIndices[lvl] = idx + 1;
        // Add a slight offset to alternating levels to make it look more organic
        const angleOffset = (lvl % 2 === 0) ? 0 : (Math.PI / levelCounts[lvl]);
        const angle = (idx / levelCounts[lvl]) * 2 * Math.PI + angleOffset;
        const radius = lvl * 220;
        node.x = width / 2 + radius * Math.cos(angle);
        node.y = height / 2 + radius * Math.sin(angle);
      }
    });

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('collide', d3.forceCollide().radius((d: any) => centerNodeIds.includes(d.id) ? 80 : 50))
      .force('radial', d3.forceRadial<GraphNode>(
        (d: any) => (d.level || 0) * 220,
        width / 2,
        height / 2
      ).strength(0.8));

    // Arrow markers
    const defs = svg.append('defs');
    
    // Normal arrow
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#94a3b8')
      .attr('d', 'M0,-5L10,0L0,5');

    // Large arrow for center nodes
    defs.append('marker')
      .attr('id', 'arrow-large')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#94a3b8')
      .attr('d', 'M0,-5L10,0L0,5');

    const isMatch = (node: any) => {
      if (!searchQuery) return false;
      if (!node) return false;
      const q = searchQuery.toLowerCase();
      return node.label.toLowerCase().includes(q) || 
             (node.details && node.details.toLowerCase().includes(q)) ||
             node.id.toLowerCase().includes(q);
    };

    const link = g.append('g')
      .selectAll('g')
      .data(links)
      .enter().append('g')
      .attr('class', 'link-group')
      .style('cursor', 'pointer')
      .attr('opacity', (d: any) => {
        if (!searchQuery) return 1;
        const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
        const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
        return (isMatch(sourceNode) || isMatch(targetNode)) ? 1 : 0.1;
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        onLinkClick(d);
      });

    const linkPath = link.append('path')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', (d: any) => {
        if (d.directed === false) return null;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return centerNodeIds.includes(targetId) ? 'url(#arrow-large)' : 'url(#arrow)';
      });

    const linkLabel = link.append('text')
      .attr('font-size', '10px')
      .attr('fill', '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text((d: any) => d.type);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .attr('opacity', (d: any) => {
        if (!searchQuery) return 1;
        return isMatch(d) ? 1 : 0.2;
      });

    node.append('circle')
      .attr('r', (d: any) => centerNodeIds.includes(d.id) ? 30 : 20)
      .attr('fill', (d: any) => colorScale(d.type))
      .attr('stroke', (d: any) => {
        if (selectedNodeId === d.id) return '#10b981';
        if (linkSourceNodeId === d.id) return '#3b82f6';
        return '#ffffff';
      })
      .attr('stroke-width', (d: any) => (selectedNodeId === d.id || linkSourceNodeId === d.id) ? 4 : 2)
      .style('filter', (d: any) => {
        if (selectedNodeId === d.id) return 'drop-shadow(0 0 8px rgba(16,185,129,0.5))';
        if (linkSourceNodeId === d.id) return 'drop-shadow(0 0 8px rgba(59,130,246,0.5))';
        return 'none';
      });

    // Add icons or initials
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .attr('fill', '#ffffff')
      .attr('font-size', (d: any) => centerNodeIds.includes(d.id) ? '16px' : '12px')
      .attr('font-weight', 'bold')
      .text((d: any) => d.label.charAt(0));

    node.append('text')
      .attr('dy', (d: any) => centerNodeIds.includes(d.id) ? 45 : 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => centerNodeIds.includes(d.id) ? '14px' : '12px')
      .attr('font-weight', (d: any) => centerNodeIds.includes(d.id) ? '700' : '500')
      .attr('fill', '#334155')
      .text((d: any) => d.label);

    simulation.on('tick', () => {
      linkPath.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        // Straight line
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      if (!centerNodeIds.includes(d.id)) {
        d.fx = null;
        d.fy = null;
      }
    }

    // Initial zoom to fit
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, selectedNodeId, linkSourceNodeId, centerNodeIds, searchQuery, onNodeClick, onLinkClick]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
