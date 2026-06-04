import {
  unwrapClientPackagesResponse,
  unwrapPackageProductResponse,
  unwrapPackageProductsResponse,
} from './packages.mapper';

describe('packages mapper', () => {
  it('unwraps direct package product responses', () => {
    const packageProduct = unwrapPackageProductResponse({
      package_product: {
        id: 'package-1',
        professional_id: 'professional-1',
        service_id: 'service-1',
        name: 'Pack 4 sesiones',
        description: 'Acompañamiento mensual',
        sessions_count: '4',
        price: '5600',
        currency: 'UYU',
        validity_days: '60',
        is_active: 1,
        created_at: null,
      },
    });

    expect(packageProduct.id).toBe('package-1');
    expect(packageProduct.sessions_count).toBe(4);
    expect(packageProduct.price).toBe(5600);
    expect(packageProduct.is_active).toBe(true);
  });

  it('unwraps ApiResponse package product lists', () => {
    const response = unwrapPackageProductsResponse({
      success: true,
      data: {
        package_products: [
          {
            id: 'package-1',
            professional_id: 'professional-1',
            name: 'Pack',
            sessions_count: 4,
            price: 5600,
            currency: 'UYU',
            is_active: true,
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      },
    });

    expect(response.package_products).toHaveLength(1);
    expect(response.meta.total).toBe(1);
  });

  it('unwraps paginated client packages', () => {
    const response = unwrapClientPackagesResponse({
      client_packages: [
        {
          id: 'client-package-1',
          package_product_id: 'package-1',
          client_id: 'client-1',
          professional_id: 'professional-1',
          status: 'active',
          total_sessions: 4,
          used_sessions: 1,
          remaining_sessions: 3,
          price_snapshot: 5600,
          currency: 'UYU',
        },
      ],
      meta: {
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1,
      },
    });

    expect(response.client_packages[0].remaining_sessions).toBe(3);
    expect(response.client_packages[0].status).toBe('active');
  });
});
