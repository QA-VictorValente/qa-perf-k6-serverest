/**
 * Dynamic test data generator for k6 virtual users
 */

export function generateRandomUser(overrides = {}) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return {
    nome: `k6 Perf User ${random}`,
    email: `k6_perf_${timestamp}_${random}@loadtest.com`,
    password: `pwd_${random}`,
    administrador: 'true',
    ...overrides
  };
}

export function generateRandomProduct(overrides = {}) {
  const random = Math.floor(Math.random() * 100000);
  return {
    nome: `Produto k6 Perf ${random}`,
    preco: Math.floor(Math.random() * 500) + 10,
    descricao: 'Produto gerado para teste de carga com k6',
    quantidade: Math.floor(Math.random() * 100) + 1,
    ...overrides
  };
}
