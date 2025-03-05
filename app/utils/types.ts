export type ServiceStatus = "running" | "stopped" | "error";

export interface MicroService {
  id: string;
  name: string;
  description: string;
  port: number;
  path: string;
  status: ServiceStatus;
  lastStarted?: Date;
  lastStopped?: Date;
}

export interface ServiceGroup {
  id: string;
  name: string;
  services: string[];
}

export interface ActionData {
  error?: string;
  success?: string;
}