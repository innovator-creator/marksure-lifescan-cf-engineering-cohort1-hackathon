export type ProductStatus =
  | 'verified_safe'
  | 'under_review'
  | 'suspected_counterfeit'
  | 'recalled'
  | 'unknown';

export type ProductCategory = 'medicine' | 'cosmetic' | 'food';

export type ProductSource =
  | 'marksure'
  | 'open_food_facts'
  | 'open_beauty_facts'
  | 'openfda'
  | 'upc_lookup';

export type AlertType = 'recall' | 'counterfeit_warning' | 'general' | 'new_product' | 'comment';
export type AlertSource = 'admin' | 'openfda';
export type ReportStatus = 'pending' | 'reviewed';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  manufacturer: string | null;
  manufacturer_verified: boolean;
  country_of_origin: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  barcode: string | null;
  qr_code: string | null;
  image_url: string | null;
  status: ProductStatus;
  verified_by_authority: boolean;
  trust_score: number;
  source: ProductSource;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  product_id: string | null;
  description: string;
  image_url: string | null;
  anonymous: boolean;
  status: ReportStatus;
  created_at: string;
}

export interface AlertProduct {
  name: string;
  image_url: string | null;
  category: string;
}

export interface Alert {
  id: string;
  product_id: string | null;
  title: string;
  message: string;
  type: AlertType;
  source: AlertSource;
  external_ref: string | null;
  created_at: string;
  products?: AlertProduct | null;
}

export interface TrustScoreHistory {
  id: string;
  product_id: string;
  score: number;
  reason: string;
  created_at: string;
}