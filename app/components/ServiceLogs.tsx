import { useEffect, useRef, useState } from "react";

interface ServiceLogsProps {
  serviceId: string;
  isVisible: boolean;
}

export default function ServiceLogs({ serviceId, isVisible }: ServiceLogsProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isVisible) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const eventSource = new EventSource(`/services/${serviceId}/logs`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        setLogs(prev => {
          const newLogs = [...prev, logData.message];
          return newLogs.slice(-100); // Mantener solo las últimas 100 líneas
        });
      } catch (e) {
        console.error("Error parsing log data:", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [serviceId, isVisible]);

  useEffect(() => {
    if (logsContainerRef.current && isVisible) {
      const container = logsContainerRef.current;
      // Solo hacer auto-scroll si el usuario está cerca del final
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="mt-4 border rounded-lg dark:border-gray-600 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-600 flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Logs</h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {logs.length} lines
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <div
        ref={logsContainerRef}
        className="bg-gray-900 text-green-400 font-mono text-sm p-4 h-64 overflow-y-auto"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 flex items-center justify-center h-full">
            <span>Waiting for logs...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className="whitespace-pre-wrap break-all hover:bg-gray-800/50 rounded px-1"
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 