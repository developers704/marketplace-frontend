import { useQuery } from '@tanstack/react-query';

interface InventoryProduct {
  _id: string;
  name: string;
  sku: string;
}

export interface WarehouseInfo {
  _id: string;
  name: string;
  location: string;
  capacity: number | null;
  isActive: boolean;
  description: string;
  isMain?: boolean;
}

export interface Inventory {
  _id: string;
  product: InventoryProduct;
  productType: string;
  warehouse: WarehouseInfo[];
  city: {
    _id: string;
    name: string;
  };
  quantity: number;
  stockAlertThreshold: number;
  locationWithinWarehouse: string;
  lastRestocked: string;
  expiryDate: string;
  barcode: string;
  vat: number;
  expiryDateThreshold: number;
  productInfo: {
    name: string;
    sku: string;
  };
}

async function fetchInventories(): Promise<Inventory[]> {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  // Use the new backend endpoint which returns available inventories with
  // populated product details (image, prices, gallery)
  const response = await fetch(`${BASE_API}/api/inventory/available-detailed`);
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  return response.json();
}

export const useInventories = () => {
  return useQuery({
    queryKey: ['inventories'],
    queryFn: fetchInventories,
  });
};

// Helper function to check if an inventory is low on stock
export const isLowStock = (inventory: Inventory) => {
  return inventory.quantity <= inventory.stockAlertThreshold;
};

// Helper function to get warehouse display name
export const getWarehouseDisplayName = (warehouse: WarehouseInfo) => {
  return `${warehouse.name}${warehouse.isMain ? ' (Main)' : ''} - ${warehouse.location}`;
};