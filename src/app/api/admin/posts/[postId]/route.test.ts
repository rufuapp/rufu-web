/**
 * @jest-environment node
 */
import { PATCH, DELETE } from './route';

jest.mock('@/lib/supabase/server');
jest.mock('@supabase/supabase-js');

import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const mockedServerClient = jest.mocked(createServerClient);
const mockedAdminClient = jest.mocked(createAdminClient);

const ADMIN_EMAIL = 'sho24.noubeau@gmail.com';

function makeAdminUser() {
  return { id: 'uid-admin', email: ADMIN_EMAIL };
}

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/admin/posts/post-123', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── PATCH /api/admin/posts/[postId] ─────────────────────────────────────────

describe('PATCH /api/admin/posts/[postId]', () => {
  const mockUpdate = jest.fn();
  const mockFromPosts = jest.fn();
  const mockFromReports = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockFromPosts.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
    mockFromReports.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    });
    mockUpdate.mockImplementation((table: string) =>
      table === 'posts' ? mockFromPosts() : mockFromReports(),
    );

    mockedAdminClient.mockReturnValue({
      from: (table: string) => (table === 'posts' ? mockFromPosts() : mockFromReports()),
    } as unknown as ReturnType<typeof createAdminClient>);
  });

  it('非管理者は 403 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await PATCH(makeRequest({ visibility: 'flagged' }), {
      params: Promise.resolve({ postId: 'post-123' }),
    });
    expect(res.status).toBe(403);
  });

  it('管理者が visibility を更新すると 200 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: makeAdminUser() } }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await PATCH(makeRequest({ visibility: 'flagged' }), {
      params: Promise.resolve({ postId: 'post-123' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('resolveReports: true で通報を resolved に更新する', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: makeAdminUser() } }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    const res = await PATCH(makeRequest({ resolveReports: true }), {
      params: Promise.resolve({ postId: 'post-123' }),
    });
    expect(res.status).toBe(200);
  });
});

// ─── DELETE /api/admin/posts/[postId] ────────────────────────────────────────

describe('DELETE /api/admin/posts/[postId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('非管理者は 403 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);
    mockedAdminClient.mockReturnValue({} as ReturnType<typeof createAdminClient>);

    const res = await DELETE(new Request('http://localhost'), {
      params: Promise.resolve({ postId: 'post-123' }),
    });
    expect(res.status).toBe(403);
  });

  it('管理者が投稿を削除すると 200 を返す', async () => {
    mockedServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: makeAdminUser() } }),
      },
    } as unknown as Awaited<ReturnType<typeof createServerClient>>);

    mockedAdminClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    } as unknown as ReturnType<typeof createAdminClient>);

    const res = await DELETE(new Request('http://localhost'), {
      params: Promise.resolve({ postId: 'post-123' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
