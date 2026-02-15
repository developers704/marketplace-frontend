'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductAttributes {
  descriptionname?: string;
  subcategorydepartment?: string;
  style?: string;
  branddesign?: string;
  gender?: string;
  avgweight?: string;
  stonetype?: string;
  centerstone?: string;
  centercarat?: string;
  centershape?: string;
  centercolor?: string;
  centerclarity?: string;
  sidestone?: string;
  sidecarat?: string;
  sidecolor?: string;
  sideclarity?: string;
  [key: string]: any;
}

interface VendorProductAttributesProps {
  attributes: ProductAttributes;
}

const VendorProductAttributes: React.FC<VendorProductAttributesProps> = ({ attributes }) => {
  const [expanded, setExpanded] = useState(false);
  if (!attributes) return null;

  const formatValue = (val: any) =>
    !val || val === '0' || val === '' ? '—' : String(val).trim();

  const filterEmpty = (obj: Record<string, any>) =>
    Object.entries(obj).filter(([_, v]) => v && v !== '0');

  const renderSection = (title: string, data: Record<string, any>) => {
    const rows = filterEmpty(data);
    
    if (!rows.length) return null;

    return (
      <div className="rounded-lg bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
          {title}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              <span className="text-sm  text-gray-600 text-right">
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sections = [
    {
      title: 'General Information',
      data: {
        Description: attributes?.descriptionname,
        Style: attributes?.style,
        Subcategory: attributes?.subcategorydepartment,
        'Brand Design': attributes?.branddesign,
        Gender: attributes?.gender,
      },
    },
    {
      title: 'Metal Information',
      data: {
        'Average Weight': attributes?.avgweight
          ? `${attributes?.avgweight} g`
          : null,
      },
    },
    {
      title: 'Center Stone Details',
      data: {
        'Stone Type': attributes?.stonetype,
        Stone: attributes?.centerstone,
        Shape: attributes?.centershape,
        'Carat Weight': attributes?.centercarat
          ? `${attributes?.centercarat} ct`
          : null,
        Color: attributes?.centercolor,
        Clarity: attributes?.centerclarity,
      },
    },
    {
      title: 'Side Stone Details',
      data: {
        'Stone Type': attributes?.sidestone,
        'Carat Weight': attributes?.sidecarat
          ? `${attributes?.sidecarat} ct`
          : null,
        Color: attributes?.sidecolor,
        Clarity: attributes?.sideclarity,
      },
    },
  ].filter((s) => filterEmpty(s?.data)?.length > 0);

  const visible = expanded ? sections : sections?.slice(0, 2);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Product Specifications
        </h2>

        {sections?.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show More <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4">
        {visible.map((section) =>
          renderSection(section?.title, section?.data),
        )}
      </div>
    </section>
  );
};

export default VendorProductAttributes;
