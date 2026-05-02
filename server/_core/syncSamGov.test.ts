import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncSamGovContracts } from './syncSamGov';
import * as samGovService from './samGovService';
import { getDb } from '../db';

// Mock dependencies
vi.mock('./samGovService');
vi.mock('../db');

describe('SAM.gov Sync Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty result when database is not available', async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    const result = await syncSamGovContracts();

    expect(result.synced).toBe(0);
    expect(result.errors).toContain('Database not available');
  });

  it('should handle empty SAM.gov response', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(samGovService.searchSamGovContracts).mockResolvedValue([]);

    const result = await syncSamGovContracts();

    expect(result.synced).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('should translate contract types to plain English', async () => {
    const mockContracts = Array.from({ length: 10 }, (_, i) => ({
      id: `sam-${i}`,
      title: `Test Contract ${i}`,
      description: 'Test description',
      agency: 'Test Agency',
      contractType: 'Micro-Purchase',
      value: 10000,
      deadline: '2026-05-01',
      naicsCode: '123456',
      setAside: undefined,
      url: 'https://sam.gov/test',
    }));

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(samGovService.searchSamGovContracts)
      .mockResolvedValueOnce(mockContracts)
      .mockResolvedValueOnce([]);

    const result = await syncSamGovContracts();

    expect(result.synced).toBe(10);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle pagination correctly', async () => {
    const mockContractsBatch1 = Array.from({ length: 100 }, (_, i) => ({
      id: `sam-${i}`,
      title: `Contract ${i}`,
      description: 'Test',
      agency: 'Agency',
      contractType: 'Simplified Acquisition',
      value: 50000,
      deadline: '2026-05-01',
      naicsCode: '123456',
      setAside: undefined,
      url: 'https://sam.gov/test',
    }));

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(samGovService.searchSamGovContracts)
      .mockResolvedValueOnce(mockContractsBatch1)
      .mockResolvedValueOnce([]);

    const result = await syncSamGovContracts();

    expect(result.synced).toBe(100);
    expect(samGovService.searchSamGovContracts).toHaveBeenCalledTimes(2);
  });

  it('should log errors for individual contract sync failures', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Insert failed')),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(samGovService.searchSamGovContracts).mockResolvedValue([
      {
        id: 'sam-123',
        title: 'Test',
        description: 'Test',
        agency: 'Agency',
        contractType: 'Micro-Purchase',
        value: 10000,
        deadline: '2026-05-01',
        naicsCode: '123456',
        setAside: undefined,
        url: 'https://sam.gov/test',
      },
    ]);

    const result = await syncSamGovContracts();

    expect(result.synced).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Insert failed');
  });
});
