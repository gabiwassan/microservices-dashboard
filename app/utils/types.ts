export type ServiceStatus = 'running' | 'stopped' | 'error' | 'unknown';

export interface MicroService {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  port: number;
  path: string;
  lastStarted?: Date;
  lastStopped?: Date;
}