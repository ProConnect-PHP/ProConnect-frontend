export type PackageProductId = string;
export type ClientPackageId = string;
export type PackageSessionId = string;
export type ServiceId = string | number;
export type ProfessionalProfileId = string;
export type UserId = string;

export type ClientPackageStatus = 'active' | 'depleted' | 'expired' | 'cancelled';

export type PackageSessionStatus = 'reserved' | 'consumed' | 'released' | 'cancelled';

export interface PackageProductService {
  id: ServiceId;
  name: string;
  modality: string;
  duration_minutes: number;
}

export interface PackageProductProfessional {
  id: ProfessionalProfileId;
  user: {
    id: UserId;
    name: string;
    avatar_url: string | null;
  };
}

export interface PackageClientSummary {
  id: UserId;
  name: string;
  avatar_url: string | null;
}

export interface PackageProduct {
  id: PackageProductId;
  professional_id: ProfessionalProfileId;
  service_id: ServiceId | null;
  name: string;
  description: string | null;
  sessions_count: number;
  price: number;
  currency: string;
  validity_days: number | null;
  is_active: boolean;
  service?: PackageProductService | null;
  professional?: PackageProductProfessional | null;
  created_at: string | null;
}

export interface ClientPackage {
  id: ClientPackageId;
  package_product_id: PackageProductId;
  client_id: UserId;
  professional_id: ProfessionalProfileId;
  service_id: ServiceId | null;
  status: ClientPackageStatus;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  price_snapshot: number;
  currency: string;
  purchased_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  depleted_at: string | null;
  metadata: Record<string, unknown> | null;
  package_product?: PackageProduct | null;
  service?: PackageProductService | null;
  client?: PackageClientSummary | null;
  sessions?: PackageSession[];
  package_sessions?: PackageSession[];
  created_at: string | null;
}

export interface PackageSession {
  id: PackageSessionId;
  client_package_id: ClientPackageId;
  booking_id: string;
  client_id: UserId;
  professional_id: ProfessionalProfileId;
  status: PackageSessionStatus;
  consumed_at: string | null;
  released_at: string | null;
  metadata: Record<string, unknown> | null;
  booking?: {
    id: string;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
  } | null;
  created_at: string | null;
}

export interface PackagesPaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedPackageProducts {
  package_products: PackageProduct[];
  meta: PackagesPaginationMeta;
}

export interface PaginatedClientPackages {
  client_packages: ClientPackage[];
  meta: PackagesPaginationMeta;
}

export interface StorePackageProductPayload {
  service_id?: ServiceId | null;
  name: string;
  description?: string | null;
  sessions_count: number;
  price: number;
  currency?: string;
  validity_days?: number | null;
  is_active?: boolean;
}

export interface UpdatePackageProductPayload {
  service_id?: ServiceId | null;
  name?: string;
  description?: string | null;
  sessions_count?: number;
  price?: number;
  currency?: string;
  validity_days?: number | null;
  is_active?: boolean;
}

export interface PublicPackageProductListParams {
  page?: number;
  per_page?: number;
  service_id?: ServiceId;
  professional_id?: string;
  min_price?: number;
  max_price?: number;
  sessions_count?: number;
}

export interface ClientPackageListParams {
  page?: number;
  per_page?: number;
  status?: ClientPackageStatus;
  service_id?: ServiceId;
  professional_id?: ProfessionalProfileId;
}

export interface ProfessionalPackageProductListParams {
  page?: number;
  per_page?: number;
}

export interface ProfessionalSoldPackageListParams {
  page?: number;
  per_page?: number;
  status?: ClientPackageStatus;
  service_id?: ServiceId;
}
