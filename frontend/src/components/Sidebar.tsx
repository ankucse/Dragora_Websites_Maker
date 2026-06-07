import type { BlockType } from '../store/useBuilderStore';
import { LayoutTemplate, Type, MousePointerClick, Columns, AlignJustify } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const ITEMS: { type: BlockType; icon: React.ReactNode; label: string }[] = [
  { type: 'Section', icon: <LayoutTemplate size={20} />, label: 'Section' },
  { type: 'Row', icon: <AlignJustify size={20} />, label: 'Row' },
  { type: 'Column', icon: <Columns size={20} />, label: 'Column' },
  { type: 'Heading', icon: <Type size={20} />, label: 'Heading' },
  { type: 'Text', icon: <AlignJustify size={20} />, label: 'Paragraph' },
  { type: 'Button', icon: <MousePointerClick size={20} />, label: 'Button' },
];

const SidebarItem = ({ item }: { item: typeof ITEMS[0] }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { type: item.type, isSidebarItem: true },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 border-primary-500 shadow-lg scale-105 bg-slate-800' : 'border-white/10 bg-slate-900/50 hover:bg-slate-800 hover:border-white/20'}`}
      {...listeners}
      {...attributes}
    >
      <div className="text-primary-400">{item.icon}</div>
      <span className="font-medium text-slate-200">{item.label}</span>
    </div>
  );
};

export const Sidebar = () => {
  return (
    <div className="w-80 h-full bg-[#0B1120]/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-8 overflow-y-auto styled-scrollbar shadow-2xl relative z-20">
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Layout Components</h2>
        <div className="flex flex-col gap-3">
          {ITEMS.slice(0, 3).map(item => <SidebarItem key={item.type} item={item} />)}
        </div>
      </div>
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">UI Elements</h2>
        <div className="flex flex-col gap-3">
          {ITEMS.slice(3).map(item => <SidebarItem key={item.type} item={item} />)}
        </div>
      </div>
    </div>
  );
};
