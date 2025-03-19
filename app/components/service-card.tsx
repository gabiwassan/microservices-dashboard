import { Link, useNavigation, useSubmit, useRevalidator } from "react-router";
import { useEffect, useState, lazy, Suspense } from "react";
import { MicroService } from "../utils/types";
import ServiceStatusBadge from "./service-status-badge";
import ServiceLogs from "./service-logs";

const ReactConfetti = lazy(() => import("react-confetti"));

interface ServiceCardProps {
  service: MicroService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const isRunning = service.status === "running";
  const submit = useSubmit();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<
    "start" | "stop" | null
  >(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (isBrowser) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isBrowser]);

  useEffect(() => {
    if (navigation.formData) {
      const formData = navigation.formData;
      const actionType = formData.get("action") as string;
      const serviceId = formData.get("serviceId");

      if (serviceId === service.id) {
        if (actionType === "start" || actionType === "stop") {
          setIsProcessing(true);
          setProcessingAction(actionType);
        }
      }
    } else if (isProcessing) {
      const timer = setTimeout(() => {
        if (processingAction === "start" && service.status === "running") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }

        revalidator.revalidate();
        setIsProcessing(false);
        setProcessingAction(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    navigation.formData,
    service.id,
    isProcessing,
    revalidator,
    processingAction,
    service.status,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isProcessing) {
      timer = setInterval(() => {
        revalidator.revalidate();
      }, 2000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isProcessing, revalidator]);

  const handleAction = (action: "start" | "stop" | "refresh" | "logs") => {
    if (action === "refresh") {
      revalidator.revalidate();
      return;
    }

    if (action === "logs") {
      setShowLogs(!showLogs);
      return;
    }

    const formData = new FormData();
    formData.append("action", action);
    formData.append("serviceId", service.id);
    submit(formData, { method: "post" });
  };

  const ConfettiEffect = () => {
    if (!isBrowser || !showConfetti) return null;

    return (
      <Suspense fallback={null}>
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={20000}
          gravity={0.2}
        />
      </Suspense>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 
      border border-gray-100 dark:border-gray-700
      transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5
      overflow-hidden relative"
    >
      <ConfettiEffect />
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {service.name}
              <ServiceStatusBadge status={service.status} />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Port:{" "}
              <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                {service.port}
              </span>
            </p>
          </div>
          <Link
            to={`http://localhost:${service.port}/api`}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 
              text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors duration-200 flex items-center gap-1 group"
          >
            <span>API</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {service.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Last Started
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {service.lastStarted
                ? new Date(service.lastStarted).toLocaleString()
                : "Never"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Last Stopped
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {service.lastStopped
                ? new Date(service.lastStopped).toLocaleString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      <div
        className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700
        flex items-center justify-end gap-2"
      >
        <div className="flex items-center gap-2 w-full max-w-lg ml-auto">
          <button
            onClick={() => handleAction(isRunning ? "stop" : "start")}
            disabled={isProcessing}
            className={`
              w-28
              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
              text-xs font-medium rounded-lg border whitespace-nowrap
              transition-all duration-200
              ${
                isProcessing
                  ? "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600/80 dark:hover:text-gray-200"
                  : isRunning
                  ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/30 dark:hover:border-red-500/30 dark:hover:text-red-400"
                  : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 hover:text-green-600 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/30 dark:hover:border-green-500/30 dark:hover:text-green-400"
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-1.5">
                <svg
                  className="animate-spin w-3.5 h-3.5 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>
                  {processingAction === "start" ? "Starting" : "Stopping"}
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                {isRunning ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                    </svg>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    <span>Start</span>
                  </>
                )}
              </span>
            )}
          </button>

          <button
            onClick={() => handleAction("logs")}
            className={`
              w-28
              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
              text-xs font-medium rounded-lg border whitespace-nowrap
              transition-all duration-200
              ${
                showLogs
                  ? "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 hover:text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 dark:hover:bg-purple-500/30 dark:hover:border-purple-500/30 dark:hover:text-purple-400"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600/80 dark:hover:text-gray-200"
              }
            `}
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 01-.522 1.756.75.75 0 00.584 1.143 5.976 5.976 0 003.936-1.108c.487.082.99.124 1.503.124 4.31 0 8-3.033 8-7s-3.69-7-8-7z" />
            </svg>
            <span>Logs</span>
          </button>

          <button
            onClick={() => handleAction("refresh")}
            disabled={isProcessing}
            className="
              w-28
              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
              text-xs font-medium rounded-lg border whitespace-nowrap
              bg-gray-50 text-gray-600 border-gray-200 
              hover:bg-gray-100 
              dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 
              dark:hover:bg-gray-600
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                clipRule="evenodd"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <ServiceLogs
        serviceId={service.id}
        serviceName={service.name}
        isVisible={showLogs}
        onClose={() => setShowLogs(false)}
        status={service.status}
      />
    </div>
  );
}
