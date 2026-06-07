import { create } from 'zustand';
import { produce } from 'immer';

export type BlockType = 'Section' | 'Row' | 'Column' | 'Text' | 'Heading' | 'Image' | 'Button';

export interface BlockNode {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: BlockNode[];
}

interface BuilderState {
  tree: BlockNode[];
  selectedId: string | null;
  
  // Actions
  addComponent: (parentId: string | null, component: BlockNode, index?: number) => void;
  moveComponent: (id: string, newParentId: string | null, newIndex: number) => void;
  deleteComponent: (id: string) => void;
  updateComponentProperties: (id: string, newProps: Partial<Record<string, any>>) => void;
  setSelectedId: (id: string | null) => void;
}

const findNode = (nodes: BlockNode[], id: string): BlockNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
};

export const useBuilderStore = create<BuilderState>()((set) => ({
  tree: [],
  selectedId: null,

  addComponent: (parentId, component, index) => set(produce((state: BuilderState) => {
    const targetArray = parentId 
      ? findNode(state.tree, parentId)?.children 
      : state.tree;

    if (targetArray) {
      if (index !== undefined) targetArray.splice(index, 0, component);
      else targetArray.push(component);
    }
  })),

  moveComponent: (id, newParentId, newIndex) => set(produce((state: BuilderState) => {
    let removedNode: BlockNode | null = null;
    
    const removeNode = (nodes: BlockNode[]): boolean => {
      const idx = nodes.findIndex(n => n.id === id);
      if (idx !== -1) {
        removedNode = nodes.splice(idx, 1)[0];
        return true;
      }
      for (const node of nodes) {
        if (removeNode(node.children)) return true;
      }
      return false;
    };
    
    removeNode(state.tree);
    if (!removedNode) return;

    const targetArray = newParentId 
      ? findNode(state.tree, newParentId)?.children 
      : state.tree;

    if (targetArray) {
      targetArray.splice(newIndex, 0, removedNode);
    }
  })),

  deleteComponent: (id) => set(produce((state: BuilderState) => {
    const removeNode = (nodes: BlockNode[]): boolean => {
      const idx = nodes.findIndex(n => n.id === id);
      if (idx !== -1) {
        nodes.splice(idx, 1);
        return true;
      }
      for (const node of nodes) {
        if (removeNode(node.children)) return true;
      }
      return false;
    };
    removeNode(state.tree);
    if (state.selectedId === id) state.selectedId = null;
  })),

  updateComponentProperties: (id, props) => set(produce((state: BuilderState) => {
    const node = findNode(state.tree, id);
    if (node) {
      node.props = { ...node.props, ...props };
    }
  })),

  setSelectedId: (id) => set({ selectedId: id })
}));
