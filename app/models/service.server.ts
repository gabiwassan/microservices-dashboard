import { exec, spawn, SpawnOptions } from "child_process";
import path from "path";
import fs from "fs";
import { MicroService, ServiceStatus } from "~/utils/types";
import { broadcastServiceLogs } from "~/utils/websocket.server";

const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 1000;

/**
 * Ensures a port is free by killing any process using it
 */
export async function cleanupPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    console.info(`🔄 Attempting to free port ${port}...`);

    exec(
      `lsof -i:${port} -t | xargs kill -9 2>/dev/null || true`,
      async (error) => {
        if (error) {
          console.info(`✨ Port ${port} is already free`);
          resolve(true);
          return;
        }

        // Wait a bit to ensure the port is really free
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.info(`✅ Port ${port} has been freed successfully`);
        resolve(true);
      }
    );
  });
}

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
        resolve("stopped");
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
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
  }
  return false;
}

export async function startService(service: MicroService): Promise<boolean> {
  return new Promise((resolve) => {
    const startServiceProcess = async () => {
      try {
        console.info(`🚀 Starting service: ${service.name}`);

        // First ensure the port is free
        await cleanupPort(service.port);

        const initializeService = () => {
          const logFile = ensureLogDirectory(service.path);
          const logStream = fs.createWriteStream(logFile, { flags: "a" });

          const options: SpawnOptions = {
            windowsHide: true,
            cwd: service.path,
            stdio: ["inherit", "pipe", "pipe"], // Changed to pipe stdout and stderr
          };

          const timestamp = () => new Date().toISOString();
          const logMessage = `[${timestamp()}] Starting service ${
            service.name
          }...`;
          logStream.write(`\n${logMessage}\n`);
          broadcastServiceLogs(service.id, logMessage);

          const child = spawn("yarn", ["start"], options);

          if (child.stdout) {
            child.stdout.on("data", (data: Buffer) => {
              const lines = data.toString().split("\n");
              lines.forEach((line: string) => {
                if (line.trim()) {
                  const logLine = `[${timestamp()}] ${line}`;
                  logStream.write(`${logLine}\n`);
                  broadcastServiceLogs(service.id, logLine);
                }
              });
            });
          }

          if (child.stderr) {
            child.stderr.on("data", (data: Buffer) => {
              const lines = data.toString().split("\n");
              lines.forEach((line: string) => {
                if (line.trim()) {
                  const logLine = `[${timestamp()}] ERROR: ${line}`;
                  logStream.write(`${logLine}\n`);
                  broadcastServiceLogs(service.id, logLine);
                }
              });
            });
          }

          child.on("error", (error) => {
            const errorMessage = `Failed to start service ${service.name}: ${error.message}`;
            logStream.write(`[${timestamp()}] ${errorMessage}\n`);
            broadcastServiceLogs(service.id, errorMessage);
            console.error(`❌ ${errorMessage}`);
            resolve(false);
          });

          waitForServiceReady(service).then((isReady) => {
            if (!isReady) {
              const timeoutMessage = `Service ${service.name} failed to start within expected time`;
              logStream.write(`[${timestamp()}] ${timeoutMessage}\n`);
              broadcastServiceLogs(service.id, timeoutMessage);
              console.error(`⏰ ${timeoutMessage}`);
              resolve(false);
              return;
            }
            const successMessage = `Service ${service.name} started successfully`;
            logStream.write(`[${timestamp()}] ${successMessage}\n`);
            broadcastServiceLogs(service.id, successMessage);
            console.info(`✅ ${successMessage}`);
            resolve(true);
          });
        };

        // Small delay to ensure port is really free
        await new Promise((resolve) => setTimeout(resolve, 1000));
        initializeService();
      } catch (error) {
        const errorMessage = `Unexpected error while starting service ${service.name}: ${error}`;
        console.error(`❌ ${errorMessage}`);
        broadcastServiceLogs(service.id, errorMessage);
        resolve(false);
      }
    };

    startServiceProcess();
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
        logStream.write(
          `[${timestamp()}] Failed to stop service: ${error.message}\n`
        );
        console.error(`Failed to stop service ${service.name}:`, error);
        resolve(false);
        return;
      }

      const checkStopped = () => {
        let retries = 0;
        const check = () => {
          checkServiceStatus(service).then((status) => {
            if (status === "stopped") {
              logStream.write(
                `[${timestamp()}] Service stopped successfully\n`
              );
              resolve(true);
              return;
            }

            retries++;
            if (retries >= MAX_RETRIES) {
              logStream.write(
                `[${timestamp()}] Service did not stop within expected time\n`
              );
              console.error(
                `Service ${service.name} did not stop within expected time`
              );
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
