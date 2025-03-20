import { checkServiceStatus, cleanupPort } from '~/models/service.server';
import { prisma } from './db.server';
import type { MicroService } from './types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function isPortInUse(port: number): Promise<boolean> {
  try {
    // Usamos un comando más genérico para verificar cualquier proceso que esté usando el puerto
    const { stdout } = await execAsync(`lsof -i:${port} -P -n`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

async function waitForPort(port: number, timeout = 15000): Promise<boolean> {
  const startTime = Date.now();
  console.log(`Waiting for port ${port} to be available...`);
  
  while (Date.now() - startTime < timeout) {
    if (await isPortInUse(port)) {
      console.log(`Port ${port} is now in use`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Timeout waiting for port ${port} to become available`);
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

  console.log(`The service: ${service?.name} is starting`);

  if (!service) {
    throw new Error(`Service with id ${id} not found`);
  }

  try {
    // Asegurarnos de que el servicio no esté ejecutándose
    await stopServiceById(id);
    
    console.log(`Starting service ${service.name} on port ${service.port}`);

    // Asegurarnos de que el puerto esté libre antes de iniciar
    await cleanupPort(service.port);

    // Start service in background with a more robust command
    await execAsync(`cd ${service.path} && (nohup yarn start > ./logs/service.log 2>&1 &)`);

    // Wait for the service to start (check if port becomes available)
    const isRunning = await waitForPort(service.port);

    console.log(`The service: ${service.name} is running:`, isRunning);

    if (!isRunning) {
      throw new Error(`Service ${service.name} failed to start within timeout`);
    }

    return prisma.service.update({
      where: { id },
      data: {
        status: 'running',
        lastStarted: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error starting service ${service.name}:`, error);
    
    // En caso de error, asegurarnos de actualizar el estado a stopped
    await prisma.service.update({
      where: { id },
      data: {
        status: 'stopped',
      },
    });
    
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
    console.log(`Stopping service: ${service.name} on port ${service.port}`);
    
    // Verificar si el servicio realmente está en ejecución
    if (!(await isPortInUse(service.port))) {
      console.log(`Service ${service.name} is not running on port ${service.port}`);
      
      // Actualizar el estado en la base de datos aunque el servicio no esté ejecutándose
      return prisma.service.update({
        where: { id },
        data: {
          status: 'stopped',
          lastStopped: new Date(),
        },
      });
    }
    
    // Matar cualquier proceso que esté usando el puerto
    await execAsync(`lsof -ti:${service.port} | xargs kill -9`);
    
    // Esperar un momento para asegurarnos de que el proceso ha terminado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usar cleanupPort para asegurarnos de que el puerto esté realmente libre
    await cleanupPort(service.port);
    
    // Verificar que el puerto esté realmente libre
    if (await isPortInUse(service.port)) {
      console.warn(`Warning: Port ${service.port} is still in use after stopping service`);
    } else {
      console.log(`Service ${service.name} stopped successfully`);
    }

    return prisma.service.update({
      where: { id },
      data: {
        status: 'stopped',
        lastStopped: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error stopping service ${service.name}:`, error);
    
    // Intentamos actualizar el estado de todos modos
    await prisma.service.update({
      where: { id },
      data: {
        status: 'stopped',
        lastStopped: new Date(),
      },
    });
    
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
