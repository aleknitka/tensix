import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import RoleSelector from '@/components/RoleSelector';
import React from 'react';

// Mock fetch
const mockPersonas = [
  { id: '1', name: 'Role 1', role: 'Role 1', description: 'Desc 1', category: 'business', is_predefined: true, icon_id: 'Database', color_accent: 'blue' },
  { id: '2', name: 'Role 2', role: 'Role 2', description: 'Desc 2', category: 'business', is_predefined: true, icon_id: 'Database', color_accent: 'blue' },
  { id: '3', name: 'Role 3', role: 'Role 3', description: 'Desc 3', category: 'scamper', is_predefined: true, icon_id: 'Zap', color_accent: 'orange' },
];

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockPersonas),
  })
) as any;

describe('RoleSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('groups roles by category', async () => {
    render(<RoleSelector onSelect={() => {}} />);
    
    // Wait for personas to load
    await waitFor(() => {
      expect(screen.getByText('Role 1')).toBeDefined();
    });

    // Check for category headers - this should fail initially as categories aren't implemented yet
    expect(screen.getByText('business')).toBeDefined();
    expect(screen.getByText('scamper')).toBeDefined();
  });

  test('filters roles by search term', async () => {
    render(<RoleSelector onSelect={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Role 1')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/search roles/i);
    fireEvent.change(searchInput, { target: { value: 'scamper' } });

    // Should show Role 3 (in scamper category) and hide Role 1 and 2
    expect(screen.getByText('Role 3')).toBeDefined();
    expect(screen.queryByText('Role 1')).toBeNull();
  });

  test('collapses and expands categories', async () => {
    render(<RoleSelector onSelect={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('business')).toBeDefined();
    });

    const businessHeader = screen.getByText('business');
    fireEvent.click(businessHeader);

    // After clicking, roles in 'business' should be hidden
    expect(screen.queryByText('Role 1')).toBeNull();
    
    fireEvent.click(businessHeader);
    expect(screen.getByText('Role 1')).toBeDefined();
  });
});
