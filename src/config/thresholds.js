/**
 * Global SLA Threshold definitions for k6 performance testing
 */

export const SMOKE_THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests must complete below 500ms
  http_req_failed: ['rate<0.01'],                  // HTTP failure rate below 1%
  checks: ['rate>0.99']                            // Assertions pass rate above 99%
};

export const LOAD_THRESHOLDS = {
  http_req_duration: ['p(95)<800', 'p(99)<1500'], // Under sustained load, p95 below 800ms
  http_req_failed: ['rate<0.02'],                  // HTTP failure rate below 2%
  checks: ['rate>0.98']
};

export const STRESS_THRESHOLDS = {
  http_req_duration: ['p(95)<2000', 'p(99)<3500'], // High load breaking point threshold
  http_req_failed: ['rate<0.05'],                   // Error rate under extreme load below 5%
  checks: ['rate>0.95']
};
