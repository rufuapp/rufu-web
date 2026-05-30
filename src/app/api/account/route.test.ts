/**
 * @jest-environment node
 */
import { DELETE } from './route';

// モジュール全体をモック
jest.mock('@/lib/supabase/server');
jest.mock('@supabase/supabase-js');

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const mockedServerClient = jest.mocked(createServerClient);
const mockedAdminClient = jest.mocked(createAdminClient);

// ─── DELETE /api/account ──────────────────────────────────────────────────────

describe('DELETE /api/account', () => {
  const mockDeleteUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAdminClient.mockReturnValue({
      auth: { admin: { deleteUser: mockDeleteUser } },
    } as ReturnType<typeof createAdminClient>);
  });

  it('未認証の場合は 401 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await DELETE();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('認証済みの場合は deleteUser を呼び出して 200 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'uid-123' } } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);
    mockDeleteUser.mockResolvedValue({ error: null });

    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(mockDeleteUser).toHaveBeenCalledWith('uid-123');
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('Admin API がエラーを返した場合は 500 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'uid-999' } } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);
    mockDeleteUser.mockResolvedValue({ error: { message: 'deletion failed' } });

    const res = await DELETE();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('deletion failed');
  });
});
