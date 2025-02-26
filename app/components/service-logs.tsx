import { useEffect, useRef, useState } from "react";

interface ServiceLogsProps {
  serviceId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function ServiceLogs({ serviceId, isVisible, onClose }: ServiceLogsProps) {
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
          return newLogs.slice(-500); // Aumentamos a 500 líneas para el modal
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
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }

    // Prevenir scroll en el body cuando el modal está abierto
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [logs, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg flex flex-col overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">Service Logs</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">
                {logs.length} lines
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div 
          ref={logsContainerRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-sm"
        >
          {logs.length === 0 ? (
            <div className="text-gray-500 flex items-center justify-center h-full text-lg">
              <span>Waiting for logs...</span>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="text-green-400 whitespace-pre-wrap break-all hover:bg-gray-800/50 rounded px-2 py-1"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                if (logsContainerRef.current) {
                  logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                }
              }}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Scroll to Bottom ⬇️
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Logs 🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 