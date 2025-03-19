import { useEffect, useRef, useReducer, useCallback } from 'react';

export interface LogEntry {
  message: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  timestamp: string;
}

export const LOG_LIMIT_OPTIONS = [100, 500, 1000, 2000, 5000] as const;
export type LogLimit = (typeof LOG_LIMIT_OPTIONS)[number];

interface LogState {
  logs: LogEntry[];
  totalLogs: number;
  maxLogs: LogLimit;
  autoScroll: boolean;
}

type LogAction =
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_MAX_LOGS'; payload: LogLimit }
  | { type: 'SET_AUTO_SCROLL'; payload: boolean };

const initialState: LogState = {
  logs: [],
  totalLogs: 0,
  maxLogs: 1000,
  autoScroll: true,
};

function logReducer(state: LogState, action: LogAction): LogState {
  switch (action.type) {
    case 'ADD_LOG':
      return {
        ...state,
        logs: [...state.logs, action.payload].slice(-state.maxLogs),
        totalLogs: state.totalLogs + 1,
      };
    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
        totalLogs: 0,
      };
    case 'SET_MAX_LOGS':
      return {
        ...state,
        maxLogs: action.payload,
        logs: state.logs.slice(-action.payload),
      };
    case 'SET_AUTO_SCROLL':
      return {
        ...state,
        autoScroll: action.payload,
      };
    default:
      return state;
  }
}

interface UseServiceLogsOptions {
  serviceId: string;
  isVisible: boolean;
}

export function useServiceLogs({
  serviceId,
  isVisible,
}: UseServiceLogsOptions) {
  const [state, dispatch] = useReducer(logReducer, initialState);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleNewLog = useCallback((logData: LogEntry) => {
    dispatch({ type: 'ADD_LOG', payload: logData });
  }, []);

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
  }, []);

  const setMaxLogs = useCallback((limit: LogLimit) => {
    dispatch({ type: 'SET_MAX_LOGS', payload: limit });
  }, []);

  const setAutoScroll = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_SCROLL', payload: enabled });
  }, []);

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

    eventSource.onmessage = event => {
      try {
        const logData = JSON.parse(event.data) as LogEntry;
        handleNewLog(logData);
      } catch (e) {
        console.error('Error parsing log data:', e);
      }
    };

    eventSource.onerror = error => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [serviceId, isVisible, handleNewLog]);

  return {
    logs: state.logs,
    totalLogs: state.totalLogs,
    maxLogs: state.maxLogs,
    autoScroll: state.autoScroll,
    actions: {
      clearLogs,
      setMaxLogs,
      setAutoScroll,
    },
  };
}
