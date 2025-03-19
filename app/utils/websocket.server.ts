import { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage, Server as HttpServer } from 'http';

interface LogMessage {
  type: 'log';
  data: string;
  timestamp: string;
}

let wss: WebSocketServer | null = null;
const serviceLogClients = new Map<string, Set<WebSocket>>();

export function initializeWebSocketServer(server: HttpServer) {
  if (wss) {
    console.warn('WebSocket server already initialized');
    return;
  }

  wss = new WebSocketServer({
    server,
    path: '/ws',
  });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const serviceId = url.searchParams.get('serviceId');

      if (!serviceId) {
        console.warn('WebSocket connection attempt without serviceId');
        ws.close(1008, 'ServiceId is required');
        return;
      }

      // Add client to the service's client set
      if (!serviceLogClients.has(serviceId)) {
        serviceLogClients.set(serviceId, new Set());
      }

      const clients = serviceLogClients.get(serviceId);
      if (clients) {
        clients.add(ws);
        console.log(
          `Client connected to service ${serviceId}. Total clients: ${clients.size}`,
        );
      }

      // Setup heartbeat
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle client disconnect
      ws.on('close', () => {
        const clients = serviceLogClients.get(serviceId);
        if (clients) {
          clients.delete(ws);
          console.log(
            `Client disconnected from service ${serviceId}. Remaining clients: ${clients.size}`,
          );

          if (clients.size === 0) {
            serviceLogClients.delete(serviceId);
            console.log(`No more clients for service ${serviceId}`);
          }
        }
      });

      // Handle errors
      ws.on('error', error => {
        console.error(`WebSocket error for service ${serviceId}:`, error);
      });
    } catch (error) {
      console.error('Error handling WebSocket connection:', error);
      ws.close(1011, 'Internal server error');
    }
  });

  // Setup heartbeat interval
  const interval = setInterval(() => {
    if (!wss) return;

    wss.clients.forEach((ws: WebSocket) => {
      if (!ws.isAlive) {
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('WebSocket server initialized');
}

export function broadcastServiceLogs(serviceId: string, log: string): void {
  const clients = serviceLogClients.get(serviceId);
  if (!clients || clients.size === 0) return;

  const message: LogMessage = {
    type: 'log',
    data: log,
    timestamp: new Date().toISOString(),
  };

  const messageStr = JSON.stringify(message);

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error(
          `Error sending log to client for service ${serviceId}:`,
          error,
        );
        client.terminate();
      }
    }
  });
}

// Extend WebSocket type to include isAlive property
declare module 'ws' {
  interface WebSocket {
    isAlive: boolean;
  }
}
