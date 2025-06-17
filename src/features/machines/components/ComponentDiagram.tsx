import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  MiniMap, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  MarkerType,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Machine } from '../../../types';
import ComponentNode from './ComponentNode';
import { getComponentIcon } from '../utils/componentUtils';

interface ComponentDiagramProps {
  machine: Machine;
}

// Register custom node types
const nodeTypes = {
  componentNode: ComponentNode,
};

// Define category colors for visual consistency
const CATEGORY_COLORS = {
  'machine': { bg: '#1e40af', border: '#1e3a8a', text: '#ffffff' },
  'Drive': { bg: '#10b981', border: '#059669', text: '#ffffff' },
  'Controller': { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
  'Power': { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },
  'Communication': { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
  'Software': { bg: '#06b6d4', border: '#0891b2', text: '#ffffff' },
  'Object Manipulation': { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  'Sensors': { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  'Chassis': { bg: '#f97316', border: '#ea580c', text: '#ffffff' },
};

// Direction of the graph layout (TB = top to bottom, LR = left to right)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Get a layout for the nodes
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 90 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Position the nodes according to the layout
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // We are shifting the dagre node position (which is the center)
    // to the top left so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - 90,
      y: nodeWithPosition.y - 45,
    };

    return node;
  });

  return { nodes, edges };
};

// Define component relationships
const getComponentRelationships = (category1: string, category2: string) => {
  const relationships = {
    'Power': {
      'Drive': 'powers',
      'Controller': 'powers',
      'Sensors': 'powers',
      'Communication': 'powers',
      'Object Manipulation': 'powers'
    },
    'Controller': {
      'Drive': 'controls',
      'Object Manipulation': 'controls',
      'Sensors': 'reads'
    },
    'Software': {
      'Controller': 'runs on',
      'Sensors': 'processes'
    },
    'Communication': {
      'Software': 'connects',
      'Controller': 'connects'
    },
    'Chassis': {
      'Drive': 'mounts',
      'Object Manipulation': 'mounts',
      'Sensors': 'mounts',
      'Controller': 'houses'
    }
  };

  return relationships[category1]?.[category2] || null;
};

const ComponentDiagram: React.FC<ComponentDiagramProps> = ({ machine }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create the diagram when the machine changes
  useEffect(() => {
    if (!machine || !machine.components) return;
    
    // Create node for the machine itself at center
    const machineNode: Node = {
      id: 'machine',
      type: 'componentNode',
      data: { 
        label: machine.name, 
        category: 'machine',
        details: machine.type,
        icon: 'machine'
      },
      position: { x: 0, y: 0 },
      style: {
        width: 180,
        height: 80,
        background: CATEGORY_COLORS['machine'].bg,
        color: CATEGORY_COLORS['machine'].text,
        border: `1px solid ${CATEGORY_COLORS['machine'].border}`,
        borderRadius: '8px'
      }
    };
    
    // Create nodes for each component
    const componentNodes: Node[] = machine.components.map((component, index) => {
      const categoryStyle = CATEGORY_COLORS[component.category] || 
                         { bg: '#94a3b8', border: '#64748b', text: '#ffffff' };
      
      // Get important specifications to display
      const keySpecifications = Object.entries(component.specifications).slice(0, 2);
      
      return {
        id: component.id,
        type: 'componentNode',
        data: { 
          label: component.name,
          category: component.category,
          details: component.type,
          specifications: keySpecifications,
          icon: component.category
        },
        position: { x: 0, y: 0 }, // Will be calculated by layout algorithm
        style: {
          width: 180,
          height: 90,
          background: categoryStyle.bg,
          color: categoryStyle.text,
          border: `1px solid ${categoryStyle.border}`,
          borderRadius: '8px'
        }
      };
    });
    
    const initialNodes = [machineNode, ...componentNodes];
    
    // Create edges from machine to each component
    const machineEdges: Edge[] = machine.components.map(component => ({
      id: `machine-to-${component.id}`,
      source: 'machine',
      target: component.id,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 1, opacity: 0.6 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: '#94a3b8',
      },
    }));
    
    // Create edges between components based on their categories
    const componentEdges: Edge[] = [];
    const relationshipsAdded = new Set(); // To avoid duplicate edges
    
    // For each pair of components, check if there's a relationship
    machine.components.forEach(source => {
      machine.components.forEach(target => {
        if (source.id === target.id) return; // Skip self-connections
        
        const relationship = getComponentRelationships(source.category, target.category);
        const relationshipKey = `${source.id}-${target.id}`;
        
        if (relationship && !relationshipsAdded.has(relationshipKey)) {
          relationshipsAdded.add(relationshipKey);
          
          let edgeStyle = {};
          
          // Style edges based on relationship type
          switch (relationship) {
            case 'powers':
              edgeStyle = { stroke: '#f59e0b', strokeWidth: 2 }; // amber
              break;
            case 'controls':
            case 'reads':
              edgeStyle = { stroke: '#3b82f6', strokeWidth: 2 }; // blue
              break;
            case 'processes':
            case 'runs on':
              edgeStyle = { stroke: '#06b6d4', strokeWidth: 2 }; // cyan
              break;
            case 'connects':
              edgeStyle = { stroke: '#8b5cf6', strokeWidth: 2 }; // purple
              break;
            case 'mounts':
            case 'houses':
              edgeStyle = { stroke: '#f97316', strokeWidth: 2 }; // orange
              break;
            default:
              edgeStyle = { stroke: '#94a3b8', strokeWidth: 1 }; // gray
          }
          
          componentEdges.push({
            id: `${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            type: 'smoothstep',
            animated: true,
            label: relationship,
            labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 11 },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
            labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.8 },
            style: edgeStyle,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 12,
              height: 12,
              color: (edgeStyle as any).stroke,
            },
          });
        }
      });
    });
    
    // Apply layout to nodes and edges
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes, 
      [...machineEdges, ...componentEdges],
      'LR' // Left to right layout
    );
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [machine, setNodes, setEdges]);

  // Reset the layout
  const resetLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes, 
      edges,
      'LR' // Left to right layout
    );
    
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }}
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            const category = n.data?.category || 'machine';
            return CATEGORY_COLORS[category]?.border || '#64748b';
          }}
          nodeColor={(n) => {
            const category = n.data?.category || 'machine';
            return CATEGORY_COLORS[category]?.bg || '#94a3b8';
          }}
          nodeBorderRadius={8}
        />
        <Background color="#aaa" gap={16} />
        <Panel position="top-right">
          <button
            onClick={resetLayout}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md flex items-center"
          >
            Reset Layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ComponentDiagram;