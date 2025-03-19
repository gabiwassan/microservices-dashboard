import { useRef, useEffect } from 'react';
import {
  useServiceLogs,
  LOG_LIMIT_OPTIONS,
  type LogEntry,
  type LogLimit,
} from '../hooks/use-service-logs';
import type { ServiceStatus } from '../utils/types';

interface ServiceLogsProps {
  serviceId: string;
  serviceName: string;
  isVisible: boolean;
  onClose: () => void;
  status: ServiceStatus;
}

export default function ServiceLogs({
  serviceId,
  serviceName,
  isVisible,
  onClose,
  status,
}: ServiceLogsProps) {
  const {
    logs,
    totalLogs,
    maxLogs,
    autoScroll,
    actions: { clearLogs, setMaxLogs, setAutoScroll },
  } = useServiceLogs({
    serviceId,
    isVisible,
  });

  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logsContainerRef.current && logs.length > 0) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (logsContainerRef.current) {
      const container = logsContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      setAutoScroll(isNearBottom);
    }
  };

  const handleScrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  const getLogStyles = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-950/30';
      case 'warn':
        return 'text-yellow-400 bg-yellow-950/30';
      case 'debug':
        return 'text-blue-400 bg-blue-950/30';
      case 'verbose':
        return 'text-purple-400 bg-purple-950/30';
      default:
        return 'text-green-400 bg-transparent';
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
        className={`
          fixed inset-0 backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isVisible ? 'bg-black/70' : 'bg-black/0'}
        `}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="document"
        className={`
          bg-gray-900 w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg 
          flex flex-col overflow-hidden relative z-10
          shadow-2xl shadow-purple-500/10
          transition-all duration-500 ease-out transform
          ${isVisible ? 'opacity-100 scale-100 translate-y-0 rotate-0' : 'opacity-0 scale-90 translate-y-8 rotate-1'}
        `}
      >
        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-white flex items-center space-x-2"
            >
              <span className="text-purple-400">{serviceName}</span>
              <span className="text-gray-400">Logs</span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusStyles()} animate-pulse`}
                />
                <span className="text-sm text-gray-400">
                  Showing {logs.length} of {totalLogs} lines
                  {totalLogs > maxLogs && (
                    <span className="text-yellow-400 ml-2">
                      (Limited to last {maxLogs})
                    </span>
                  )}
                </span>
              </div>
              <select
                value={maxLogs}
                onChange={e => setMaxLogs(Number(e.target.value) as LogLimit)}
                className="bg-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {LOG_LIMIT_OPTIONS.map(limit => (
                  <option key={limit} value={limit}>
                    Show {limit} logs
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close logs"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          ref={logsContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 font-mono text-sm overscroll-contain"
          onWheel={e => e.stopPropagation()}
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
                  className={`flex whitespace-pre-wrap break-all rounded transition-colors ${getLogStyles(log.level)}`}
                >
                  <div className="w-12 flex-none px-2 py-1 text-gray-500 select-none border-r border-gray-800">
                    {totalLogs - logs.length + index + 1}
                  </div>
                  <div className="flex-1 px-2 py-1">{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="text-sm text-gray-400">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-gray-400">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="text-sm text-gray-400">Info</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-400" />
                <span className="text-sm text-gray-400">Debug</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-400" />
                <span className="text-sm text-gray-400">Verbose</span>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`
                  px-4 py-2 rounded-lg border transition-colors
                  ${
                    autoScroll
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20'
                      : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  }
                `}
              >
                Auto-scroll {autoScroll ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={handleScrollToBottom}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors"
              >
                Scroll to Bottom ⬇️
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Clear Logs 🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
