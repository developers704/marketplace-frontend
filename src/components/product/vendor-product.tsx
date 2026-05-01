'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { productPlaceholder } from '@assets/placeholders';
import { useVendorProductQuery } from '@framework/catalogV2/get-vendor-product';
import { useSkuQuery } from '@framework/catalogV2/get-sku';
import type { VendorSkuLite } from '@framework/types/catalogV2';
import InventoryStatusBadge from '@components/marketplace/inventory-status-badge';
import B2BPurchasePanel from '@components/marketplace/b2b-purchase-panel';
import VendorProductAttributes from '@components/product/vendor-product-attributes';
import VendorProductReviews from '@components/product/vendor-product-reviews';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const buildImageUrl = (baseApi: string | undefined, src: string | undefined) => {
  if (!src) return productPlaceholder;
  const s = String(src).trim();
  if (!s) return productPlaceholder;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (!baseApi) return s.startsWith('/') ? s : `/${s}`;
  if (s.startsWith('/')) return `${baseApi}${s}`;
  return `${baseApi}/${s}`;
};

const unique = (arr: string[]) => Array.from(new Set(arr.filter((v) => String(v || '').trim() !== '')));

const VendorProductSingleDetails: React.FC<{
  lang: string;
  vendorProductId?: string | null;
  enableB2BPurchase?: boolean;
}> = ({ lang, vendorProductId, enableB2BPurchase = false }) => {
  const searchParams = useSearchParams();
  const productId = vendorProductId || searchParams.get('id');
  const sortParam = searchParams.get('sort');
  const filterMainParam = searchParams.get('filterMain');
  const filterOwnParam = searchParams.get('filterOwn');
  const isFilterMain = filterMainParam === 'true' || sortParam === 'isMain';
  const isFilterOwn = filterOwnParam === 'true' || sortParam === 'own-inventory';

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  
  const { data, isLoading, error } = useVendorProductQuery(productId, {
    filterMain: isFilterMain,
    filterOwn: isFilterOwn,
  });

  const skus = data?.skus ?? [];
  // console.log("skus",skus)
  const defaultSku = data?.defaultSku ?? null;

  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMetalType, setSelectedMetalType] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const selectedWarehouseQty = selectedWarehouse?.quantity || 0;
  const selectedWarehouseIsMain = selectedWarehouse?.warehouse?.isMain === true;
  const selectedWarehouseId = selectedWarehouse?.warehouse?._id;

  // Image zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Inventory expand/collapse state
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(false);

  useEffect(() => {
    if (!skus.length) return;
    let bestSku = skus.find((s:any) => (s.totalQuantity ?? 0) > 0)
    if (!bestSku && defaultSku?._id){
      bestSku = defaultSku;
    }
    if(!bestSku){
      bestSku = skus[0]
    }
    if (bestSku?._id) {
      setSelectedSkuId(String(bestSku?._id));
      setSelectedColor(String(defaultSku?.metalColor || ''));
      setSelectedSize(String(defaultSku?.size || ''));
      setSelectedMetalType(String(defaultSku?.metalType || ''));
    }
  }, [skus, defaultSku]);

  // Reset inventory expanded state and warehouse when SKU changes
  useEffect(() => {
    setIsInventoryExpanded(false);
    setSelectedWarehouse(null);
  }, [selectedSkuId]);

 const selectedSkuLite: VendorSkuLite | null =
  (selectedSkuId
    ? skus?.find((s: any) => String(s._id) === String(selectedSkuId))
    : null)
  ?? defaultSku
  ?? null;

  const { data: skuDetails, isLoading: skuLoading } = useSkuQuery(selectedSkuId, {
    filterMain: isFilterMain,
    filterOwn: isFilterOwn,
  });

  const inventories = skuDetails?.inventories ?? [];

  // Auto-select first available warehouse when inventories load (first time view)
  useEffect(() => {
    if (inventories.length === 0 || selectedWarehouse) return;
    // Prefer first warehouse with quantity > 0, else first warehouse
    const withStock = inventories.find((inv: any) => (inv?.quantity ?? 0) > 0);
    const first = withStock ?? inventories[0];
    if (first) setSelectedWarehouse(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuDetails?.inventories, selectedSkuId]);

// const hasMainWarehouse = useMemo(() => {
//   if (!inventories.length) return false;
//   return inventories.some(
//     (inv: any) => inv?.warehouse?.isMain === true
//   );
// }, [inventories]);

// // 👇 returns should come AFTER hooks
// if (!skuDetails) return null;

  const selectedSkuForTgaPrice = skus.find((s:any) => String(s._id) === String(selectedSkuId)
);
  const tagPrice = selectedSkuForTgaPrice?.tagPrice
  const displaySku = (skuDetails?.sku as any) || selectedSkuLite;
  const displayImages: string[] = displaySku?.images?.length ? displaySku?.images : [];
  const displayImage = displayImages?.[0] ? buildImageUrl(BASE_API, displayImages[0]) : productPlaceholder;

  const { price } = usePrice({
    amount: displaySku?.price ?? 0,
    currencyCode: displaySku?.currency ?? 'USD',
  });

  const filteredMetalTypes = useMemo(() => {
    if (!selectedColor) return unique(skus.map((s: any) => String(s?.metalType || '').trim()));
    return unique(
      skus
        .filter((s: any) => String(s?.metalColor || '').trim() === selectedColor)
        .map((s: any) => String(s?.metalType || '').trim()),
    );
  }, [skus, selectedColor]);

  const filteredSizes = useMemo(() => {
    return unique(
      skus
        .filter((s: any) => {
          if (selectedColor && String(s?.metalColor || '').trim() !== selectedColor) return false;
          if (selectedMetalType && String(s?.metalType || '').trim() !== selectedMetalType) return false;
          return true;
        })
        .map((s: any) => String(s.size || '').trim()),
    );
  }, [skus, selectedColor, selectedMetalType]);

  const pickSku = (opts: { color?: string; metalType?: string; size?: string }) => {
    const color = opts?.color ?? selectedColor;
    const metalType = opts?.metalType ?? selectedMetalType;
    const size = opts?.size ?? selectedSize;

    const exact = skus.find((s: any) => {
      if (color && String(s.metalColor || '').trim() !== color) return false;
      if (metalType && String(s.metalType || '').trim() !== metalType) return false;
      if (size && String(s.size || '').trim() !== size) return false;
      return true;
    });
    if (exact) return exact;

    // Relaxed fallback: match color + metalType
    const relaxed = skus.find((s: any) => {
      if (color && String(s?.metalColor || '').trim() !== color) return false;
      if (metalType && String(s?.metalType || '').trim() !== metalType) return false;
      return true;
    });
    if (relaxed) return relaxed;

    // Relaxed fallback: match color only
    const colorOnly = skus.find((s: any) => (color ? String(s?.metalColor || '').trim() === color : true));
    return colorOnly || skus[0] || null;
  };

  const handleSkuSelect = (skuId: string) => {
    const sku = skus?.find((s: any) => String(s._id) === String(skuId));
    if (!sku) return;
    setSelectedSkuId(String(sku?._id));
    setSelectedColor(String(sku?.metalColor || '').trim());
    setSelectedMetalType(String(sku?.metalType || '').trim());
    setSelectedSize(String(sku?.size || '').trim());
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const sku = pickSku({ color });
    if (sku?._id) handleSkuSelect(String(sku._id));
  };

  const handleMetalTypeSelect = (metalType: string) => {
    setSelectedMetalType(metalType);
    const sku = pickSku({ metalType });
    if (sku?._id) handleSkuSelect(String(sku._id));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const sku = pickSku({ size });
    if (sku?._id) handleSkuSelect(String(sku._id));
  };

  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-72 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="py-10">
        <p className="text-red-600 font-semibold">Failed to load vendor product.</p>
        <p className="text-sm text-gray-600">{error?.message}</p>
      </div>
    );
  }

  const product = data?.product;
  const price99 = displaySku?.attributes?.["99price"]
  // console.log("products of data", displaySku)
  const totalSelectedQty = skuDetails?.totalQuantity ?? (selectedSkuLite?.totalQuantity ?? 0);

  const skuLabel = (s: any) => {
    const parts = [s?.metalColor, s?.metalType, s?.size, ].filter(Boolean);
    const model =
    s?.attributes?.modelno ||
    product?.vendorModel || s?.sku  
    "";
    const sku = s?.sku || ""
    return `${parts.join(' / ') || ''} ${model} / ${sku}`;
    // ${s?.attributes?.modelno ? s?.attributes?.modelno : s?.vendorModel ? s?.vendorModel : ""}
  };
  const descriptionName =
  typeof displaySku?.attributes?.descriptionname === 'string'
    ? displaySku?.attributes?.descriptionname
    : displaySku?.sku || product?.title;


  return (
    <div className="space-y-8 py-6">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Image - Takes 2 columns (40%) */}
        <div className="lg:col-span-2 bg-white rounded-xl  p-4">
        <div
          ref={imageRef}
          className="relative w-full aspect-square rounded-lg overflow-hidden max-w-md mx-auto cursor-zoom-in"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={(e) => {
            if (!imageRef.current) return;
            const rect = imageRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMousePos({ x, y });
          }}
        >
          <div
            className="relative w-full h-full transition-transform duration-200 ease-out"
            style={{
              transform: isHovering ? 'scale(2.5)' : 'scale(1)',
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            }}
          >
            <Image src={displayImage} alt={product?.title || "-"} fill className="object-cover" />
          </div>
        </div>
        {displayImages?.length > 0 ? (
          <div className="grid grid-cols-5 gap-2 mt-3 max-w-md mx-auto">
            {displayImages?.slice(0, 5)?.map((img: string) => (
              <div key={img} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                <Image src={buildImageUrl(BASE_API, img)} alt="thumb" fill className="object-cover cursor-pointer" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right: Details + Selectors - Takes 3 columns (60%) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-ml font-bold text-gray-900 ">{descriptionName}</h1>
              <div className="text-sm text-gray-600 mt-1">
                {product?.brand ? <span className="mr-3">Brand: {product?.brand}</span> : null}
                {product?.category ? (
                  <span>
                    Category: {typeof product?.category === 'string' ? product?.category : (product?.category as any)?.name || 'N/A'}
                  </span>
                ) : null}
                {product?.subcategory && (
                  <span className="ml-3">
                    Subcategory: {typeof product?.subcategory === 'string' ? product?.subcategory : (product?.subcategory as any)?.name || 'N/A'}
                  </span>
                )}
                {product?.subsubcategory && (
                  <span className="ml-3">
                    Sub-subcategory: {typeof product?.subsubcategory === 'string' ? product?.subsubcategory : (product?.subsubcategory as any)?.name || 'N/A'}
                  </span>
                )}
              </div>
              {product?.vendorModel ? (
                <div className="text-xs text-gray-500 mt-1">Vendor Model: {product?.vendorModel || "-"}</div>
              ) : null}
              {price99 ? (
                <div className="text-xs text-gray-500 mt-1">99Price : {price99 || "-"}</div>
              ) : null}
              {/* {tagPrice ? (
                <div className="text-xs text-gray-500 mt-1">Tag Price : {tagPrice || "-"}</div>
              ) : null} */}
            </div>
            <div className="text-right">
              {/* <div className="flex justify-end mb-2">
                <InventoryStatusBadge quantity={totalSelectedQty} />
              </div> */}
              {/* <div className="text-lg font-bold text-brand-dark">{price}</div> */}
              
                 {tagPrice ? (
                <div className="text-lg font-bold text-brand-dark">${tagPrice || "-"}</div>
              ) : null}
              
              <div className="text-xs text-gray-500 gap-2">Selected SKU stock: {totalSelectedQty}
                  
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-end gap-2">
                <span>Total stock : {product?.totalInventory || "-" }</span>
                {/* <InventoryStatusBadge quantity={Number(product?.totalInventory || 0)} /> */}

              </div>
                <span className={cn(
            "flex items-center justify-center mt-2  gap-1 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md border shadow-sm transition",
            totalSelectedQty > 0
              ? " text-black"
              : "bg-red-500/90 text-white border-red-400"
          )}>
            {totalSelectedQty ? <FaCheckCircle /> : <FaTimesCircle />}
            {totalSelectedQty > 0 ? "In Stock" : "Out"}
          </span>
            </div>
          </div>
        </div>

        {/* SKU Dropdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-2">Select SKU Variant</div>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={selectedSkuId || ''}
            onChange={(e) => handleSkuSelect(e.target.value)}
          >
            {skus.map((s: any) => (
              <option key={s?._id} value={s?._id}>
                {skuLabel(s)}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-2">{skus?.length || "-"} SKUs under this vendor model</div>
        </div>

        {/* Option Selectors - only show when at least one option exists */}
        {(() => {
          const hasColors = unique((data?.availableColors || []) as string[]).length > 0;
          const hasMetalTypes = filteredMetalTypes.length > 0;
          const hasSizes = filteredSizes.length > 0;
          if (!hasColors && !hasMetalTypes && !hasSizes) return null;

          return (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              {hasColors && (
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Metal Color</div>
                  <div className="flex flex-wrap gap-2">
                    {unique((data?.availableColors || []) as string[]).map((c) => {
                      const active = selectedColor === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorSelect(c)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            active ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(hasMetalTypes || hasSizes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hasMetalTypes && (
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2">Metal Type</div>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={selectedMetalType || ''}
                        onChange={(e) => handleMetalTypeSelect(e.target.value)}
                      >
                        <option value="">Metal Type</option>
                        {filteredMetalTypes.map((m : any) => (
                          <option key={m} value={m}>
                            {m || ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {hasSizes && (
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2">Size</div>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={selectedSize || ''}
                        onChange={(e) => handleSizeSelect(e.target.value)}
                      >
                        <option value="">Size</option>
                        {filteredSizes.map((s : any) => (
                          <option key={s} value={s}>
                            {s || "-"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* Inventory Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-900">Inventory</div>
            <div className="text-xs text-gray-500">{skuLoading ? 'Loading…' : `Total: ${totalSelectedQty}`}</div>
          </div>

          {skuLoading ? (
            <div className="h-20 bg-gray-50 rounded animate-pulse" />
          ) : skuDetails?.inventories?.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      {/* <th className="py-2 pr-4">City</th> */}
                      <th className="py-2 pr-4">Store</th>
                      {/* <th className="py-2 pr-4">Warehouse _id</th> */}
                      <th className="py-2 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isInventoryExpanded 
                      ? skuDetails?.inventories 
                      : skuDetails.inventories.slice(0, 3)
                    ).sort((a :any, b :any) => (a.warehouse?.name === "MAIN" ? -1 : b.warehouse?.name === "MAIN" ? 1 : 0))
                    .map((inv: any) => (
                      <tr key={inv?._id}  onClick={() => setSelectedWarehouse(inv)}  className={cn(
                        "border-b last:border-b-0 cursor-pointer",
                        selectedWarehouse?._id === inv?._id && "bg-blue-50 border-blue-400"
                      )}>
                        {/* <td className="py-2 pr-4">{inv?.city?.name ?? '—'}</td> */}
                        <td className="py-2 pr-4">{inv?.warehouse?.name ?? '—'}</td>
                        {/* <td className="py-2 pr-4">{inv?.warehouse?._id ?? '—'}</td> */}
                        <td className="py-2 text-right font-semibold">{inv?.quantity ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {skuDetails.inventories.length > 3 && (
                <button
                  onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}
                  className="mt-3 w-full text-sm text-brand-blue hover:text-blue-700 font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  {isInventoryExpanded ? (
                    <>
                      <span>View Less</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>View More ({skuDetails?.inventories?.length - 3} more)</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-600">No inventory records found for this SKU.</div>
          )}
        </div>

        {/* B2B Purchase (Store Managers) */}
        {enableB2BPurchase ? (
          <B2BPurchasePanel
            lang={lang}
            vendorProductId={String(product?._id)}
            skuId={selectedSkuId}
            cpPrice={price}
            availableQty={selectedWarehouseQty}
            hasMainWarehouse={selectedWarehouseIsMain}
            warehouseId={selectedWarehouseId}
          />
        ) : null}

        {/* Product Attributes - Professional Display */}
      
        </div>
      </div>
          {displaySku?.attributes && (
          <VendorProductAttributes attributes={displaySku.attributes} />
        )}
      {/* Full Width Reviews Section */}
      <div>
        <VendorProductReviews 
          productId={String(product?._id)} 
          skuId={selectedSkuId}
          lang={lang} 
        />
      </div>
    </div>
  );
};

export default VendorProductSingleDetails;
