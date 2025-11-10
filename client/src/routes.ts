// src/routes.ts
export const routes = {
  products: '/products',
  product: (id: string) => `/products/${id}`,
  viewer: (id: string) => `/products/${id}/viewer`,
};
