/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';

// Basic grouping logic test (utility function test as proxy for component logic)
function groupPersonas(personas: any[]) {
  const groups: Record<string, any[]> = {};
  personas.forEach(p => {
    const cat = p.category || 'general';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });
  return groups;
}

describe('RoleSelector Logic', () => {
  it('should group personas by category', () => {
    const mockPersonas = [
      { id: '1', name: 'P1', category: 'cat1' },
      { id: '2', name: 'P2', category: 'cat1' },
      { id: '3', name: 'P3', category: 'cat2' },
      { id: '4', name: 'P4', category: undefined },
    ];

    const grouped = groupPersonas(mockPersonas);

    expect(Object.keys(grouped)).toContain('cat1');
    expect(Object.keys(grouped)).toContain('cat2');
    expect(Object.keys(grouped)).toContain('general');
    expect(grouped['cat1']).toHaveLength(2);
    expect(grouped['cat2']).toHaveLength(1);
    expect(grouped['general']).toHaveLength(1);
  });

  it('should correctly handle search filtering (simulated)', () => {
    const mockPersonas = [
      { id: '1', name: 'Security Expert', category: 'tech' },
      { id: '2', name: 'CFO', category: 'business' },
    ];
    
    const search = 'security';
    const filtered = mockPersonas.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
