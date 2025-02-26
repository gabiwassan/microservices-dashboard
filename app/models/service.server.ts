import { exec, ExecOptions, spawn } from "child_process";
import path from "path";
import fs from "fs";
import { MicroService, ServiceStatus } from "~/utils/types";

const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 1000;

function ensureLogDirectory(servicePath: string): string {
  const logDir = path.join(servicePath, "logs");
  const logFile = path.join(logDir, "service.log");
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  return logFile;
}

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
      const logFile = ensureLogDirectory(service.path);
      const logStream = fs.createWriteStream(logFile, { flags: "a" });
      
      const options: ExecOptions = {
        windowsHide: true,
        cwd: service.path
      };

      const timestamp = () => new Date().toISOString();
      logStream.write(`\n[${timestamp()}] Starting service ${service.name}...\n`);

      const child = spawn(
        "yarn",
        ["start"],
        options
      );

      child.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line: string) => {
          if (line.trim()) {
            logStream.write(`[${timestamp()}] ${line}\n`);
          }
        });
      });

      child.stderr.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line: string) => {
          if (line.trim()) {
            logStream.write(`[${timestamp()}] ERROR: ${line}\n`);
          }
        });
      });

      child.on("error", (error) => {
        logStream.write(`[${timestamp()}] Failed to start service: ${error.message}\n`);
        console.error(`Failed to start service ${service.name}:`, error);
        resolve(false);
      });

      waitForServiceReady(service).then((isReady) => {
        if (!isReady) {
          logStream.write(`[${timestamp()}] Service failed to start within expected time\n`);
          console.error(`Service ${service.name} failed to start within expected time`);
          resolve(false);
          return;
        }
        logStream.write(`[${timestamp()}] Service started successfully\n`);
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
    const logFile = ensureLogDirectory(service.path);
    const logStream = fs.createWriteStream(logFile, { flags: "a" });
    const timestamp = () => new Date().toISOString();

    logStream.write(`\n[${timestamp()}] Stopping service ${service.name}...\n`);

    exec(`lsof -i:${service.port} -t | xargs kill -9`, (error) => {
      if (error) {
        logStream.write(`[${timestamp()}] Failed to stop service: ${error.message}\n`);
        console.error(`Failed to stop service ${service.name}:`, error);
        resolve(false);
        return;
      }

      const checkStopped = () => {
        let retries = 0;
        const check = () => {
          checkServiceStatus(service).then(status => {
            if (status === "stopped") {
              logStream.write(`[${timestamp()}] Service stopped successfully\n`);
              resolve(true);
              return;
            }
            
            retries++;
            if (retries >= MAX_RETRIES) {
              logStream.write(`[${timestamp()}] Service did not stop within expected time\n`);
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
