import { OfficeScene } from '@/components/scene/OfficeScene';
import { ChatPanel } from '@/components/ui/ChatPanel';
import { OfficeHud } from '@/components/ui/OfficeHud';
import { ZoomControls } from '@/components/ui/ZoomControls';
import { useBootstrap } from '@/hooks/useBootstrap';
import './App.css';

export function App() {
  useBootstrap();

  return (
    <div className="app">
      <main className="app__viewport">
        <OfficeScene />
        <OfficeHud />
        <ZoomControls />
      </main>
      <ChatPanel />
    </div>
  );
}