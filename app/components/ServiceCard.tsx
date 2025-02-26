import { Link, useNavigation, useSubmit, useRevalidator } from "@remix-run/react";
import { useEffect, useState } from "react";
import { MicroService } from "~/utils/types";
import ServiceStatusBadge from "./ServiceStatusBadge";

interface ServiceCardProps {
  service: MicroService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const isRunning = service.status === "running";
  const submit = useSubmit();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<"start" | "stop" | null>(null);

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
        revalidator.revalidate();
        setIsProcessing(false);
        setProcessingAction(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [navigation.formData, service.id, isProcessing, revalidator]);

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

  const handleAction = (action: "start" | "stop" | "refresh") => {
    if (action === "refresh") {
      revalidator.revalidate();
      return;
    }

    const formData = new FormData();
    formData.append("action", action);
    formData.append("serviceId", service.id);
    submit(formData, { method: "post" });
  };

  const getButtonState = () => {
    if (isProcessing) {
      return {
        text: "Processing... 🐢",
        className: "bg-gray-100 text-gray-500 cursor-not-allowed"
      };
    }

    if (isRunning) {
      return {
        text: "Stop 🔴",
        className: "bg-red-100 text-red-700 hover:bg-red-200"
      };
    }

    return {
      text: "Start 🚀",
      className: "bg-green-100 text-green-700 hover:bg-green-200"
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {service.name}
            </h3>
            <ServiceStatusBadge status={service.status} />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Port: {service.port}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {service.description}
        </p>

        <div className="mt-4">
          {service.lastStarted && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last started: {new Date(service.lastStarted).toLocaleString()}
            </p>
          )}
          {service.lastStopped && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last stopped: {new Date(service.lastStopped).toLocaleString()}
            </p>
          )}

          <Link
            to={`http://localhost:${service.port}/api`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
          >
            {`http://localhost:${service.port}`}
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex justify-end space-x-2">
        <button
          onClick={() => handleAction(isRunning ? "stop" : "start")}
          disabled={isProcessing}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${buttonState.className}`}
        >
          {isProcessing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {processingAction === "start" ? "Starting..." : "Stopping..."}
            </span>
          ) : (
            buttonState.text
          )}
        </button>

        <button
          onClick={() => handleAction("refresh")}
          disabled={isProcessing}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
