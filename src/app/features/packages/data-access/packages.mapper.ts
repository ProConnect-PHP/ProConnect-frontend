import {
  ClientPackage,
  ClientPackageStatus,
  PackageClientSummary,
  PackageProduct,
  PackageProductProfessional,
  PackageProductService,
  PackageSession,
  PackageSessionStatus,
  PackagesPaginationMeta,
  PaginatedClientPackages,
  PaginatedPackageProducts,
  ServiceId,
} from './packages.models';

type UnknownRecord = Record<string, unknown>;

const emptyMeta: PackagesPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

const clientPackageStatuses: ClientPackageStatus[] = [
  'active',
  'depleted',
  'expired',
  'cancelled',
];

const packageSessionStatuses: PackageSessionStatus[] = [
  'reserved',
  'consumed',
  'released',
  'cancelled',
];

export function unwrapPackageProductResponse(response: unknown): PackageProduct {
  const body = unwrapApiData(response);
  const packageProduct =
    isRecord(body) && 'package_product' in body ? body['package_product'] : body;

  return mapPackageProduct(packageProduct);
}

export function unwrapPackageProductsResponse(response: unknown): PaginatedPackageProducts {
  const body = unwrapApiData(response);

  if (!isRecord(body)) {
    return { package_products: [], meta: emptyMeta };
  }

  const packageProductsValue = Array.isArray(body['package_products'])
    ? body['package_products']
    : [];
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    package_products: packageProductsValue.map((item) => mapPackageProduct(item)),
    meta: mapPaginationMeta(metaValue, packageProductsValue.length),
  };
}

export function unwrapServicePackageProductsResponse(response: unknown): PackageProduct[] {
  const body = unwrapApiData(response);

  if (Array.isArray(body)) return body.map((item) => mapPackageProduct(item));
  if (!isRecord(body)) return [];

  const value = Array.isArray(body['package_products']) ? body['package_products'] : [];
  return value.map((item) => mapPackageProduct(item));
}

export function unwrapClientPackageResponse(response: unknown): ClientPackage {
  const body = unwrapApiData(response);
  const clientPackage =
    isRecord(body) && 'client_package' in body ? body['client_package'] : body;

  return mapClientPackage(clientPackage);
}

export function unwrapClientPackagesResponse(response: unknown): PaginatedClientPackages {
  const body = unwrapApiData(response);

  if (!isRecord(body)) {
    return { client_packages: [], meta: emptyMeta };
  }

  const clientPackagesValue = Array.isArray(body['client_packages'])
    ? body['client_packages']
    : [];
  const metaValue = isRecord(body['meta']) ? body['meta'] : {};

  return {
    client_packages: clientPackagesValue.map((item) => mapClientPackage(item)),
    meta: mapPaginationMeta(metaValue, clientPackagesValue.length),
  };
}

export function mapPackageProduct(value: unknown): PackageProduct {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    professional_id: readString(record['professional_id']),
    service_id: readServiceId(record['service_id']),
    name: readString(record['name']) || 'Paquete de sesiones',
    description: readNullableString(record['description']),
    sessions_count: positiveInteger(record['sessions_count'], 1),
    price: readNumber(record['price']),
    currency: readString(record['currency']) || 'UYU',
    validity_days: readPositiveIntegerOrNull(record['validity_days']),
    is_active: readBoolean(record['is_active'], true),
    service: mapOptionalService(record['service']),
    professional: mapOptionalProfessional(record['professional']),
    created_at: readNullableString(record['created_at']),
  };
}

export function mapClientPackage(value: unknown): ClientPackage {
  const record = recordOrEmpty(value);
  const sessions = mapOptionalSessions(record['sessions'] ?? record['package_sessions']);

  return {
    id: readString(record['id']),
    package_product_id: readString(record['package_product_id']),
    client_id: readString(record['client_id']),
    professional_id: readString(record['professional_id']),
    service_id: readServiceId(record['service_id']),
    status: readClientPackageStatus(record['status']),
    total_sessions: positiveInteger(record['total_sessions'], 0),
    used_sessions: positiveInteger(record['used_sessions'], 0),
    remaining_sessions: positiveInteger(record['remaining_sessions'], 0),
    price_snapshot: readNumber(record['price_snapshot']),
    currency: readString(record['currency']) || 'UYU',
    purchased_at: readNullableString(record['purchased_at']),
    expires_at: readNullableString(record['expires_at']),
    cancelled_at: readNullableString(record['cancelled_at']),
    depleted_at: readNullableString(record['depleted_at']),
    metadata: readNullableRecord(record['metadata']),
    package_product: mapOptionalPackageProduct(record['package_product']),
    service: mapOptionalService(record['service']),
    client: mapOptionalClient(record['client']),
    sessions,
    package_sessions: sessions,
    created_at: readNullableString(record['created_at']),
  };
}

export function mapPackageSession(value: unknown): PackageSession {
  const record = recordOrEmpty(value);

  return {
    id: readString(record['id']),
    client_package_id: readString(record['client_package_id']),
    booking_id: readString(record['booking_id']),
    client_id: readString(record['client_id']),
    professional_id: readString(record['professional_id']),
    status: readPackageSessionStatus(record['status']),
    consumed_at: readNullableString(record['consumed_at']),
    released_at: readNullableString(record['released_at']),
    metadata: readNullableRecord(record['metadata']),
    booking: mapOptionalSessionBooking(record['booking']),
    created_at: readNullableString(record['created_at']),
  };
}

function unwrapApiData(response: unknown): unknown {
  if (!isRecord(response)) return response;

  const data = response['data'];
  if ('success' in response && data !== undefined) return data;

  return response;
}

function mapOptionalPackageProduct(value: unknown): PackageProduct | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  return mapPackageProduct(value);
}

function mapOptionalService(value: unknown): PackageProductService | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readServiceId(value['id']) ?? '',
    name: readString(value['name']) || 'Servicio',
    modality: readString(value['modality']),
    duration_minutes: positiveInteger(value['duration_minutes'], 0),
  };
}

function mapOptionalProfessional(value: unknown): PackageProductProfessional | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  const user = isRecord(value['user']) ? value['user'] : {};

  return {
    id: readString(value['id']),
    user: {
      id: readString(user['id']),
      name: readString(user['name']) || 'Profesional de ProConnect',
      avatar_url: readNullableString(user['avatar_url']),
    },
  };
}

function mapOptionalClient(value: unknown): PackageClientSummary | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    name: readString(value['name']) || 'Cliente',
    avatar_url: readNullableString(value['avatar_url']),
  };
}

function mapOptionalSessions(value: unknown): PackageSession[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => mapPackageSession(item));
}

function mapOptionalSessionBooking(
  value: unknown,
): { id: string; status: string; starts_at: string | null; ends_at: string | null } | null | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;

  return {
    id: readString(value['id']),
    status: readString(value['status']),
    starts_at: readNullableString(value['starts_at']),
    ends_at: readNullableString(value['ends_at']),
  };
}

function mapPaginationMeta(value: UnknownRecord, fallbackTotal: number): PackagesPaginationMeta {
  return {
    current_page: positiveInteger(value['current_page'], 1),
    per_page: positiveInteger(value['per_page'], Math.max(fallbackTotal, 10)),
    total: positiveInteger(value['total'], fallbackTotal),
    last_page: positiveInteger(value['last_page'], 1),
  };
}

function readClientPackageStatus(value: unknown): ClientPackageStatus {
  const text = readString(value);
  return clientPackageStatuses.includes(text as ClientPackageStatus)
    ? (text as ClientPackageStatus)
    : 'active';
}

function readPackageSessionStatus(value: unknown): PackageSessionStatus {
  const text = readString(value);
  return packageSessionStatuses.includes(text as PackageSessionStatus)
    ? (text as PackageSessionStatus)
    : 'reserved';
}

function readServiceId(value: unknown): ServiceId | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = readString(value);
  return text || null;
}

function readString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function readNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = readString(value);
  return text || null;
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return fallback;
}

function readNullableRecord(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  return value;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(readNumber(value));
  return parsed >= 0 ? parsed : fallback;
}

function readPositiveIntegerOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Math.trunc(readNumber(value));
  return parsed > 0 ? parsed : null;
}

function recordOrEmpty(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
