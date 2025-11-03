import Image from 'next/image';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm h-[130px] flex items-center gap-4 w-full">
      <div className="w-10 h-10">
        <Image
          src={icon}
          alt={label}
          width={40}
          height={40}
          className="w-full h-full object-contain"
        />
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
