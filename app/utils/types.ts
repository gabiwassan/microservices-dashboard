import type { Service, Group } from '@prisma/client';

export interface MicroService extends Service {
  lastStarted?: Date | null;
  lastStopped?: Date | null;
  status: ServiceStatus;
}

export interface ServiceGroup extends Group {
  services: string[];
}

export type ServiceStatus = 'running' | 'stopped';

export interface ActionData {
  error?: string;
  success?: boolean;
}
