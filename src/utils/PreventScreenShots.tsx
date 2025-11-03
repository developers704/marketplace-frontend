'use client';
import { useEffect, useState } from 'react';

const PreventScreenCapture = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [keyPress, setKeyPress] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleKeyDown: any = (e: KeyboardEvent) => {
      //   console.log(e, '===>>> e');
      if (e.ctrlKey && e.shiftKey) {
        // console.log('Key pressed');
        e.preventDefault();
        setShowOverlay(true); // Blur content on losing focus
        setKeyPress(true);
        // alert('Screenshots are disabled!');
      } else if (e.metaKey && e.shiftKey) {
        e.preventDefault();
        setShowOverlay(true); // Blur content on losing focus
      } else {
        setShowOverlay(false);
      }
    };
    const handleVisibilityChange = () => {
      if (keyPress) {
        setShowOverlay(true); // Blur content on losing focus
      } else {
        setShowOverlay(false); // Remove blur when active
      }
    };

    // console.log(showOverlay, '===>>> showOverlay');
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [showOverlay]);

  return showOverlay ? (
    <div className="sensitive-content screenshot-protection">
      <h1 className="text-[42px] text-white font-bold absolute">
        No Screenshots, Press any key to continue
      </h1>
    </div>
  ) : null;
};

export default PreventScreenCapture;
