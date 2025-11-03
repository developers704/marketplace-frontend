'use client';
import { useEffect } from 'react';

const DisableInspectElement = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows + Shift + S (Screenshot Shortcut)
      if (e.key === 'S' && e.shiftKey && e.metaKey) {
        e.preventDefault();
        // alert('Screenshots are disabled!');
      }

      // PrintScreen (PrtSc)
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // alert('Screenshots are not allowed!');
      }

      // Disable Developer Tools Shortcuts
      if (
        e.key === 'F12' || // F12 (DevTools)
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl + Shift + I
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl + Shift + C
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl + Shift + J (Console)
        (e.ctrlKey && e.shiftKey && e.key === 'S') || // Ctrl + Shift + J (Console)
        (e.ctrlKey && e.key === 'U') || // Ctrl + U (View Source)
        (e.ctrlKey && e.shiftKey) || // Ctrl + U (View Source)
        (e.metaKey && e.shiftKey)
      ) {
        e.preventDefault();
        // alert('Developer tools are disabled!');
      }
    };
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      //   alert('Right-click is disabled!');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return null;
};

export default DisableInspectElement;
