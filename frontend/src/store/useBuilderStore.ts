import { create } from 'zustand';
import { produce } from 'immer';

export type BlockType = 'Section' | 'Row' | 'Column' | 'Text' | 'Heading' | 'Button' | 'GraphicCanvas' | 'Image';

export interface BlockNode {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  children: BlockNode[];
}

interface BuilderState {
  tree: BlockNode[];
  selectedId: string | null;
  addComponent: (node: BlockNode, parentId?: string) => void;
  moveComponent: (id: string, targetParentId: string | null, newIndex: number) => void;
  updateProperties: (id: string, props: Record<string, any>) => void;
  selectComponent: (id: string | null) => void;
  setTree: (newTree: BlockNode[]) => void;
}

export const useBuilderStore = create<BuilderState>()((set) => ({
  tree: [],
  selectedId: null,
  selectComponent: (id) => set({ selectedId: id }),
  setTree: (newTree) => set({ tree: newTree }),
  
  addComponent: (node, parentId) => set(produce((state: BuilderState) => {
    if (!parentId) {
      state.tree.push(node);
      return;
    }
    const findAndPush = (nodes: BlockNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === parentId) {
          n.children.push(node);
          return true;
        }
        if (findAndPush(n.children)) return true;
      }
      return false;
    };
    findAndPush(state.tree);
  })),

  moveComponent: (id, targetParentId, newIndex) => set(produce((state: BuilderState) => {
    let nodeToMove: BlockNode | null = null;
    
    // Recursive extraction
    const extractNode = (nodes: BlockNode[], targetId: string): boolean => {
      const idx = nodes.findIndex(n => n.id === targetId);
      if (idx > -1) {
        nodeToMove = nodes.splice(idx, 1)[0];
        return true;
      }
      for (const n of nodes) {
        if (extractNode(n.children, targetId)) return true;
      }
      return false;
    };
    
    extractNode(state.tree, id);
    if (!nodeToMove) return;

    // Insertion
    if (!targetParentId) {
      state.tree.splice(newIndex, 0, nodeToMove);
      return;
    }

    const insertNode = (nodes: BlockNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === targetParentId) {
          n.children.splice(newIndex, 0, nodeToMove!);
          return true;
        }
        if (insertNode(n.children)) return true;
      }
      return false;
    };
    insertNode(state.tree);
  })),

  updateProperties: (id, props) => set(produce((state: BuilderState) => {
    const findAndUpdate = (nodes: BlockNode[]): boolean => {
      for (const n of nodes) {
        if (n.id === id) {
          n.props = { ...n.props, ...props };
          return true;
        }
        if (findAndUpdate(n.children)) return true;
      }
      return false;
    };
    findAndUpdate(state.tree);
  }))
}));
