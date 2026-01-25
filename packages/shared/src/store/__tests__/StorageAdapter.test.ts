/**
 * Tests for StorageAdapter implementations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MemoryStorageAdapter,
  NoopStorageAdapter,
} from '../StorageAdapter';

describe('MemoryStorageAdapter', () => {
  let adapter: MemoryStorageAdapter;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
  });

  it('should return null for missing keys', async () => {
    const result = await adapter.getItem('nonexistent');
    expect(result).toBeNull();
  });

  it('should store and retrieve values', async () => {
    await adapter.setItem('test-key', 'test-value');
    const result = await adapter.getItem('test-key');
    expect(result).toBe('test-value');
  });

  it('should remove items', async () => {
    await adapter.setItem('test-key', 'test-value');
    await adapter.removeItem('test-key');
    const result = await adapter.getItem('test-key');
    expect(result).toBeNull();
  });

  it('should clear all items', async () => {
    await adapter.setItem('key1', 'value1');
    await adapter.setItem('key2', 'value2');
    adapter.clear();
    expect(await adapter.getItem('key1')).toBeNull();
    expect(await adapter.getItem('key2')).toBeNull();
  });

  it('should return keys', async () => {
    await adapter.setItem('key1', 'value1');
    await adapter.setItem('key2', 'value2');
    const keys = adapter.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should overwrite existing values', async () => {
    await adapter.setItem('test-key', 'old-value');
    await adapter.setItem('test-key', 'new-value');
    const result = await adapter.getItem('test-key');
    expect(result).toBe('new-value');
  });
});

describe('NoopStorageAdapter', () => {
  let adapter: NoopStorageAdapter;

  beforeEach(() => {
    adapter = new NoopStorageAdapter();
  });

  it('should always return null for getItem', async () => {
    const result = await adapter.getItem('any-key');
    expect(result).toBeNull();
  });

  it('should not throw on setItem', async () => {
    await expect(adapter.setItem('key', 'value')).resolves.not.toThrow();
  });

  it('should not throw on removeItem', async () => {
    await expect(adapter.removeItem('key')).resolves.not.toThrow();
  });

  it('should still return null after setItem', async () => {
    await adapter.setItem('key', 'value');
    const result = await adapter.getItem('key');
    expect(result).toBeNull();
  });
});
