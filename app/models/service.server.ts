import { exec, ExecOptions } from "child_process";
import path from "path";
import fs from "fs";
import { MicroService, ServiceStatus } from "~/utils/types";

const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 1000;

export async function loadServices(): Promise<MicroService[]> {
  if (!fs.existsSync(SERVICES_CONFIG_PATH)) {
    const defaultServices: MicroService[] = [];
    fs.writeFileSync(
      SERVICES_CONFIG_PATH,
      JSON.stringify(defaultServices, null, 2)
    );
    return defaultServices;
  }

  const data = fs.readFileSync(SERVICES_CONFIG_PATH, "utf8");
  return JSON.parse(data);
}

export async function saveServices(services: MicroService[]): Promise<void> {
  fs.writeFileSync(SERVICES_CONFIG_PATH, JSON.stringify(services, null, 2));
}

export async function checkServiceStatus(
  service: MicroService
): Promise<ServiceStatus> {
  return new Promise((resolve) => {
    exec(`lsof -i:${service.port}`, (error, stdout) => {
      if (error) {
        resolve("stopped");
        return;
      }

      if (stdout.includes("node")) {
        resolve("running");
      } else {
        resolve("unknown");
      }
    });
  });
}

async function waitForServiceReady(service: MicroService): Promise<boolean> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const status = await checkServiceStatus(service);
    if (status === "running") {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
  }
  return false;
}

export async function startService(service: MicroService): Promise<boolean> {
  return new Promise((resolve) => {
    const cleanupPort = () => new Promise<void>((resolveCleanup) => {
      exec(`lsof -i:${service.port} -t | xargs kill -9 2>/dev/null || true`, async (error) => {
        if (error) {
          console.log(`Port ${service.port} is already free`);
        }
        
        const status = await checkServiceStatus(service);
        if (status === "running") {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        resolveCleanup();
      });
    });

    const initializeService = () => {
      const options: ExecOptions = {
        windowsHide: true,
        cwd: service.path
      };

      const child = exec(
        `yarn start`,
        options,
        (error: Error | null) => {
          if (error) {
            console.error(`Failed to start service ${service.name}:`, error);
            resolve(false);
            return;
          }
        }
      );

      if (child.stdout) child.stdout.pipe(process.stdout);
      if (child.stderr) child.stderr.pipe(process.stderr);
      
      waitForServiceReady(service).then((isReady) => {
        if (!isReady) {
          console.error(`Service ${service.name} failed to start within expected time`);
          resolve(false);
          return;
        }
        resolve(true);
      });
    };

    cleanupPort()
      .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
      .then(() => initializeService())
      .catch((error) => {
        console.error(`Unexpected error while starting service ${service.name}:`, error);
        resolve(false);
      });
  });
}

export async function stopService(service: MicroService): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`lsof -i:${service.port} -t | xargs kill -9`, (error) => {
      if (error) {
        console.error(`Failed to stop service ${service.name}:`, error);
        resolve(false);
        return;
      }

      const checkStopped = () => {
        let retries = 0;
        const check = () => {
          checkServiceStatus(service).then(status => {
            if (status === "stopped") {
              resolve(true);
              return;
            }
            
            retries++;
            if (retries >= MAX_RETRIES) {
              console.error(`Service ${service.name} did not stop within expected time`);
              resolve(false);
              return;
            }
            
            setTimeout(check, RETRY_INTERVAL);
          });
        };
        check();
      };

      checkStopped();
    });
  });
}
