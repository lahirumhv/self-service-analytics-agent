import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { generateSQL, validateSQL } from '../../lib/agent.js';
import axios from 'axios';
import * as db from '../../lib/db.js';

jest.mock('../../lib/db.js', () => ({
  getSchema: jest.fn(() => 'Mocked Schema')
}));

// Use spyOn for axios in ESM if jest.mock('axios') fails
const postSpy = jest.spyOn(axios, 'post');

describe('Agent Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  test('generateSQL should return clean SQL string', async () => {
    (postSpy as any).mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: '```sql\nSELECT * FROM customers;\n```' } }]
      }
    });

    const sql = await generateSQL('Get all customers');
    expect(sql).toBe('SELECT * FROM customers;');
    expect(postSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        messages: [
          { role: 'user', content: expect.stringContaining('Get all customers') }
        ]
      }),
      expect.any(Object)
    );
  });

  test('validateSQL should return VALID when response is VALID', async () => {
    (postSpy as any).mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: 'VALID' } }]
      }
    });

    const result = await validateSQL('SELECT * FROM customers', 'Get all customers');
    expect(result).toBe('VALID');
  });

  test('generateSQL should throw error when API fails', async () => {
    (postSpy as any).mockRejectedValueOnce(new Error('API Error'));

    await expect(generateSQL('test')).rejects.toThrow('Failed to generate SQL.');
  });
});
