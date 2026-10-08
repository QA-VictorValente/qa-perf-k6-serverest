import http from 'k6/http';
import { check, group } from 'k6';
import { ENDPOINTS, HEADERS } from '../config/environments.js';
import { SMOKE_THRESHOLDS } from '../config/thresholds.js';
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
  vus: 1,
  iterations: 3,
  thresholds: SMOKE_THRESHOLDS
};

export default function () {
  let createdUserId = null;
  const user = generateRandomUser();

  group('01 - Get Users List', () => {
    const res = http.get(ENDPOINTS.USERS, { headers: HEADERS.DEFAULT });
    usersApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /usuarios');

    check(res, {
      'GET /usuarios status is 200': (r) => r.status === 200,
      'GET /usuarios response contains usuarios': (r) => {
        try {
          const json = r.json();
          return Array.isArray(json.usuarios);
        } catch (_) {
          return false;
        }
      }
    });
  });

  thinkTime(0.3, 0.7);

  group('02 - User Registration & Login Flow', () => {
    // 1. Create User
    const createRes = http.post(
      ENDPOINTS.USERS,
      JSON.stringify(user),
      { headers: HEADERS.DEFAULT }
    );
    usersApiDuration.add(createRes.timings.duration);
    logIfFailed(createRes, 'POST /usuarios');

    const createdOk = check(createRes, {
      'POST /usuarios status is 201': (r) => r.status === 201,
      'POST /usuarios returns ID': (r) => {
        try {
          const json = r.json();
          createdUserId = json._id;
          return !!json._id;
        } catch (_) {
          return false;
        }
      }
    });

    if (createdOk && createdUserId) {
      thinkTime(0.2, 0.5);

      // 2. Perform Login
      const loginPayload = JSON.stringify({
        email: user.email,
        password: user.password
      });

      const loginRes = http.post(ENDPOINTS.LOGIN, loginPayload, {
        headers: HEADERS.DEFAULT
      });
      loginDuration.add(loginRes.timings.duration);
      logIfFailed(loginRes, 'POST /login');

      check(loginRes, {
        'POST /login status is 200': (r) => r.status === 200,
        'POST /login returns authorization token': (r) => {
          try {
            const json = r.json();
            return !!json.authorization;
          } catch (_) {
            return false;
          }
        }
      });

      if (loginRes.status === 200) {
        successLogins.add(1);
      }

      // 3. Cleanup created user
      const deleteRes = http.del(`${ENDPOINTS.USERS}/${createdUserId}`, null, {
        headers: HEADERS.DEFAULT
      });
      check(deleteRes, {
        'DELETE /usuarios/{id} status is 200': (r) => r.status === 200
      });
    }
  });

  thinkTime(0.3, 0.7);

  group('03 - Get Products List', () => {
    const res = http.get(ENDPOINTS.PRODUCTS, { headers: HEADERS.DEFAULT });
    productsApiDuration.add(res.timings.duration);
    logIfFailed(res, 'GET /produtos');

    check(res, {
      'GET /produtos status is 200': (r) => r.status === 200,
      'GET /produtos contains produtos array': (r) => {
        try {
          const json = r.json();
          return Array.isArray(json.produtos);
        } catch (_) {
          return false;
        }
      }
    });
  });
}
