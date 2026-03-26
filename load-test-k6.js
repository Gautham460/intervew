import http from 'k6/http';
import { check, sleep } from 'k6';

// This is a k6 load test script specifically tailored for the Intervue platform.
// It simulates multiple Virtual Users (VUs) interacting with the system concurrently.

export const options = {
  // Test stages: ramp up, peak load, ramp down
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 },  // Maintain peak load of 50 concurrent users
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    // 95% of requests should be below 2 seconds
    http_req_duration: ['p(95)<2000'], 
    // Success rate should be above 99%
    http_req_failed: ['rate<0.01'], 
  },
};

export default function () {
  // 1. Simulate a user visiting the landing page
  // Vite is listening on [::1]:5173
  let res = http.get('http://[::1]:5173/', {
    headers: {
      'Host': '[::1]:5173',
      'User-Agent': 'curl/8.18.0',
      'Accept': '*/*'
    }
  }); 
  
  if (res.status !== 200) {
     console.log('Request failed! URL: ' + res.url + ' Status: ' + res.status + ' Error code: ' + res.error_code);
  }

  check(res, { 'status is 200': (r) => r.status === 200 });
  
  sleep(1);
}
