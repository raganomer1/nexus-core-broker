import React, { useCallback, useRef, useState } from 'react';

interface ResizableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  minWidth?: number;
  initialWidth?: number;
}

export function ResizableTh({ children, className = '', minWidth = 40, initialWidth, style, ...props }: ResizableThProps) {
  const [width, setWidth] = useState<number | undefined>(initialWidth);
  const thRef = useRef<HTMLTableCellElement>(null);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startW.current = thRef.current?.offsetWidth || 100;

    const onMouseMove = (ev: MouseEvent) => {
      const diff = ev.clientX - startX.current;
      setWidth(Math.max(minWidth, startW.current + diff));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [minWidth]);

  return (
    <th
      ref={thRef}
      className={`relative ${className}`}
      style={{ ...style, width: width ? `${width}px` : undefined, minWidth: `${minWidth}px` }}
      {...props}
    >
      {children}
      <div
        onMouseDown={onMouseDown}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60 z-10"
        style={{ touchAction: 'none' }}
      />
    </th>
  );
}
