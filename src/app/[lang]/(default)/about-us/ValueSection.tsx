// ValuesSection.tsx
import React from 'react';

interface ValueCardProps {
  title: string;
  description: string;
  bgColor: string;
}

const ValueCard: React.FC<ValueCardProps> = ({
  title,
  description,
  bgColor,
}) => {
  return (
    <div
      className={`${bgColor} hover:cursor-pointer group flex flex-col items-center justify-center py-16 px-8 text-white transition-all duration-500 hover:${bgColor.replace('bg-', 'bg-')} overflow-hidden relative`}
    >
      <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
        <h3 className="text-xl font-semibold mb-3 group-hover:scale-105 transition-all ">
          {title}
        </h3>
        <p className="text-sm opacity-90 group-hover:text-yellow-100">
          {description}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
    </div>
  );
};
const ValuesSection: React.FC = () => {
  const values = [
    {
      title: 'Honesty',
      description:
        'We pride on truthfulness with each other, with our customers, with our vendors and in our business records. We expect and value openness.',
      bgColor: 'bg-blue-900',
    },
    {
      title: 'Integrity',
      description:
        "We act in accordance with our values, even when it's difficult.",
      bgColor: 'bg-red-600',
    },
    {
      title: 'Respect',
      description:
        'We treat all with dignity and value the opinions and perspectives of others.',
      bgColor: 'bg-blue-900',
    },
    {
      title: 'Diversity',
      description:
        'We seek and embrace differences in the backgrounds, cultures and experiences of our customers, members and vendors.',
      bgColor: 'bg-red-600',
    },
    {
      title: 'Safety',
      description:
        'We protect our customers and each other from injury with a commitment to a secure and safe shopping environment.',
      bgColor: 'bg-blue-900',
    },
    {
      title: 'Inclusion',
      description:
        'We encourage and expect collaboration, teamwork and the active inclusion of all team members.',
      bgColor: 'bg-red-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-8 px-6 md:px-0">
        Our Values
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {values.map((value, index) => (
          <ValueCard
            key={index}
            title={value.title}
            description={value.description}
            bgColor={value.bgColor}
          />
        ))}
      </div>
    </div>
  );
};

export default ValuesSection;
