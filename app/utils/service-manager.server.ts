import {
  checkServiceStatus,
  startService,
  stopService,
} from "~/models/service.server";
import { MicroService, ServiceGroup } from './types';
import fs from 'fs';
import path from 'path';

const SERVICES_CONFIG_PATH = path.join(process.cwd(), 'services.json');

export async function getAllServices(): Promise<{ services: MicroService[], groups: ServiceGroup[] }> {
  try {
    const data = await fs.promises.readFile(SERVICES_CONFIG_PATH, 'utf8');
    const config = JSON.parse(data);
    return {
      services: config.services || [],
      groups: config.groups || []
    };
  } catch (error) {
    console.error('Error reading services:', error);
    return { services: [], groups: [] };
  }
}

export async function getServiceById(id: string) {
  const { services } = await getAllServices();
  const service = services.find((s) => s.id === id);

  if (service) {
    service.status = await checkServiceStatus(service);
    console.log("Service status:", service.status);
  }

  return service;
}

async function saveServicesAndGroups(services: MicroService[], groups: ServiceGroup[]) {
  try {
    const config = { services, groups };
    await fs.promises.writeFile(SERVICES_CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving services:', error);
    throw error;
  }
}

export async function startServiceById(id: string) {
  const { services, groups } = await getAllServices();
  const serviceIndex = services.findIndex((s) => s.id === id);

  console.log("Service index:", serviceIndex);

  if (serviceIndex === -1) {
    return false;
  }

  try {
    console.log("Starting service:", services[serviceIndex]);

    const success = await startService(services[serviceIndex]);

    console.log("Service started:", success);

    if (success) {
      services[serviceIndex].lastStarted = new Date();
      services[serviceIndex].status = "running";
      await saveServicesAndGroups(services, groups);
    }

    return success;
  } catch (error) {
    console.error("Error starting service:", error);
    return false;
  }
}

export async function stopServiceById(id: string) {
  const { services, groups } = await getAllServices();
  const serviceIndex = services.findIndex((s) => s.id === id);

  if (serviceIndex === -1) {
    return false;
  }

  const success = await stopService(services[serviceIndex]);

  if (success) {
    services[serviceIndex].lastStopped = new Date();
    services[serviceIndex].status = "stopped";
    await saveServicesAndGroups(services, groups);
  }

  return success;
}

export async function addService(service: Omit<MicroService, "id" | "status">) {
  const { services, groups } = await getAllServices();

  const newService: MicroService = {
    ...service,
    id: crypto.randomUUID(),
    status: "stopped",
  };

  services.push(newService);
  await saveServicesAndGroups(services, groups);

  return newService;
}

export async function removeService(id: string) {
  const { services, groups } = await getAllServices();
  const serviceIndex = services.findIndex((s) => s.id === id);

  if (serviceIndex === -1) {
    return false;
  }

  await stopService(services[serviceIndex]);

  services.splice(serviceIndex, 1);
  await saveServicesAndGroups(services, groups);

  return true;
}
