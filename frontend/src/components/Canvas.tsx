import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { useBuilderStore } from '../store/useBuilderStore';
import type { BlockNode, BlockType } from '../store/useBuilderStore';
import { RenderBlock } from './RenderBlock';
import { createPortal } from 'react-dom';

export const Canvas: React.FC = () => {
  const tree = useBuilderStore((state) => state.tree);
  const addComponent = useBuilderStore((state) => state.addComponent);
  const moveComponent = useBuilderStore((state) => state.moveComponent);
  const setSelectedId = useBuilderStore((state) => state.setSelectedId);
  const [activeNode, setActiveNode] = useState<BlockNode | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.isSidebarItem) {
      // Creating a temporary node for the DragOverlay
      const type = active.data.current.type as BlockType;
      setActiveNode({
        id: 'temp-drag',
        type,
        props: {},
        children: []
      });
    } else if (active.data.current?.node) {
      setActiveNode(active.data.current.node);
    }
    setSelectedId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNode(null);
    
    if (!over) return;

    const isSidebarItem = active.data.current?.isSidebarItem;
    
    // Determine target parent and index
    let newParentId = over.data.current?.parentId || null;
    let newIndex = 0; // Default to top

    // If we dropped ON a container, it becomes the parent
    const overType = over.data.current?.type;
    const isOverContainer = ['Section', 'Row', 'Column'].includes(overType);
    
    if (isOverContainer && active.id !== over.id) {
      newParentId = over.id as string;
      // We append to the end of the container
      newIndex = over.data.current?.node?.children?.length || 0;
    } else if (over.data.current?.sortable) {
       // If dropped on an item in a list, we place it after/before based on sortable index
       newIndex = over.data.current.sortable.index;
    }

    if (isSidebarItem) {
      // Create new component
      const type = active.data.current?.type as BlockType;
      const newNode: BlockNode = {
        id: uuidv4(),
        type,
        props: {},
        children: []
      };
      addComponent(newParentId, newNode, newIndex);
      setSelectedId(newNode.id);
    } else {
      // Move existing component
      if (active.id === over.id) return;
      moveComponent(active.id as string, newParentId, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto h-full styled-scrollbar relative" onClick={() => setSelectedId(null)}>
        
        {/* Helper dots for background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="bg-white min-h-[800px] shadow-xl ring-1 ring-slate-200 rounded-xl relative z-10 max-w-5xl mx-auto flex flex-col">
          <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50 rounded-t-xl">
             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          </div>
          <div className="flex-1 p-8 flex flex-col gap-4">
            {tree.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4 bg-slate-50/50">
                <p className="text-lg font-medium">Drag and drop a Section here to start building</p>
              </div>
            )}
            <SortableContext 
              items={tree.map(n => n.id)} 
              strategy={verticalListSortingStrategy}
            >
              {tree.map((node) => (
                <RenderBlock key={node.id} node={node} parentId={null} />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>

      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeNode ? (
            <div className="opacity-90 scale-105 shadow-2xl transition-transform">
               <RenderBlock node={activeNode} parentId={null} isOverlay />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
