/**
 * @jest-environment node
 */
import { GET } from './route';

jest.mock('@/lib/supabase/server');
jest.mock('@supabase/supabase-js');

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const mockedServerClient = jest.mocked(createServerClient);
const mockedAdminClient = jest.mocked(createAdminClient);

const ADMIN_EMAIL = 'sho24.noubeau@gmail.com';

// ─── GET /api/admin/reports ───────────────────────────────────────────────────

describe('GET /api/admin/reports', () => {
  const mockSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminClient.mockReturnValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    } as unknown as ReturnType<typeof createAdminClient>);
  });

  it('未認証（user = null）の場合は 403 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('管理者メール以外のユーザーは 403 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'uid-other', email: 'other@example.com' } },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('管理者の場合は通報一覧を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'uid-admin', email: ADMIN_EMAIL } },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const fakeReports = [{ id: 'r1', reason: 'spam', status: 'open' }];
    mockSelect.mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: fakeReports, error: null }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reports).toEqual(fakeReports);
  });

  it('DB エラー時は 500 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'uid-admin', email: ADMIN_EMAIL } },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    mockSelect.mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
    });

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
