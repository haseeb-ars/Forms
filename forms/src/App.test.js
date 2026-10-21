import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { services } from './servicesConfig';
import { CONSUMABLES_CATALOGUE } from './consumablesCatalogue';

// Mock canvas for jsdom
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: (x, y, w, h) => ({ data: new Array(w * h * 4) }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
});

describe('CarePlus Health Forms Integration Tests', () => {
  test('renders App within MemoryRouter without crashing', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByAltText(/CarePlus Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/Consumables/i)).toBeInTheDocument();
  });

  test('Team Meeting service is properly registered in servicesConfig', () => {
    const teamMeetingService = services.find((s) => s.id === 'teamMeeting');
    expect(teamMeetingService).toBeDefined();
    expect(teamMeetingService.name).toBe('Team Meeting');
    expect(teamMeetingService.template).toBe('TeamMeetingTemplate');

    const fieldNames = teamMeetingService.patientFields.map((f) => f.name);
    expect(fieldNames).toContain('date');
    expect(fieldNames).toContain('time');
    expect(fieldNames).toContain('teamMembers');
    expect(fieldNames).toContain('pointsDiscussed');
    expect(fieldNames).toContain('targets');
    expect(fieldNames).toContain('actionPlan');
  });

  test('Consumables catalogue has 25 valid products with prices and pack sizes', () => {
    expect(CONSUMABLES_CATALOGUE.length).toBeGreaterThanOrEqual(20);
    CONSUMABLES_CATALOGUE.forEach((p) => {
      expect(p.sku).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.packQuantity).toBeTruthy();
    });
  });
});
