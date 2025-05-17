# Test info

- Name: Resource Management >> should retrieve seeded resources via GET /api/resources
- Location: C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\resource-crud.spec.ts:7:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: undefined
    at forEach (C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\resource-crud.spec.ts:28:24)
    at C:\Users\Owner\Desktop\production-order-scheduler\src\tests\e2e\resource-crud.spec.ts:26:23
```

# Test source

```ts
   1 | // src/tests/e2e/resource-crud.spec.ts
   2 | import { test, expect } from '@playwright/test';
   3 |
   4 | const BASE_URL = 'http://localhost:3000';
   5 |
   6 | test.describe('Resource Management', () => {
   7 |   test('should retrieve seeded resources via GET /api/resources', async ({ request }) => {
   8 |     // Call the GET /api/resources endpoint
   9 |     const response = await request.get(`${BASE_URL}/api/resources`);
  10 |     
  11 |     // Verify the response status is 200
  12 |     expect(response.ok()).toBeTruthy();
  13 |     
  14 |     // Parse the response body
  15 |     const resources = await response.json();
  16 |     
  17 |     // Verify that the response contains an array
  18 |     expect(Array.isArray(resources)).toBe(true);
  19 |     
  20 |     // Verify that seeded resources exist (adjust based on your seeded data)
  21 |     const expectedResources = [
  22 |       { name: 'CNC Machine 1', status: 'Available' },
  23 |       { name: 'Assembly Line A', status: 'Available' },
  24 |     ];
  25 |     
  26 |     expectedResources.forEach((expected) => {
  27 |       const resource = resources.find((r: any) => r.name === expected.name);
> 28 |       expect(resource).toBeTruthy();
     |                        ^ Error: expect(received).toBeTruthy()
  29 |       expect(resource.status).toBe(expected.status);
  30 |     });
  31 |   });
  32 | });
```