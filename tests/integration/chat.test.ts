/**
 * @jest-environment node
 */
import { jest, describe, test, expect, beforeEach, beforeAll } from '@jest/globals';
import * as agent from '../../lib/agent.js';
import { POST } from '../../app/api/chat/route.js';
import { NextRequest } from 'next/server';
import db from '../../lib/db.js';

describe('Chat API Integration', () => {
  let generateSQLSpy: any;
  let validateSQLSpy: any;

  beforeAll(() => {
    generateSQLSpy = jest.spyOn(agent, 'generateSQL');
    validateSQLSpy = jest.spyOn(agent, 'validateSQL');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/chat should return results for a valid query', async () => {
    generateSQLSpy.mockResolvedValue('SELECT * FROM customers');
    validateSQLSpy.mockResolvedValue('VALID');

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'Show all customers' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.sql).toBe('SELECT * FROM customers');
    expect(data.results).toBeInstanceOf(Array);
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.validationNote).toBeNull();
  });

  test('POST /api/chat should return error for missing query', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Query is required');
  });

  test('POST /api/chat should handle agent failures', async () => {
    generateSQLSpy.mockRejectedValue(new Error('Agent Failed'));

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query: 'broken' })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Agent Failed');
  });
});
