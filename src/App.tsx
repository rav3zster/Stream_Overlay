import { useEffect, useState } from 'react';
import { Dashboard } from './features/admin/Dashboard';
import { OBSOverlay } from './features/overlay/OBSOverlay';
import { StreamDeck } from './features/streamdeck/StreamDeck';

function App() {
  const [currentRoute, setCurrentRoute] = useState<'admin' | 'overlay' | 'streamdeck'>('admin');

  useEffect(() => {
    const parseRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.includes('overlay') || path.includes('overlay')) {
        setCurrentRoute('overlay');
      } else if (hash.includes('streamdeck') || path.includes('streamdeck')) {
        setCurrentRoute('streamdeck');
      } else {
        setCurrentRoute('admin');
      }
    };

    // Parse initial route load
    parseRoute();

    // Listen to hash changes
    window.addEventListener('hashchange', parseRoute);
    return () => window.removeEventListener('hashchange', parseRoute);
  }, []);

  // Return matching route layouts
  switch (currentRoute) {
    case 'overlay':
      return <OBSOverlay />;
    case 'streamdeck':
      return <StreamDeck />;
    default:
      return <Dashboard />;
  }
}

export default App;
