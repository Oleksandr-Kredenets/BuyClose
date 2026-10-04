// src/types/index.ts
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  directDeliveryFee: number;
  minFreeDelivery: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  storeName: string;
  storeAddress: string;
  image: string;
  category: string;
  distanceKm: number;
  coordinates: Coordinates;
  rating?: number;
  weightOrUnit?: string;
  inStock?: boolean;
}

export type OrderStatus = 'packing' | 'delivery' | 'completed';

export interface OrderItem {
  productId: string;
  productName: string;
  storeName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  receiptNumber: string;
  date: string;
  timestamp: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'combined' | 'direct';
  storeNames: string[];
  deliveryAddress: string;
  courierLocation?: {
    lat: number;
    lng: number;
    courierName: string;
    vehicle: string;
    etaMinutes: number;
    stepText: string;
  };
}

export interface PaymentCard {
  id: string;
  cardholderName: string;
  cardNumberMasked: string;
  expiryDate: string;
  brand: 'visa' | 'mastercard' | 'store_loyalty';
  storeAffinity: string; // e.g., 'ATB Card', 'Silpo Rewards', 'Universal'
  isDefault?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'security' | 'promo';
  read: boolean;
  orderId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  addressCoordinates: Coordinates;
  useDeviceGps: boolean;
}

export type SortMode = 'closest' | 'cheapest' | 'expensive';

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryMode = 'combined' | 'direct';
