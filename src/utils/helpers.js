import { Trend, Counter, Rate } from 'k6/metrics';
import { sleep } from 'k6';

// Custom Performance Metrics
export const loginDuration = new Trend('login_duration_ms', true);
export const usersApiDuration = new Trend('users_api_duration_ms', true);
export const productsApiDuration = new Trend('products_api_duration_ms', true);

export const successLogins = new Counter('successful_logins_total');
export const failedRequests = new Counter('failed_requests_total');
export const errorRate = new Rate('custom_error_rate');

/**
 * Sleeps for a randomized duration between min and max seconds (simulating human think time)
 */
export function thinkTime(min = 0.5, max = 1.5) {
  const duration = Math.random() * (max - min) + min;
  sleep(duration);
}

/**
 * Logs structured diagnostic information when a check fails
 */
export function logIfFailed(res, description) {
  if (res.status >= 400) {
    failedRequests.add(1);
    errorRate.add(true);
    console.warn(`[WARN] ${description} returned status ${res.status}: ${res.body}`);
  } else {
    errorRate.add(false);
    successLogins.add(1);
  }
}
