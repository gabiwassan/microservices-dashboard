import { exec, ExecOptions } from "child_process";
import path from "path";
import fs from "fs";
import { MicroService, ServiceStatus } from "~/utils/types";

const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");

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

export async function startService(service: MicroService): Promise<boolean> {
  return new Promise((resolve) => {
    const options: ExecOptions = {
      windowsHide: true
    };

    exec(
      `cd ${service.path} && yarn start`,
      options,
      (error: Error | null) => {
        if (error) {
          console.error(`Error al iniciar el servicio ${service.name}:`, error);
          resolve(false);
          return;
        }
        resolve(true);
      }
    );
  });
}

// Detener un servicio
export async function stopService(service: MicroService): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`lsof -i:${service.port} -t | xargs kill -9`, (error) => {
      if (error) {
        console.error(`Error al detener el servicio ${service.name}:`, error);
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}
