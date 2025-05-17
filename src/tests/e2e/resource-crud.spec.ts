// src/tests/e2e/resource-crud.spec.ts
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Resource Management', () => {
  test('should retrieve seeded resources via GET /api/resources', async ({ request }) => {
    // Call the GET /api/resources endpoint
    const response = await request.get(`${BASE_URL}/api/resources`);
    
    // Verify the response status is 200
    expect(response.ok()).toBeTruthy();
    
    // Parse the response body
    const resources = await response.json();
    
    // Verify that the response contains an array
    expect(Array.isArray(resources)).toBe(true);
    
    // Verify that seeded resources exist (adjust based on your seeded data)
    const expectedResources = [
      { name: 'CNC Machine 1', status: 'Available' },
      { name: 'Assembly Line A', status: 'Available' },
    ];
    
    expectedResources.forEach((expected) => {
      const resource = resources.find((r: any) => r.name === expected.name);
      expect(resource).toBeTruthy();
      expect(resource.status).toBe(expected.status);
    });
  });
});