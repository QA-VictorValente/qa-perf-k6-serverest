export const ENV = {
  BASE_URL: __ENV.BASE_URL || 'https://serverest.dev',
  TIMEOUT: '30s'
};

export const ENDPOINTS = {
  LOGIN: `${ENV.BASE_URL}/login`,
  USERS: `${ENV.BASE_URL}/usuarios`,
  PRODUCTS: `${ENV.BASE_URL}/produtos`,
  CARTS: `${ENV.BASE_URL}/carrinhos`
};

export const HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withAuth: (token) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token
  })
};
