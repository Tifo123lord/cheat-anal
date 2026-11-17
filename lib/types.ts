export type LicenseType = 'Personal' | 'Commercial' | 'Extended';

export const LICENSE_TYPES: readonly LicenseType[] = ['Personal', 'Commercial', 'Extended'];

export type Badge = 'NEW' | 'BESTSELLER' | 'SALE' | 'FREE';

/** Which generated artwork family a product preview uses (see lib/art.ts). */
export type ArtKind =
  | 'browser'
  | 'uikit'
  | 'type'
  | 'icons'
  | 'device'
  | 'shape3d'
  | 'gradient'
  | 'book'
  | 'code'
  | 'illustration'
  | 'texture'
  | 'motion';

export interface License {
  type: LicenseType;
  price: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  tags: string[];
  fileTypes: string[];
  fileSize: string;
  /** Extension of an admin-uploaded download (lower case, no dot; '' when it has none). */
  fileExt?: string;
  version: string;
  compatibility: string[];
  licenses: License[];
  /** Preview descriptors, `<artKind>:<variant>`; rendered to SVG by lib/art.ts. */
  images: string[];
  authorId: string;
  rating: number;
  votes: number;
  sales: number;
  badges: Badge[];
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  avatarSeed: number;
  bio: string;
  sales: number;
  rating: number;
  location: string;
  joined: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  art: ArtKind;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  price: number;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  authorId: string;
  art: string;
}

export interface CartLine {
  kind: 'product' | 'bundle';
  /** product id or bundle id */
  id: string;
  license: LicenseType;
}

export interface OrderItem {
  kind: 'product' | 'bundle';
  id: string;
  title: string;
  license: LicenseType;
  price: number;
  licenseKey: string;
  downloads: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  coupon?: string;
  email: string;
  name: string;
  /** Account that placed the order (the library shows only the signed-in user's orders). */
  ownerEmail?: string;
  createdAt: string;
  licenseKeys: string[];
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}
