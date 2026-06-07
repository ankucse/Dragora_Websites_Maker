import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useBuilderStore } from '../store/useBuilderStore';
import type { BlockNode, BlockType } from '../store/useBuilderStore';
import { createPortal } from 'react-dom';
import { useDroppable } from '@dnd-kit/core';

const RenderBlock: React.FC<{ node: BlockNode }> = ({ node }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { node }
  });

  const selectComponent = useBuilderStore(state => state.selectComponent);
  const selectedId = useBuilderStore(state => state.selectedId);
  const isSelected = selectedId === node.id;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isContainer = ['Section', 'Row', 'Column'].includes(node.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={setNodeRef}
      style={style}
      className={`relative min-h-[60px] rounded-xl border p-4 backdrop-blur-xl transition-all duration-300
        ${isDragging ? 'opacity-50 z-50 shadow-2xl scale-105 border-primary-500' : 'opacity-100'}
        ${isSelected ? 'ring-2 ring-primary-500 border-transparent shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10'}
        ${isContainer ? 'bg-slate-900/40' : 'bg-slate-800/60'}
      `}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(node.id);
      }}
      {...attributes}
      {...listeners}
    >
      <div className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded text-slate-300 pointer-events-none uppercase tracking-wider">
        {node.type}
      </div>

      {isContainer ? (
        <SortableContext items={node.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[100px] w-full flex flex-col gap-3 mt-6">
            <AnimatePresence>
              {node.children.map(child => (
                <RenderBlock key={child.id} node={child} />
              ))}
            </AnimatePresence>
            {node.children.length === 0 && (
              <div className="w-full h-full min-h-[60px] rounded-lg border border-dashed border-white/10 flex items-center justify-center text-slate-500 text-sm font-medium">
                Drop components here
              </div>
            )}
          </div>
        </SortableContext>
      ) : (
        <div className="mt-4 text-slate-200 font-medium">
           {node.props.text || `${node.type} Element`}
        </div>
      )}
    </motion.div>
  );
};

export const Canvas: React.FC = () => {
  const tree = useBuilderStore(state => state.tree);
  const addComponent = useBuilderStore(state => state.addComponent);
  const moveComponent = useBuilderStore(state => state.moveComponent);
  const selectComponent = useBuilderStore(state => state.selectComponent);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSidebarType, setActiveSidebarType] = useState<BlockType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    if (e.active.data.current?.isSidebarItem) {
      setActiveSidebarType(e.active.data.current.type);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    setActiveSidebarType(null);
    
    const { active, over } = e;
    if (!over) return;

    const isSidebarItem = active.data.current?.isSidebarItem;
    const blockType = isSidebarItem ? active.data.current?.type : active.data.current?.node?.type;
    
    if (!blockType) return;

    const overId = over.id as string;
    let targetParentId: string | null = null;
    let targetIndex = 0;

    if (overId === 'canvas_root') {
      targetParentId = null;
      targetIndex = tree.length;
    } else {
      const findParentAndIndex = (nodes: BlockNode[], parentId: string | null): { pId: string | null, idx: number } | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === overId) {
             const isContainer = ['Section', 'Row', 'Column'].includes(nodes[i].type);
             if (isContainer) {
                return { pId: nodes[i].id, idx: nodes[i].children.length };
             }
             return { pId: parentId, idx: i + 1 };
          }
          const nested = findParentAndIndex(nodes[i].children, nodes[i].id);
          if (nested) return nested;
        }
        return null;
      };
      
      const result = findParentAndIndex(tree, null);
      if (result) {
        targetParentId = result.pId;
        targetIndex = result.idx;
      }
    }

    if (isSidebarItem) {
      const newNode: BlockNode = {
        id: uuidv4(),
        type: blockType,
        props: {},
        children: []
      };
      addComponent(newNode, targetParentId || undefined);
    } else {
      moveComponent(active.id as string, targetParentId, targetIndex);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="w-full min-h-[80vh] bg-transparent flex flex-col items-center pt-10 pb-32"
        onClick={() => selectComponent(null)}
      >
        <div className="w-full max-w-[1200px] min-h-[80vh] bg-[#0B1120] p-8 rounded-3xl border border-white/5 shadow-[0_0_100px_rgba(99,102,241,0.05)] overflow-hidden relative">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-accent-500/10 blur-[100px] rounded-full pointer-events-none" />

          <DroppableCanvas tree={tree} />
        </div>
      </div>
      {createPortal(
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
          {activeId ? (
            <div className="bg-primary-600/20 border border-primary-500 backdrop-blur-md p-4 rounded-xl shadow-2xl text-white font-medium">
              {activeSidebarType || 'Moving block...'}
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

const DroppableCanvas = ({ tree }: { tree: BlockNode[] }) => {
  const { setNodeRef } = useDroppable({ id: 'canvas_root' });

  return (
    <div ref={setNodeRef} className="w-full h-full min-h-full flex flex-col gap-4 relative z-10">
      <SortableContext items={tree.map(n => n.id)} strategy={verticalListSortingStrategy}>
        <AnimatePresence>
          {tree.map(node => (
            <RenderBlock key={node.id} node={node} />
          ))}
        </AnimatePresence>
        {tree.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-white/10 rounded-2xl mx-8 my-8 bg-white/5 backdrop-blur-sm"
          >
            <span className="text-lg font-medium tracking-tight">Drag and drop a Section here to start building</span>
          </motion.div>
        )}
      </SortableContext>
    </div>
  );
};
