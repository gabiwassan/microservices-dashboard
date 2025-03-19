import { PrismaClient, Service } from '@prisma/client';
import { readFileSync, existsSync, renameSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const prisma = new PrismaClient();

async function startService(service: Service) {
  try {
    await execAsync(`cd ${service.path} && yarn start`);
    return true;
  } catch (error) {
    console.error(`Error starting service ${service.name}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Read existing services.json if it exists
    const servicesPath = join(process.cwd(), 'services.json');
    if (existsSync(servicesPath)) {
      const data = JSON.parse(readFileSync(servicesPath, 'utf8'));
      
      // Migrate services
      if (data.services) {
        for (const service of data.services) {
          const newService = await prisma.service.create({
            data: {
              id: service.id,
              name: service.name,
              description: service.description || '',
              port: service.port,
              path: service.path,
              status: service.status || 'stopped',
            },
          });

          // If the service was running, try to start it
          if (service.status === 'running') {
            const started = await startService(newService);
            if (started) {
              await prisma.service.update({
                where: { id: newService.id },
                data: { status: 'running' },
              });
            }
          }
        }
        console.log('✅ Existing services migrated successfully');
      }

      // Migrate groups
      if (data.groups) {
        for (const group of data.groups) {
          await prisma.group.create({
            data: {
              id: group.id,
              name: group.name,
              services: {
                connect: group.services.map((serviceId: string) => ({ id: serviceId })),
              },
            },
          });
        }
        console.log('✅ Existing groups migrated successfully');
      }

      // Backup and remove the old services.json
      const backupPath = join(process.cwd(), 'services.json.backup');
      renameSync(servicesPath, backupPath);
      console.log('✅ Created backup of services.json');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 