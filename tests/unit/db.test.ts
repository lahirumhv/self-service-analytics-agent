import { describe, test, expect } from '@jest/globals';
import db, { getSchema } from '../../lib/db.js';

describe('Database Module', () => {
  test('getSchema should return schema for all tables', () => {
    const schema = getSchema();
    expect(schema).toContain('Table: customers');
    expect(schema).toContain('Table: products');
    expect(schema).toContain('Table: orders');
    expect(schema).toContain('Table: order_items');
    expect(schema).toContain('name (TEXT)');
    expect(schema).toContain('email (TEXT)');
  });

  test('database should be seeded with initial data', () => {
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
    expect(customerCount.count).toBeGreaterThan(0);

    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    expect(productCount.count).toBeGreaterThan(0);
  });
});
