import { injectable } from 'inversify';
import { IExternalApiService, ExternalEvent } from './interfaces/IExternalApiService';

@injectable()
export class ExternalApiService implements IExternalApiService {
  private apiBaseUrl: string;
  
  constructor() {
    this.apiBaseUrl = process.env.EXTERNAL_API_URL || 'https://api.mock-sports-data.com';
  }

  async fetchEvents(): Promise<ExternalEvent[]> {
    try {
      return this.getMockEvents();
    } catch {
      throw new Error('Failed to fetch events from external API');
    }
  }

  async fetchEventById(id: string): Promise<ExternalEvent | null> {
    try {
      const events = this.getMockEvents();
      return events.find(event => event.id === id) || null;
    } catch {
      throw new Error('Failed to fetch event from external API');
    }
  }

  async fetchEventsByCategory(category: string): Promise<ExternalEvent[]> {
    try {
      const events = this.getMockEvents();
      return events.filter(event => event.category === category);
    } catch {
      throw new Error('Failed to fetch events by category from external API');
    }
  }

  private getMockEvents(): ExternalEvent[] {
    return [
      {
        id: '1',
        title: 'NFL: Chiefs vs. Ravens',
        description: 'NFL Week 1 matchup between Kansas City Chiefs and Baltimore Ravens',
        category: 'Football',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
        options: [
          { name: 'Chiefs Win', odds: 1.85 },
          { name: 'Ravens Win', odds: 1.95 }
        ]
      },
      {
        id: '2',
        title: 'NBA: Lakers vs. Celtics',
        description: 'NBA Regular Season game between Los Angeles Lakers and Boston Celtics',
        category: 'Basketball',
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 52 * 60 * 60 * 1000).toISOString(),
        options: [
          { name: 'Lakers Win', odds: 2.10 },
          { name: 'Celtics Win', odds: 1.75 }
        ]
      },
      {
        id: '3',
        title: 'Presidential Election 2024',
        description: 'United States Presidential Election 2024',
        category: 'Politics',
        startTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000).toISOString(),
        options: [
          { name: 'Democratic Party', odds: 1.90 },
          { name: 'Republican Party', odds: 1.90 },
          { name: 'Other', odds: 15.0 }
        ]
      },
      {
        id: '4',
        title: 'Bitcoin Price Movement',
        description: 'Bitcoin price at end of month',
        category: 'Cryptocurrency',
        startTime: new Date(Date.now()).toISOString(),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        options: [
          { name: 'Above $50,000', odds: 2.20 },
          { name: 'Below $50,000', odds: 1.70 }
        ]
      }
    ];
  }
} 