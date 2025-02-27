import { LoaderFunction } from "react-router";
import { spawn } from "child_process";
import { getServiceById } from "../utils/service-manager.server";

type LogLevel = "error" | "warn" | "info" | "debug" | "verbose";

interface LogMessage {
  message: string;
  level: LogLevel;
  timestamp: string;
}

function detectLogLevel(line: string): LogLevel {
  const lowerLine = line.toLowerCase();
  
  if (lowerLine.includes("[error]") || 
      lowerLine.includes("error:") || 
      lowerLine.includes("uncaughtexception") ||
      lowerLine.includes("unhandledrejection")) {
    return "error";
  }
  
  if (lowerLine.includes("[warn]") || 
      lowerLine.includes("warning:") ||
      lowerLine.includes("deprecated")) {
    return "warn";
  }
  
  if (lowerLine.includes("[debug]")) {
    return "debug";
  }
  
  if (lowerLine.includes("[verbose]")) {
    return "verbose";
  }
  
  return "info";
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const serviceId = params.serviceId;

  if (!serviceId) {
    return new Response("Service ID is required", { status: 400 });
  }

  const service = await getServiceById(serviceId);
  
  if (!service) {
    return new Response("Service not found", { status: 404 });
  }
  
  
  // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream 
  // Aca esta el tema... 
  // 🤓
  // 🤔
  // 🤯
  // 🤗
  // 🤡
  // 🤖
  // 🤗
  const stream = new ReadableStream({
    start(controller) {
      const tail = spawn("tail", ["-f", `${service.path}/logs/service.log`]);
      let buffer = "";

      const send = (line: string) => {
        const level = detectLogLevel(line);
        const logMessage: LogMessage = {
          message: line,
          level,
          timestamp: new Date().toISOString()
        };
        controller.enqueue(`data: ${JSON.stringify(logMessage)}\n\n`);
      };

      tail.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        lines.forEach(line => {
          if (line.trim()) {
            send(line);
          }
        });
      });

      tail.stderr.on("data", (data) => {
        const logMessage: LogMessage = {
          message: `Error: ${data.toString()}`,
          level: "error",
          timestamp: new Date().toISOString()
        };
        controller.enqueue(`data: ${JSON.stringify(logMessage)}\n\n`);
      });

      request.signal.addEventListener("abort", () => {
        tail.kill();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
};
