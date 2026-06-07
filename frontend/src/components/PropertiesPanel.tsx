import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Settings2, Trash2 } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateComponentProperties = useBuilderStore((state) => state.updateComponentProperties);
  const deleteComponent = useBuilderStore((state) => state.deleteComponent);

  const findNode = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNode(node.children, id);
      if (found) return found;
    }
    return null;
  };

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col h-full z-10">
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
          <Settings2 size={48} strokeWidth={1} />
          <p className="text-sm font-medium">Select an element to edit</p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: string) => {
    updateComponentProperties(selectedNode.id, { [key]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full z-10 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        <h2 className="font-bold text-slate-800 flex items-center gap-2">
          <Settings2 size={18} className="text-primary-500" />
          {selectedNode.type} Props
        </h2>
        <button 
          onClick={() => deleteComponent(selectedNode.id)}
          className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
          title="Delete component"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6 overflow-y-auto styled-scrollbar">
        {['Heading', 'Text', 'Button'].includes(selectedNode.type) && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content text</label>
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm"
              value={selectedNode.props.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Enter text..."
            />
          </div>
        )}

        {selectedNode.type === 'Image' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
            <input 
              type="text" 
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm"
              value={selectedNode.props.src || ''}
              onChange={(e) => handleChange('src', e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tailwind Classes</label>
          <textarea 
            className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-sm font-mono resize-y min-h-[100px]"
            value={selectedNode.props.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
            placeholder="e.g. bg-red-500 text-white p-4"
          />
        </div>
      </div>
    </div>
  );
};
