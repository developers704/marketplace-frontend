'use client';
import React, { useEffect, useState } from 'react';

type Props = {
  userLabel?: string;
  watermarkIntervalMs?: number;
};

const PreventScreenCapture: React.FC<Props> = ({
  userLabel = '',
  watermarkIntervalMs = 5000,
}) => {
  const [blocked, setBlocked] = useState(false);
  const [watermark, setWatermark] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setWatermark(`${userLabel ? userLabel + ' • ' : ''}${formattedTime}`);
    };
    update();
    const iv = setInterval(update, watermarkIntervalMs);
    return () => clearInterval(iv);
  }, [userLabel, watermarkIntervalMs]);

  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault();
    const onSelect = (e: Event) => {
      window.getSelection()?.removeAllRanges();
      e.preventDefault();
    };

    const onVisibility = () => setBlocked(document.hidden);
    const onBlur = () => setBlocked(true);
    const onFocus = () => setBlocked(false);

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey) ||
        (e.metaKey && e.shiftKey) ||
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.ctrlKey && e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        setBlocked(true);
        return;
      }

      if (blocked) {
        setBlocked(false);
      }
    };

    document.addEventListener('contextmenu', onContext);
    document.addEventListener('selectstart', onSelect);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('selectstart', onSelect);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [blocked]);

  if (!blocked) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.7) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          backgroundColor:"black",
          textAlign:"center",
          fontSize: 14,
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        Screenshots are disabled for security.
      </div>

      <div
        style={{
          textAlign: 'center',
          color: 'white',
          zIndex: 100000,
          padding: '1rem 2rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 28 }}>Sensitive content blocked</h2>
        <p style={{ marginTop: 8 }}>Press any key to continue.</p>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 6 }).map((_, row) => (
          <div
            key={row}
            style={{
              display: 'flex',
              gap: 40,
              transform: `translateY(${row * 120}px) rotate(-20deg)`,
              opacity: 0.08,
              fontSize: 18,
              color: '#fff',
              whiteSpace: 'nowrap',
            }}
          >
            {Array.from({ length: 10 }).map((__, i) => (
              <span key={i} style={{ marginRight: 60 }}>
                {watermark}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreventScreenCapture;
