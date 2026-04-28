'use client';

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Pencil,
  Eraser,
  Trash2,
  Image as ImageIcon,
  Minus,
  Square,
  Circle,
  Highlighter,
  PenLine,
  Undo2,
  Redo2,
} from 'lucide-react';

export interface DrawingCanvasRef {
  getBlob: () => Promise<Blob | null>;
  clear: () => void;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onCanvasChange?: (hasContent: boolean) => void;
}

const COLORS = ['#000000', '#333333', '#c41e3a', '#1e3a8a', '#166534', '#854d0e', '#7c3aed'];

type ToolType = 'pencil' | 'pen' | 'marker' | 'eraser' | 'line' | 'rect' | 'circle';

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ width = 600, height = 400, onCanvasChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const shapeSnapshotRef = useRef<ImageData | null>(null);

    const [tool, setTool] = useState<ToolType>('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);
    const [redoStack, setRedoStack] = useState<ImageData[]>([]);

    const getCtx = useCallback(() => canvasRef.current?.getContext('2d'), []);

    const pushHistory = useCallback(() => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      try {
        const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory((h) => [...h, canvasData].slice(-50));
        setRedoStack([]);
      } catch {
        // ignore
      }
    }, [getCtx]);

    const undo = useCallback(() => {
      if (history.length === 0) return;
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setRedoStack((r) => [...r, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      ctx.putImageData(prev, 0, 0);
      onCanvasChange?.(true);
    }, [history, getCtx, onCanvasChange]);

    const redo = useCallback(() => {
      if (redoStack.length === 0) return;
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      const next = redoStack[redoStack.length - 1];
      setRedoStack((r) => r.slice(0, -1));
      setHistory((h) => [...h, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      ctx.putImageData(next, 0, 0);
      onCanvasChange?.(true);
    }, [redoStack, getCtx, onCanvasChange]);

    const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches?.[0];
        if (!touch) return null;

        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }, []);

    const redraw = useCallback(() => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (bgImageRef.current && imageUploaded) {
        const img = bgImageRef.current;
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      }
    }, [getCtx, imageUploaded]);

    const drawFreehand = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const ctx = getCtx();
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? brushSize * 5 : brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (tool === 'marker') ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      },
      [getCtx, tool, color, brushSize]
    );

    const drawLine = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const ctx = getCtx();
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.stroke();
      },
      [getCtx, color, brushSize]
    );

    const drawShape = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }) => {
        const ctx = getCtx();
        if (!ctx) return;
        const w = to.x - from.x;
        const h = to.y - from.y;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = brushSize;
        if (tool === 'rect') {
          ctx.strokeRect(from.x, from.y, w, h);
        } else if (tool === 'circle') {
          const cx = (from.x + to.x) / 2;
          const cy = (from.y + to.y) / 2;
          const r = Math.sqrt(w * w + h * h) / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.abs(r), 0, Math.PI * 2);
          ctx.stroke();
        }
      },
      [getCtx, tool, color, brushSize]
    );

    const handleImageUpload = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const img = new Image();
        img.onload = () => {
          bgImageRef.current = img;
          setImageUploaded(true);
          redraw();
          onCanvasChange?.(true);
        };
        img.src = URL.createObjectURL(file);
        e.target.value = '';
      },
      [redraw, onCanvasChange]
    );

    const startDraw = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const isCanvasClick = target === canvasRef.current;
        if (!isCanvasClick) return;

        const coords = getCoords(e);
        if (!coords) return;
        const { x, y } = coords;
        setStartPos({ x, y });
        setIsDrawing(true);

        if (['rect', 'circle', 'line'].includes(tool)) {
          pushHistory();
          const ctx = getCtx();
          const canvas = canvasRef.current;
          if (ctx && canvas) {
            shapeSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          }
        }
        if (['pencil', 'pen', 'marker', 'eraser'].includes(tool)) {
          pushHistory();
          const ctx = getCtx();
          if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = tool === 'eraser' ? brushSize * 5 : brushSize;
            ctx.lineCap = 'round';
            if (tool === 'marker') ctx.globalAlpha = 0.5;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      },
      [getCoords, getCtx, tool, color, brushSize, pushHistory]
    );

    const moveDraw = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing || !startPos) return;
        
        const coords = getCoords(e);
        if (!coords) return;
        const { x, y } = coords;

        if (['pencil', 'pen', 'marker', 'eraser'].includes(tool)) {
          drawFreehand(startPos, { x, y });
          setStartPos({ x, y });
        } else if (['rect', 'circle', 'line'].includes(tool) && shapeSnapshotRef.current) {
          const ctx = getCtx();
          const canvas = canvasRef.current;
          if (ctx && canvas) {
            ctx.putImageData(shapeSnapshotRef.current, 0, 0);
            if (tool === 'line') {
              drawLine(startPos, { x, y });
            } else {
              drawShape(startPos, { x, y });
            }
          }
        }
      },
      [isDrawing, startPos, getCoords, tool, drawFreehand, drawLine, drawShape, getCtx]
    );

    const endDraw = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing || !startPos) {
          setIsDrawing(false);
          setStartPos(null);
          return;
        }
        const coords = getCoords(e);
      if (!coords) {
        setIsDrawing(false);
        setStartPos(null);
        return;
      }

      const { x, y } = coords;

        if (tool === 'line' || ['rect', 'circle'].includes(tool)) {
          const ctx = getCtx();
          const canvas = canvasRef.current;
          if (shapeSnapshotRef.current && ctx && canvas) {
            ctx.putImageData(shapeSnapshotRef.current, 0, 0);
            if (tool === 'line') {
              drawLine(startPos, { x, y });
            } else {
              drawShape(startPos, { x, y });
            }
            shapeSnapshotRef.current = null;
          }
        }

        setIsDrawing(false);
        setStartPos(null);
        onCanvasChange?.(true);
      },
      [isDrawing, startPos, getCoords, tool, drawLine, drawShape, getCtx, onCanvasChange]
    );

    const clear = useCallback(() => {
      bgImageRef.current = null;
      setImageUploaded(false);
      setHistory([]);
      setRedoStack([]);
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onCanvasChange?.(false);
    }, [getCtx, onCanvasChange]);

    useEffect(() => {
      redraw();
    }, [redraw]);

    const getBlob = useCallback((): Promise<Blob | null> => {
      return new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          resolve(null);
          return;
        }
        canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
      });
    }, []);

    useImperativeHandle(ref, () => ({ getBlob, clear }), [getBlob, clear]);

    return (
      <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1">
            {(
              [
                ['pen', PenLine, 'Pen'],
                ['pencil', Pencil, 'Pencil'],
                ['marker', Highlighter, 'Marker'],
                ['eraser', Eraser, 'Eraser'],
                ['line', Minus, 'Line'],
                ['rect', Square, 'Rectangle'],
                ['circle', Circle, 'Circle'],
              ] as const
            ).map(([t, Icon, label]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                title={label}
                className={`p-2 rounded-lg ${tool === t ? 'bg-brand-blue text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer p-2 rounded-lg bg-white text-slate-600 hover:bg-slate-100">
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {tool !== 'eraser' && (
            <>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-900' : 'border-slate-300'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
              </div>
            </>
          )}

          {['pencil', 'pen', 'marker', 'eraser'].includes(tool) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Size:</span>
              <input
                type="range"
                min={1}
                max={tool === 'marker' ? 20 : tool === 'eraser' ? 30 : 10}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24"
              />
            </div>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={undo}
              disabled={history.length === 0}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={clear}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-2 overflow-hidden">
        <div
          ref={containerRef}
          className="relative w-full"
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block w-full rounded-lg border border-slate-200 cursor-crosshair touch-none"
            style={{
              height: `${height}px`,
              maxHeight: '70vh',
            }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={endDraw}
            onTouchCancel={endDraw}
          />
        </div>
      </div>

        <p className="text-xs text-slate-500 px-3 pb-2">
          {tool === 'line' && 'Click and drag to draw a line'}
          {tool === 'rect' && 'Click and drag to draw rectangle'}
          {tool === 'circle' && 'Click and drag to draw circle'}
          {!['line', 'rect', 'circle'].includes(tool) && 'Draw your product design or details above'}
        </p>
      </div>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;
