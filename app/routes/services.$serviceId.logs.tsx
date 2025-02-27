import { LoaderFunction } from "react-router";
import { spawn } from "child_process";
import { getServiceById } from "../utils/service-manager.server";

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

      const send = (data: string) => {
        controller.enqueue(`data: ${JSON.stringify({ message: data })}\n\n`);
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
        send(`Error: ${data.toString()}`);
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
