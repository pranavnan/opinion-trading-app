export interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  options: { name: string; odds: number }[];
}

export interface IExternalApiService {
  fetchEvents(): Promise<ExternalEvent[]>;
  fetchEventById(id: string): Promise<ExternalEvent | null>;
  fetchEventsByCategory(category: string): Promise<ExternalEvent[]>;
} 