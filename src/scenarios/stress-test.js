import http from 'k6/http';
import { check, group } from 'k6';
import { ENDPOINTS, HEADERS } from '../config/environments.js';
import { STRESS_THRESHOLDS } from '../config/thresholds.js';
import { generateRandomUser } from '../payloads/user.payload.js';
import {
  usersApiDuration,
  loginDuration,
  productsApiDuration,
  thinkTime,
  logIfFailed
} from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // Stage 1: Quick warm up
    { duration: '15s', target: 20 }, // Stage 2: Heavy load
    { duration: '15s', target: 30 }, // Stage 3: Stress peak
    { duration: '10s', target: 0 }   // Stage 4: Cool down recovery
  ],
  thresholds: STRESS_THRESHOLDS
};

export default function () {
  const user = generateRandomUser();

  group('Stress - Users Catalog', () => {
    const res = http.get(ENDPOINTS.USERS, { headers: HEADERS.DEFAULT });
    usersApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /usuarios');

    check(res, {
      'status is 200': (r) => r.status === 200
    });
  });

  thinkTime(0.2, 0.6);

  group('Stress - User Flow', () => {
    const createRes = http.post(
      ENDPOINTS.USERS,
      JSON.stringify(user),
      { headers: HEADERS.DEFAULT }
    );
    usersApiDuration.add(createRes.timings.duration);
    logIfFailed(createRes, 'POST /usuarios');

    let userId = null;
    if (createRes.status === 201) {
      try {
        userId = createRes.json()._id;
      } catch (_) {}

      const loginRes = http.post(
        ENDPOINTS.LOGIN,
        JSON.stringify({ email: user.email, password: user.password }),
        { headers: HEADERS.DEFAULT }
      );
      loginDuration.add(loginRes.timings.duration);
      logIfFailed(loginRes, 'POST /login');

      check(loginRes, {
        'login is 200': (r) => r.status === 200
      });

      if (userId) {
        http.del(`${ENDPOINTS.USERS}/${userId}`, null, { headers: HEADERS.DEFAULT });
      }
    }
  });

  thinkTime(0.2, 0.6);

  group('Stress - Products Catalog', () => {
    const res = http.get(ENDPOINTS.PRODUCTS, { headers: HEADERS.DEFAULT });
    productsApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /produtos');

    check(res, {
      'products status is 200': (r) => r.status === 200
    });
  });

  thinkTime(0.2, 0.5);
}
