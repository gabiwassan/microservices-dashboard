import { checkServiceStatus } from '~/models/service.server';
import { prisma } from './db.server';
import type { MicroService } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function isPortInUse(port: number): Promise<boolean> {
  try {
    await execAsync(`lsof -i:${port} -P -n | grep LISTEN`);
    return true;
  } catch (error) {
    return false;
  }
}

async function waitForPort(port: number, timeout = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await isPortInUse(port)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      groups: true,
    },
  });

  if (!service) return null;

  const status = await checkServiceStatus(service as MicroService);
  return { ...service, status };
}

export async function getAllServices() {
  const [services, groups] = await Promise.all([
    prisma.service.findMany({
      include: {
        groups: true,
      },
    }),
    prisma.group.findMany({
      select: {
        id: true,
        name: true,
        services: {
          select: {
            id: true,
          },
        },
      },
    }),
  ]);

  return {
    services,
    groups: groups.map(group => ({
      ...group,
      services: group.services.map(service => service.id),
    })),
  };
}

export async function addService(
  service: Pick<MicroService, 'name' | 'description' | 'port' | 'path'>,
) {
  return prisma.service.create({
    data: {
      name: service.name,
      description: service.description,
      port: service.port,
      path: service.path,
      status: 'stopped',
    },
  });
}

export async function removeService(id: string) {
  await prisma.service.update({
    where: { id },
    data: {
      groups: {
        set: [],
      },
    },
  });

  return prisma.service.delete({
    where: { id },
  });
}

export async function startServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error(`Service with id ${id} not found`);
  }

  try {
    // Check if service is already running
    if (await isPortInUse(service.port)) {
      console.log(
        `Service ${service.name} is already running on port ${service.port}`,
      );
      return prisma.service.update({
        where: { id },
        data: {
          status: 'running',
        },
      });
    }

    // Start service in background
    await execAsync(`cd ${service.path} && yarn start > /dev/null 2>&1 &`);

    // Wait for the service to start (check if port becomes available)
    const isRunning = await waitForPort(service.port);

    if (!isRunning) {
      throw new Error(`Service ${service.name} failed to start within timeout`);
    }

    return prisma.service.update({
      where: { id },
      data: {
        status: 'running',
      },
    });
  } catch (error) {
    console.error(`Error starting service ${service.name}:`, error);
    throw error;
  }
}

export async function stopServiceById(id: string) {
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    throw new Error(`Service with id ${id} not found`);
  }

  try {
    // This is a simplified way to stop the service. You might want to implement
    // a more robust solution based on your specific needs
    await execAsync(`lsof -ti:${service.port} | xargs kill -9`);

    return prisma.service.update({
      where: { id },
      data: {
        status: 'stopped',
      },
    });
  } catch (error) {
    console.error(`Error stopping service ${service.name}:`, error);
    throw error;
  }
}

export async function createGroup(name: string) {
  return prisma.group.create({
    data: {
      name,
    },
  });
}

export async function updateGroup(id: string, name: string) {
  return prisma.group.update({
    where: { id },
    data: {
      name,
    },
  });
}

export async function deleteGroup(id: string) {
  return prisma.group.delete({
    where: { id },
  });
}

export async function addServiceToGroup(groupId: string, serviceId: string) {
  return prisma.group.update({
    where: { id: groupId },
    data: {
      services: {
        connect: { id: serviceId },
      },
    },
  });
}

export async function removeServiceFromGroup(
  groupId: string,
  serviceId: string,
) {
  return prisma.group.update({
    where: { id: groupId },
    data: {
      services: {
        disconnect: { id: serviceId },
      },
    },
  });
}

export async function startGroupServices(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      services: true,
    },
  });

  if (!group) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  for (const service of group.services) {
    await startServiceById(service.id);
  }

  return group;
}

export async function stopGroupServices(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      services: true,
    },
  });

  if (!group) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  for (const service of group.services) {
    await stopServiceById(service.id);
  }

  return group;
}
