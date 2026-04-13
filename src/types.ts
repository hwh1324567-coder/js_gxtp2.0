export type NodeType = 'Person' | 'Vehicle' | 'Case' | 'Express' | 'Shop';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: NodeType;
  details?: string;
  date?: string;
  level?: number;
  isNew?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  date?: string;
  amount?: number;
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
