import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { BlockType } from '../store/useBuilderStore';
import { LayoutTemplate, Type, Image as ImageIcon, MousePointerClick, Columns, AlignJustify } from 'lucide-react';

const ITEMS: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: 'Section', icon: <LayoutTemplate size={20} />, label: 'Section' },
  { type: 'Row', icon: <AlignJustify size={20} />, label: 'Row' },
  { type: 'Column', icon: <Columns size={20} />, label: 'Column' },
  { type: 'Heading', icon: <Type size={20} />, label: 'Heading' },
  { type: 'Text', icon: <AlignJustify size={20} />, label: 'Paragraph' },
  { type: 'Image', icon: <ImageIcon size={20} />, label: 'Image' },
  { type: 'Button', icon: <MousePointerClick size={20} />, label: 'Button' },
];

const DraggableItem = ({ type, icon, label }: { type: BlockType; icon: React.ReactNode; label: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      isSidebarItem: true,
      type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm cursor-grab hover:border-primary-400 hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-primary-500' : ''
      }`}
    >
      <div className="text-primary-500 bg-primary-50 p-2 rounded-lg">{icon}</div>
      <span className="font-medium text-slate-700">{label}</span>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-slate-50 border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto styled-scrollbar z-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg">D</div>
          Dragora
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">SaaS Builder Engine</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layout</h3>
          <div className="flex flex-col gap-3">
            {ITEMS.slice(0, 3).map((item) => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Elements</h3>
          <div className="flex flex-col gap-3">
            {ITEMS.slice(3).map((item) => (
              <DraggableItem key={item.type} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
