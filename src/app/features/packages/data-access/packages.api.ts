import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  ClientPackage,
  ClientPackageId,
  ClientPackageListParams,
  PackageProduct,
  PackageProductId,
  PaginatedClientPackages,
  PaginatedPackageProducts,
  ProfessionalPackageProductListParams,
  ProfessionalSoldPackageListParams,
  PublicPackageProductListParams,
  PurchasePackagePayload,
  ServiceId,
  StorePackageProductPayload,
  UpdatePackageProductPayload,
} from './packages.models';
import {
  unwrapClientPackageResponse,
  unwrapClientPackagesResponse,
  unwrapPackageProductResponse,
  unwrapPackageProductsResponse,
  unwrapServicePackageProductsResponse,
} from './packages.mapper';

type ApiParams = Record<string, string | number | boolean | null | undefined>;
type PackageListParams =
  | PublicPackageProductListParams
  | ClientPackageListParams
  | ProfessionalPackageProductListParams
  | ProfessionalSoldPackageListParams;

@Injectable({ providedIn: 'root' })
export class PackagesApi {
  private readonly api = inject(ApiClient);

  listPublicPackageProducts(
    params: PublicPackageProductListParams = {},
  ): Observable<PaginatedPackageProducts> {
    return this.api
      .get<unknown>('public/package-products', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPackageProductsResponse(response)));
  }

  getPublicPackageProduct(packageProductId: PackageProductId): Observable<PackageProduct> {
    return this.api
      .get<unknown>(`public/package-products/${packageProductId}`)
      .pipe(map((response) => unwrapPackageProductResponse(response)));
  }

  listServicePackageProducts(serviceId: ServiceId): Observable<PackageProduct[]> {
    return this.api
      .get<unknown>(`services/${serviceId}/package-products`)
      .pipe(map((response) => unwrapServicePackageProductsResponse(response)));
  }

  purchasePackage(
    packageProductId: PackageProductId,
    payload: PurchasePackagePayload = {},
  ): Observable<ClientPackage> {
    return this.api
      .post<unknown, PurchasePackagePayload>(
        `package-products/${packageProductId}/purchase`,
        payload,
      )
      .pipe(map((response) => unwrapClientPackageResponse(response)));
  }

  listMyClientPackages(
    params: ClientPackageListParams = {},
  ): Observable<PaginatedClientPackages> {
    return this.api
      .get<unknown>('client-packages/my', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapClientPackagesResponse(response)));
  }

  getClientPackage(clientPackageId: ClientPackageId): Observable<ClientPackage> {
    return this.api
      .get<unknown>(`client-packages/${clientPackageId}`)
      .pipe(map((response) => unwrapClientPackageResponse(response)));
  }

  listProfessionalPackageProducts(
    params: ProfessionalPackageProductListParams = {},
  ): Observable<PaginatedPackageProducts> {
    return this.api
      .get<unknown>('professional/package-products', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPackageProductsResponse(response)));
  }

  createProfessionalPackageProduct(
    payload: StorePackageProductPayload,
  ): Observable<PackageProduct> {
    return this.api
      .post<unknown, StorePackageProductPayload>('professional/package-products', payload)
      .pipe(map((response) => unwrapPackageProductResponse(response)));
  }

  getProfessionalPackageProduct(packageProductId: PackageProductId): Observable<PackageProduct> {
    return this.api
      .get<unknown>(`professional/package-products/${packageProductId}`)
      .pipe(map((response) => unwrapPackageProductResponse(response)));
  }

  updateProfessionalPackageProduct(
    packageProductId: PackageProductId,
    payload: UpdatePackageProductPayload,
  ): Observable<PackageProduct> {
    return this.api
      .put<unknown, UpdatePackageProductPayload>(
        `professional/package-products/${packageProductId}`,
        payload,
      )
      .pipe(map((response) => unwrapPackageProductResponse(response)));
  }

  deleteProfessionalPackageProduct(packageProductId: PackageProductId): Observable<void> {
    return this.api
      .delete<unknown>(`professional/package-products/${packageProductId}`)
      .pipe(map(() => undefined));
  }

  listProfessionalSoldPackages(
    params: ProfessionalSoldPackageListParams = {},
  ): Observable<PaginatedClientPackages> {
    return this.api
      .get<unknown>('professional/client-packages', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapClientPackagesResponse(response)));
  }

  getProfessionalSoldPackage(clientPackageId: ClientPackageId): Observable<ClientPackage> {
    return this.api
      .get<unknown>(`professional/client-packages/${clientPackageId}`)
      .pipe(map((response) => unwrapClientPackageResponse(response)));
  }

  private toApiParams(params: PackageListParams): ApiParams {
    return { ...params };
  }
}
