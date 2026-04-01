import { describe, it, expect, vi } from 'vitest';
import { roleSchema } from '@/server/services/role-schema';

describe('Role Schema validation', () => {
  it('should validate a correct role object', () => {
    const validRole = {
      id: 'test-role',
      name: 'Test Role',
      description: 'A test description',
      role_type: 'auditor',
      systemPrompt: 'You are a test role.',
      chattiness_limit: 4,
      icon_id: 'zap',
      color_accent: 'blue',
      skills: ['innovation'],
      parameters: {
        temperature: 0.7,
        max_tokens: 500,
      },
    };
    
    const result = roleSchema.safeParse(validRole);
    expect(result.success).toBe(true);
  });

  it('should fail validation if required fields are missing', () => {
    const invalidRole = {
      id: 'test-role',
      // name missing
      role_type: 'auditor',
      systemPrompt: 'You are a test role.',
    };
    
    const result = roleSchema.safeParse(invalidRole);
    expect(result.success).toBe(false);
  });

  it('should fail if role_type is invalid', () => {
    const invalidRole = {
      id: 'test-role',
      name: 'Test Role',
      role_type: 'unknown',
      systemPrompt: 'You are a test role.',
    };
    
    const result = roleSchema.safeParse(invalidRole);
    expect(result.success).toBe(false);
  });
});
