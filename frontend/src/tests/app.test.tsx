import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import axe from 'axe-core';
import App from '../App';

describe('StadiumSense AI Frontend UI Tests', () => {

  it('should render the App sidebar navigation and header branding', () => {
    render(<App />);
    // Verify name exists
    const appTitles = screen.getAllByText(/StadiumSense AI/i);
    expect(appTitles.length).toBeGreaterThan(0);
    
    // Check main navigation links exist
    expect(screen.getByRole('button', { name: /Smart Wayfinding/i })).toBeInTheDocument();
  });

  it('should update the HTML document lang attribute when language is changed', async () => {
    render(<App />);
    const langSelect = screen.getByLabelText(/Language/i) as HTMLSelectElement;
    
    // Switch to Spanish
    await act(async () => {
      fireEvent.change(langSelect, { target: { value: 'es' } });
    });
    expect(document.documentElement.lang).toBe('es');

    // Switch back to English
    await act(async () => {
      fireEvent.change(langSelect, { target: { value: 'en' } });
    });
    expect(document.documentElement.lang).toBe('en');
  });

  it('should enforce role-based access for restricted tabs (RBAC)', async () => {
    render(<App />);
    
    // Click Crowd Analytics (Organizer view) while role is Fan
    const crowdTabBtn = screen.getByRole('button', { name: /Crowd Analytics/i });
    await act(async () => {
      fireEvent.click(crowdTabBtn);
    });

    // Should display Access Denied
    expect(screen.getByText(/Access Denied — Role Unauthorized/i)).toBeInTheDocument();

    // Switch role in dropdown to Match Organizer
    const roleSelect = screen.getByLabelText(/Current View Role:/i) as HTMLSelectElement;
    await act(async () => {
      fireEvent.change(roleSelect, { target: { value: 'organizer' } });
    });

    // Locked message should be gone, dashboard should display
    expect(screen.queryByText(/Access Denied — Role Unauthorized/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Gate Occupancy Heatmap/i)).toBeInTheDocument();
  });

  it('should pass automated accessibility audits using axe-core', async () => {
    const { container } = render(<App />);
    
    // Run axe accessibility scan
    const results = await axe.run(container, {
      rules: {
        // Color contrast is skipped in JSDOM as it cannot calculate layout/styles accurately
        'color-contrast': { enabled: false }
      }
    });

    const severeViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    // Assert that there are zero critical or serious violations
    expect(severeViolations.length).toBe(0);
  });
});
