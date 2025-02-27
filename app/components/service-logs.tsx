import { useEffect, useRef, useState } from "react";

interface ServiceLogsProps {
  serviceId: string;
  serviceName: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function ServiceLogs({
  serviceId,
  serviceName,
  isVisible,
  onClose,
}: ServiceLogsProps) {
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
        setLogs((prev) => {
          const newLogs = [...prev, logData.message];
          return newLogs.slice(-500);
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
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }

    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [logs, isVisible]);

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
        }
      `}
    >
      {/* Overlay */}
      <div 
        className={`
          fixed inset-0 backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isVisible 
            ? 'bg-black/70' 
            : 'bg-black/0'
          }
        `} 
        aria-hidden="true"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        role="document"
        className={`
          bg-gray-900 w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg 
          flex flex-col overflow-hidden relative z-10
          shadow-2xl shadow-purple-500/10
          transition-all duration-500 ease-out transform
          ${isVisible 
            ? 'opacity-100 scale-100 translate-y-0 rotate-0' 
            : 'opacity-0 scale-90 translate-y-8 rotate-1'
          }
        `}
      >
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 id="modal-title" className="text-xl font-semibold text-white flex items-center space-x-2">
              <span className="text-purple-400">{serviceName}</span>
              <span className="text-gray-400">Logs</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">
                {logs.length} lines
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close logs"
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
                  logsContainerRef.current.scrollTop =
                    logsContainerRef.current.scrollHeight;
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
