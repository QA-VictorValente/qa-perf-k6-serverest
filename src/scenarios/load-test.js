import http from 'k6/http';
import { check, group } from 'k6';
import { ENDPOINTS, HEADERS } from '../config/environments.js';
import { LOAD_THRESHOLDS } from '../config/thresholds.js';
import { generateRandomUser } from '../payloads/user.payload.js';
import {
  usersApiDuration,
  loginDuration,
  productsApiDuration,
  successLogins,
  thinkTime,
  logIfFailed
} from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp-up to 5 VUs
    { duration: '20s', target: 5 },  // Steady load at 5 VUs
    { duration: '10s', target: 0 }   // Ramp-down to 0 VUs
  ],
  thresholds: LOAD_THRESHOLDS
};

export default function () {
  let createdUserId = null;
  const user = generateRandomUser();

  group('01 - Query Users Catalog', () => {
    const res = http.get(ENDPOINTS.USERS, { headers: HEADERS.DEFAULT });
    usersApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /usuarios');

    check(res, {
      'status is 200': (r) => r.status === 200,
      'has users list': (r) => {
        try {
          return Array.isArray(r.json().usuarios);
        } catch (_) {
          return false;
        }
      }
    });
  });

  thinkTime(0.5, 1.0);

  group('02 - User Registration & Auth', () => {
    // Register
    const createRes = http.post(
      ENDPOINTS.USERS,
      JSON.stringify(user),
      { headers: HEADERS.DEFAULT }
    );
    usersApiDuration.add(createRes.timings.duration);
    logIfFailed(createRes, 'POST /usuarios');

    const createdOk = check(createRes, {
      'user created (201)': (r) => r.status === 201
    });

    if (createdOk) {
      try {
        createdUserId = createRes.json()._id;
      } catch (_) {}

      thinkTime(0.3, 0.8);

      // Login
      const loginPayload = JSON.stringify({
        email: user.email,
        password: user.password
      });

      const loginRes = http.post(ENDPOINTS.LOGIN, loginPayload, {
        headers: HEADERS.DEFAULT
      });
      loginDuration.add(loginRes.timings.duration);
      logIfFailed(loginRes, 'POST /login');

      const loginOk = check(loginRes, {
        'login successful (200)': (r) => r.status === 200,
        'token present': (r) => {
          try {
            return !!r.json().authorization;
          } catch (_) {
            return false;
          }
        }
      });

      if (loginOk) {
        successLogins.add(1);
      }

      // Cleanup
      if (createdUserId) {
        const delRes = http.del(`${ENDPOINTS.USERS}/${createdUserId}`, null, {
          headers: HEADERS.DEFAULT
        });
        check(delRes, {
          'user cleaned up (200)': (r) => r.status === 200
        });
      }
    }
  });

  thinkTime(0.5, 1.0);

  group('03 - Browse Products', () => {
    const res = http.get(ENDPOINTS.PRODUCTS, { headers: HEADERS.DEFAULT });
    productsApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /produtos');

    check(res, {
      'products status 200': (r) => r.status === 200
    });
  });

  thinkTime(0.5, 1.2);
}
