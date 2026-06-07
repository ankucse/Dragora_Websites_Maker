
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';

function App() {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900 font-sans">
      <Sidebar />
      <Canvas />
      <PropertiesPanel />
    </div>
  );
}

export default App;
