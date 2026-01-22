'use client';

import { CircleCheckBig, CircleSlash2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import cn from 'classnames';

export default function InventoryStatusBadge({
  quantity,
  className,
}: {
  quantity: number;
  className?: string;
}) {
  const inStock = (quantity || 0) > 0;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center cursor-default',
              className
            )}
          >
            {inStock ? (
              <CircleCheckBig size={24} className="text-blue-600" />
            ) : (
              <CircleSlash2 size={24} className="text-red-600" />
            )}
          </span>
        </Tooltip.Trigger>

        <Tooltip.Content
          side="top"
          align="center"
          className="z-50 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg"
        >
          {inStock ? 'In Stock' : 'Out of Stock'}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
