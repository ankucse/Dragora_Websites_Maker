import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../store/useBuilderStore';
import type { BlockNode } from '../store/useBuilderStore';

interface RenderBlockProps {
  node: BlockNode;
  parentId: string | null;
  isOverlay?: boolean;
}

export const RenderBlock: React.FC<RenderBlockProps> = ({ node, parentId, isOverlay }) => {
  const { selectedId, setSelectedId } = useBuilderStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: {
      type: node.type,
      node,
      parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 999 : 'auto',
  };

  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(node.id);
  };

  const renderChildren = () => {
    const isContainer = ['Section', 'Row', 'Column'].includes(node.type);
    if (!isContainer) return null;

    const childIds = node.children?.map(c => c.id) || [];

    return (
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[60px] p-2 border-2 border-dashed border-transparent hover:border-primary-500/30 transition-colors">
          {node.children?.map((child) => (
            <RenderBlock key={child.id} node={child} parentId={node.id} />
          ))}
          {node.children?.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-4">Drop components here</div>
          )}
        </div>
      </SortableContext>
    );
  };

  const getCommonClasses = () => {
    let classes = "relative group cursor-grab outline-none ring-offset-2 transition-all duration-200 rounded ";
    if (isSelected) {
      classes += "ring-2 ring-primary-500 shadow-md z-10 ";
    } else {
      classes += "hover:ring-2 ring-primary-400/50 ";
    }
    return classes;
  };

  const renderContent = () => {
    const common = getCommonClasses();
    
    switch (node.type) {
      case 'Section':
        return (
          <section className={`bg-white shadow-sm border border-slate-200 p-6 ${common} ${node.props.className || ''}`} onClick={handleClick}>
            <div className="absolute -top-3 left-2 bg-primary-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Section</div>
            {renderChildren()}
          </section>
        );
      case 'Row':
        return (
          <div className={`flex flex-row gap-4 w-full bg-slate-50 p-4 ${common} ${node.props.className || ''}`} onClick={handleClick}>
             <div className="absolute -top-3 left-2 bg-slate-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Row</div>
            {renderChildren()}
          </div>
        );
      case 'Column':
         return (
          <div className={`flex flex-col gap-4 flex-1 bg-slate-50/50 p-4 ${common} ${node.props.className || ''}`} onClick={handleClick}>
             <div className="absolute -top-3 left-2 bg-slate-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Column</div>
            {renderChildren()}
          </div>
        );
      case 'Heading':
        return <h2 className={`text-4xl font-extrabold text-slate-800 tracking-tight ${common}`} onClick={handleClick}>{node.props.text || 'New Heading'}</h2>;
      case 'Text':
        return <p className={`text-lg text-slate-600 leading-relaxed ${common}`} onClick={handleClick}>{node.props.text || 'Add your text here. This is a paragraph block.'}</p>;
      case 'Button':
        return (
          <button className={`bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold shadow-sm transition-all active:scale-95 ${common}`} onClick={handleClick}>
            {node.props.text || 'Click Me'}
          </button>
        );
      case 'Image':
        return <img src={node.props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'} alt="placeholder" className={`w-full h-auto rounded-xl object-cover shadow-sm ${common}`} onClick={handleClick} />;
      default:
        return <div className="p-4 bg-red-50 text-red-600 rounded">Unknown Element</div>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderContent()}
    </div>
  );
};
