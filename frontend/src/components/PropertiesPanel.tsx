
import { useBuilderStore } from '../store/useBuilderStore';
import { Settings } from 'lucide-react';

export const PropertiesPanel = () => {
  const selectedId = useBuilderStore((state) => state.selectedId);
  const tree = useBuilderStore((state) => state.tree);
  const updateProperties = useBuilderStore((state) => state.updateProperties);

  const findNode = (nodes: any[], id: string): any => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const child = findNode(n.children, id);
      if (child) return child;
    }
    return null;
  };

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;

  return (
    <div className="w-80 h-full bg-[#0B1120]/80 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col gap-6 shadow-2xl relative z-20 overflow-y-auto styled-scrollbar">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Settings className="text-primary-400" size={20} />
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Properties</h2>
      </div>

      {!selectedNode ? (
        <div className="flex flex-col items-center justify-center text-slate-500 h-64 border border-dashed border-white/10 rounded-xl bg-white/5">
          <Settings size={32} className="mb-4 opacity-50" />
          <p className="text-sm">Select an element to edit</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl shadow-inner">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Element Type</h3>
            <div className="text-lg font-medium text-slate-200">{selectedNode.type}</div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Text Content</label>
            <input
              type="text"
              value={selectedNode.props.text || ''}
              onChange={(e) => updateProperties(selectedNode.id, { text: e.target.value })}
              className="bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
              placeholder="Enter text..."
            />
          </div>
          
        </div>
      )}
    </div>
  );
};
