import { BsX } from 'react-icons/bs';
import cn from 'classnames';

type HighlightedBarProps = {
  onClose?: (e: React.SyntheticEvent) => void;
  variant?: 'luxury' | 'gold' | 'diamond' | 'pearl' | 'white';
  className?: string;
};

const variantBasedClasses = {
  luxury: 'bg-gradient-to-r from-black via-[#353839] to-black text-brand-light',   // Purple theme
  gold: 'bg-gradient-to-r from-black via-[#34495E] to-black text-brand-light',      // Navy theme
  diamond: 'bg-gradient-to-r from-black via-[#B8860B] to-black text-brand-light',   // change 
  pearl: 'bg-gradient-to-r from-black via-[#FFF8DC] to-black',
  white: 'bg-white text-brand-dark',
};

export default function HighlightedBar({
  variant = 'luxury',
  children,
  className,
}: React.PropsWithChildren<HighlightedBarProps>) {
  return (
    <div
      className={cn(
        'w-full min-h-[40px] py-2 px-4 md:px-6 lg:px-8 flex items-center justify-center relative text-sm border-b border-[#DAA520]/20',
        variantBasedClasses[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
