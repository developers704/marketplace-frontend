import Image from 'next/image';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string | number;
}

export function StatCard({ Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm h-[130px] flex items-center gap-4 w-full">
      {/* <div className="w-10 h-10">
        <Image
          src={icon}
          alt={label}
          width={40}
          height={40}
          unoptimized
          className="w-full h-full object-contain"
        />
      </div> */}
         <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" strokeWidth={2} />
      </div>

      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
