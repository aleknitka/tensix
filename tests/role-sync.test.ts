import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncRoles } from '@/server/services/role-sync';
import { db } from '@/server/db';
import { personas } from '@/server/db/schema';
import fs from 'fs';
import glob from 'fast-glob';
import yaml from 'js-yaml';
import path from 'path';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));
vi.mock('fast-glob');
vi.mock('@/server/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
  },
}));

describe('Role Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract category from parent directory name', async () => {
    const mockFiles = ['scamper/substitute.yml'];
    (glob as any).mockResolvedValue(mockFiles);
    
    const mockYaml = `
id: substitute
name: Substitute
role_type: researcher
systemPrompt: Substitute something.
`;
    (fs.readFileSync as any).mockReturnValue(mockYaml);

    // Mock DB select to return empty (new role)
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    await syncRoles();

    // Verify insert was called with category 'scamper'
    expect(db.insert).toHaveBeenCalledWith(personas);
    const insertValues = (db.insert(personas).values as any).mock.calls[0][0];
    expect(insertValues.category).toBe('scamper');
  });

  it('should default to "general" for roles in the root directory', async () => {
    const mockFiles = ['root-role.yml'];
    (glob as any).mockResolvedValue(mockFiles);
    
    const mockYaml = `
id: root-role
name: Root Role
role_type: researcher
systemPrompt: I am in the root.
`;
    (fs.readFileSync as any).mockReturnValue(mockYaml);

    // Mock DB select to return empty (new role)
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    await syncRoles();

    const insertValues = (db.insert(personas).values as any).mock.calls[0][0];
    expect(insertValues.category).toBe('general');
  });

  it('should sync all Phase 9 fields correctly', async () => {
    const mockFiles = ['scamper/substitute.yml'];
    (glob as any).mockResolvedValue(mockFiles);
    
    const mockYaml = `
id: substitute
name: Substitute
role_type: critic
description: Identifies components that can be replaced.
systemPrompt: You are the Substitutor.
chattiness_limit: 4
icon_id: zap
color_accent: blue
skills: 
  - innovation
  - cost-reduction
parameters:
  temperature: 0.7
  top_p: 1.0
  max_tokens: 500
  presence_penalty: 0.1
  frequency_penalty: 0.2
`;
    (fs.readFileSync as any).mockReturnValue(mockYaml);

    // Mock DB select to return empty (new role)
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    await syncRoles();

    const insertValues = (db.insert(personas).values as any).mock.calls[0][0];
    expect(insertValues).toEqual({
      id: 'substitute',
      name: 'Substitute',
      role: 'Substitute',
      description: 'Identifies components that can be replaced.',
      role_type: 'critic',
      systemPrompt: 'You are the Substitutor.',
      chattiness_limit: 4,
      category: 'scamper',
      icon_id: 'zap',
      color_accent: 'blue',
      skills: JSON.stringify(['innovation', 'cost-reduction']),
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.2,
      is_predefined: true,
    });
  });

  it('should handle missing optional Phase 9 fields', async () => {
    const mockFiles = ['minimal.yml'];
    (glob as any).mockResolvedValue(mockFiles);
    
    const mockYaml = `
id: minimal
name: Minimal Role
role_type: other
systemPrompt: Minimal.
`;
    (fs.readFileSync as any).mockReturnValue(mockYaml);

    // Mock DB select to return empty (new role)
    (db.select as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    await syncRoles();

    const insertValues = (db.insert(personas).values as any).mock.calls[0][0];
    expect(insertValues.icon_id).toBeUndefined();
    expect(insertValues.skills).toBe('[]');
    expect(insertValues.temperature).toBeUndefined();
  });
});
