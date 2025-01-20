import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Api } from '@neondatabase/api-client';
import {
  parsePITBranch,
  parsePointInTime,
  PointInTimeParseError,
} from './point_in_time';
import * as formats from './formats';

vi.mock('./formats', () => ({
  looksLikeLSN: vi.fn(),
  looksLikeTimestamp: vi.fn(),
}));

vi.mock('./enrichers', () => ({
  branchIdResolve: vi.fn(),
}));

describe('parsePITBranch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(formats.looksLikeLSN).mockReturnValue(false);
    vi.mocked(formats.looksLikeTimestamp).mockReturnValue(false);
  });

  it('should parse branch without PIT', () => {
    const result = parsePITBranch('main');
    expect(result).toEqual({
      branch: 'main',
      tag: 'head',
    });
  });

  it('should parse branch with LSN', () => {
    vi.mocked(formats.looksLikeLSN).mockReturnValue(true);
    const result = parsePITBranch('main@0/0');
    expect(result).toEqual({
      branch: 'main',
      tag: 'lsn',
      lsn: '0/0',
    });
  });

  it('should parse branch with valid timestamp', () => {
    vi.mocked(formats.looksLikeTimestamp).mockReturnValue(true);
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-01').getTime());
    const result = parsePITBranch('main@2024-12-31T00:00:00Z');
    expect(result).toEqual({
      branch: 'main',
      tag: 'timestamp',
      timestamp: '2024-12-31T00:00:00Z',
    });
  });

  it('should throw error for invalid timestamp format', () => {
    vi.mocked(formats.looksLikeTimestamp).mockReturnValue(false);
    expect(() => parsePITBranch('main@invalid-timestamp')).toThrow(
      PointInTimeParseError,
    );
  });

  it('should throw error for future timestamp', () => {
    vi.mocked(formats.looksLikeTimestamp).mockReturnValue(true);
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2025-01-01').getTime());
    expect(() => parsePITBranch('main@2025-12-31T00:00:00Z')).toThrow(
      PointInTimeParseError,
    );
  });
});

describe('parsePointInTime', () => {
  const mockApi = {
    getProjectBranch: vi.fn(),
  } as unknown as Api<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(formats.looksLikeLSN).mockReturnValue(false);
    vi.mocked(formats.looksLikeTimestamp).mockReturnValue(false);
  });

  it('should resolve ^self branch', async () => {
    const result = await parsePointInTime({
      pointInTime: '^self',
      targetBranchId: 'target-branch',
      projectId: 'project-1',
      api: mockApi,
    });

    expect(result).toEqual({
      branchId: 'target-branch',
      tag: 'head',
    });
  });

  it('should resolve ^parent branch', async () => {
    vi.mocked(mockApi.getProjectBranch).mockResolvedValue({
      data: {
        branch: {
          parent_id: 'parent-branch',
        },
      },
    } as any);

    const result = await parsePointInTime({
      pointInTime: '^parent',
      targetBranchId: 'target-branch',
      projectId: 'project-1',
      api: mockApi,
    });

    expect(result).toEqual({
      branchId: 'parent-branch',
      tag: 'head',
    });
  });

  it('should throw error when parent branch not found', async () => {
    vi.mocked(mockApi.getProjectBranch).mockResolvedValue({
      data: {
        branch: {
          parent_id: null,
        },
      },
    } as any);

    await expect(
      parsePointInTime({
        pointInTime: '^parent',
        targetBranchId: 'target-branch',
        projectId: 'project-1',
        api: mockApi,
      }),
    ).rejects.toThrow(PointInTimeParseError);
  });

  it('should resolve custom branch with LSN', async () => {
    vi.mocked(formats.looksLikeLSN).mockReturnValue(true);
    const branchIdResolve = await import('./enrichers').then(
      (m) => m.branchIdResolve,
    );
    vi.mocked(branchIdResolve).mockResolvedValue('resolved-branch');

    const result = await parsePointInTime({
      pointInTime: 'custom@0/0',
      targetBranchId: 'target-branch',
      projectId: 'project-1',
      api: mockApi,
    });

    expect(result).toEqual({
      branchId: 'resolved-branch',
      tag: 'lsn',
      lsn: '0/0',
    });
  });
});
