import { useEffect, useRef, useState } from 'react';
import type { MicroService } from '~/utils/types';

interface ServiceLogsProps {
  service: MicroService;
}

export default function ServiceLogs({ service }: ServiceLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws?serviceId=${service.id}`,
    );
    wsRef.current = ws;

    ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'log') {
          setLogs(prev => [...prev, message.data]);

          // Auto-scroll to bottom
          if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop =
              logsContainerRef.current.scrollHeight;
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [service.id]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Service Logs</h3>
      <div
        ref={logsContainerRef}
        className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-[400px] overflow-y-auto"
      >
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs available yet...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
