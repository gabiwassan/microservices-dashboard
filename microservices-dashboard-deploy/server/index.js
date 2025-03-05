import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, Meta, Links, Outlet, ScrollRestoration, Scripts, redirect, Form, useSubmit, useNavigation, useRevalidator, Link } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useState, useEffect, useReducer, useRef, useCallback } from "react";
import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, reactRouterContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: reactRouterContext,
          url: request.url
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, reactRouterContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: reactRouterContext,
          url: request.url
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
const styles = "/assets/tailwind-BqJoh03_.css";
const themeScript = `
  let isDark;
  const stored = localStorage.getItem('theme');
  
  if (stored) {
    isDark = stored === 'dark';
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
`;
const links = () => [{
  rel: "stylesheet",
  href: styles
}];
const root = withComponentProps(function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return false;
  });
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem("theme");
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    const handleChange = (e) => {
      if (!stored) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    setIsDarkMode(newTheme);
  };
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    className: isDarkMode ? "dark" : "",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width,initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: themeScript
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      className: "bg-gray-50 dark:bg-gray-900 min-h-screen",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
        children: [/* @__PURE__ */ jsxs("header", {
          className: "mb-8 flex justify-between items-center",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold text-gray-900 dark:text-white",
            children: "Dashboard Services"
          }), /* @__PURE__ */ jsxs("button", {
            onClick: toggleTheme,
            className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 \n                text-gray-900 dark:text-white\n                hover:bg-gray-200 dark:hover:bg-gray-700\n                focus:outline-none focus:ring-2 focus:ring-purple-500/50\n                transition-all duration-500 ease-out\n                group relative flex items-center justify-center w-10 h-10",
            "aria-label": isDarkMode ? "Switch to light mode" : "Switch to dark mode",
            children: [/* @__PURE__ */ jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1.5,
              stroke: "currentColor",
              className: `w-5 h-5 absolute transition-all duration-500
                  ${isDarkMode ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`,
              children: /* @__PURE__ */ jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              })
            }), /* @__PURE__ */ jsx("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              strokeWidth: 1.5,
              stroke: "currentColor",
              className: `w-5 h-5 absolute transition-all duration-500
                  ${isDarkMode ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`,
              children: /* @__PURE__ */ jsx("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              })
            }), /* @__PURE__ */ jsx("div", {
              className: "absolute inset-0 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700"
            }), /* @__PURE__ */ jsx("div", {
              className: "absolute inset-0 rounded-lg bg-gradient-to-tr from-purple-500/0 to-purple-500/0 \n                  group-hover:from-purple-500/5 group-hover:to-purple-500/10 \n                  dark:group-hover:from-purple-400/5 dark:group-hover:to-purple-400/10 \n                  transition-all duration-500"
            })]
          })]
        }), /* @__PURE__ */ jsx("main", {
          children: /* @__PURE__ */ jsx(Outlet, {})
        })]
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 1e3;
function ensureLogDirectory(servicePath) {
  const logDir = path.join(servicePath, "logs");
  const logFile = path.join(logDir, "service.log");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logFile;
}
async function loadServices() {
  if (!fs.existsSync(SERVICES_CONFIG_PATH)) {
    const defaultServices = [];
    fs.writeFileSync(
      SERVICES_CONFIG_PATH,
      JSON.stringify(defaultServices, null, 2)
    );
    return defaultServices;
  }
  const data = fs.readFileSync(SERVICES_CONFIG_PATH, "utf8");
  return JSON.parse(data);
}
async function saveServices(services2) {
  fs.writeFileSync(SERVICES_CONFIG_PATH, JSON.stringify(services2, null, 2));
}
async function checkServiceStatus(service) {
  return new Promise((resolve) => {
    exec(`lsof -i:${service.port}`, (error, stdout) => {
      if (error) {
        resolve("stopped");
        return;
      }
      if (stdout.includes("node")) {
        resolve("running");
      } else {
        resolve("unknown");
      }
    });
  });
}
async function waitForServiceReady(service) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const status = await checkServiceStatus(service);
    if (status === "running") {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
  }
  return false;
}
async function startService(service) {
  return new Promise((resolve) => {
    const cleanupPort = () => new Promise((resolveCleanup) => {
      exec(`lsof -i:${service.port} -t | xargs kill -9 2>/dev/null || true`, async (error) => {
        if (error) {
          console.log(`Port ${service.port} is already free`);
        }
        const status = await checkServiceStatus(service);
        if (status === "running") {
          await new Promise((resolve2) => setTimeout(resolve2, 1e3));
        }
        resolveCleanup();
      });
    });
    const initializeService = () => {
      const logFile = ensureLogDirectory(service.path);
      const logStream = fs.createWriteStream(logFile, { flags: "a" });
      const options = {
        windowsHide: true,
        cwd: service.path
      };
      const timestamp = () => (/* @__PURE__ */ new Date()).toISOString();
      logStream.write(`
[${timestamp()}] Starting service ${service.name}...
`);
      const child = spawn(
        "yarn",
        ["start"],
        options
      );
      child.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            logStream.write(`[${timestamp()}] ${line}
`);
          }
        });
      });
      child.stderr.on("data", (data) => {
        const lines = data.toString().split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            logStream.write(`[${timestamp()}] ERROR: ${line}
`);
          }
        });
      });
      child.on("error", (error) => {
        logStream.write(`[${timestamp()}] Failed to start service: ${error.message}
`);
        console.error(`Failed to start service ${service.name}:`, error);
        resolve(false);
      });
      waitForServiceReady(service).then((isReady) => {
        if (!isReady) {
          logStream.write(`[${timestamp()}] Service failed to start within expected time
`);
          console.error(`Service ${service.name} failed to start within expected time`);
          resolve(false);
          return;
        }
        logStream.write(`[${timestamp()}] Service started successfully
`);
        resolve(true);
      });
    };
    cleanupPort().then(() => new Promise((resolve2) => setTimeout(resolve2, 1e3))).then(() => initializeService()).catch((error) => {
      console.error(`Unexpected error while starting service ${service.name}:`, error);
      resolve(false);
    });
  });
}
async function stopService(service) {
  return new Promise((resolve) => {
    const logFile = ensureLogDirectory(service.path);
    const logStream = fs.createWriteStream(logFile, { flags: "a" });
    const timestamp = () => (/* @__PURE__ */ new Date()).toISOString();
    logStream.write(`
[${timestamp()}] Stopping service ${service.name}...
`);
    exec(`lsof -i:${service.port} -t | xargs kill -9`, (error) => {
      if (error) {
        logStream.write(`[${timestamp()}] Failed to stop service: ${error.message}
`);
        console.error(`Failed to stop service ${service.name}:`, error);
        resolve(false);
        return;
      }
      const checkStopped = () => {
        let retries = 0;
        const check = () => {
          checkServiceStatus(service).then((status) => {
            if (status === "stopped") {
              logStream.write(`[${timestamp()}] Service stopped successfully
`);
              resolve(true);
              return;
            }
            retries++;
            if (retries >= MAX_RETRIES) {
              logStream.write(`[${timestamp()}] Service did not stop within expected time
`);
              console.error(`Service ${service.name} did not stop within expected time`);
              resolve(false);
              return;
            }
            setTimeout(check, RETRY_INTERVAL);
          });
        };
        check();
      };
      checkStopped();
    });
  });
}
async function getAllServices() {
  const services2 = await loadServices();
  const servicesWithStatus = await Promise.all(
    services2.map(async (service) => {
      const status = await checkServiceStatus(service);
      return { ...service, status };
    })
  );
  return servicesWithStatus;
}
async function getServiceById(id) {
  const services2 = await loadServices();
  const service = services2.find((s) => s.id === id);
  if (service) {
    service.status = await checkServiceStatus(service);
    console.log("Service status:", service.status);
  }
  return service;
}
async function startServiceById(id) {
  const services2 = await loadServices();
  const serviceIndex = services2.findIndex((s) => s.id === id);
  console.log("Service index:", serviceIndex);
  if (serviceIndex === -1) {
    return false;
  }
  try {
    console.log("Starting service:", services2[serviceIndex]);
    const success = await startService(services2[serviceIndex]);
    console.log("Service started:", success);
    if (success) {
      services2[serviceIndex].lastStarted = /* @__PURE__ */ new Date();
      services2[serviceIndex].status = "running";
      await saveServices(services2);
    }
    return success;
  } catch (error) {
    console.error("Error starting service:", error);
    return false;
  }
}
async function stopServiceById(id) {
  const services2 = await loadServices();
  const serviceIndex = services2.findIndex((s) => s.id === id);
  if (serviceIndex === -1) {
    return false;
  }
  const success = await stopService(services2[serviceIndex]);
  if (success) {
    services2[serviceIndex].lastStopped = /* @__PURE__ */ new Date();
    services2[serviceIndex].status = "stopped";
    await saveServices(services2);
  }
  return success;
}
async function addService(service) {
  const services2 = await loadServices();
  const newService = {
    ...service,
    id: crypto.randomUUID(),
    status: "stopped"
  };
  services2.push(newService);
  await saveServices(services2);
  return newService;
}
async function removeService(id) {
  const services2 = await loadServices();
  const serviceIndex = services2.findIndex((s) => s.id === id);
  if (serviceIndex === -1) {
    return false;
  }
  await stopService(services2[serviceIndex]);
  services2.splice(serviceIndex, 1);
  await saveServices(services2);
  return true;
}
const loader$2 = async () => {
  const services2 = await getAllServices();
  return new Response(JSON.stringify({
    services: services2
  }), {
    headers: {
      "Content-Type": "application/json"
    }
  });
};
const action$1 = async ({
  request
}) => {
  const formData = await request.formData();
  const action2 = formData.get("action");
  if (action2 === "add") {
    const name = formData.get("name");
    const description = formData.get("description");
    const port = parseInt(formData.get("port"), 10);
    const path2 = formData.get("path");
    if (!name || !port || !path2) {
      return {
        error: "All fields are required"
      };
    }
    await addService({
      name,
      description,
      port,
      path: path2
    });
  } else if (action2 === "remove") {
    const serviceId = formData.get("serviceId");
    await removeService(serviceId);
  } else if (action2 === "start") {
    const serviceId = formData.get("serviceId");
    await startServiceById(serviceId);
  } else if (action2 === "stop") {
    const serviceId = formData.get("serviceId");
    await stopServiceById(serviceId);
  }
  return redirect("/services");
};
const services = withComponentProps(function Services() {
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", {
    className: "bg-gray-100 dark:bg-gray-900 min-h-screen",
    children: [/* @__PURE__ */ jsx("div", {
      className: "mb-8",
      children: /* @__PURE__ */ jsx("div", {
        className: "bg-white dark:bg-gray-700 shadow rounded-lg",
        children: /* @__PURE__ */ jsxs("div", {
          className: "p-6",
          children: [(actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", {
            className: "mb-4 p-3 bg-red-100 text-red-800 rounded-md",
            children: actionData.error
          }), /* @__PURE__ */ jsxs(Form, {
            method: "post",
            className: "space-y-4",
            children: [/* @__PURE__ */ jsx("input", {
              type: "hidden",
              name: "action",
              value: "add"
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "name",
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Name"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                name: "name",
                id: "name",
                className: "mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                required: true
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "description",
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Description"
              }), /* @__PURE__ */ jsx("textarea", {
                name: "description",
                id: "description",
                rows: 3,
                className: "mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "port",
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Port"
              }), /* @__PURE__ */ jsx("input", {
                type: "number",
                name: "port",
                id: "port",
                className: "mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                required: true
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("label", {
                htmlFor: "path",
                className: "block text-sm font-medium text-gray-700 dark:text-gray-300",
                children: "Path"
              }), /* @__PURE__ */ jsx("input", {
                type: "text",
                name: "path",
                id: "path",
                className: "mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                placeholder: "absolute/path/to/service",
                required: true
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "flex justify-end",
              children: /* @__PURE__ */ jsx("button", {
                type: "submit",
                className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700",
                children: "Add Service"
              })
            })]
          })]
        })
      })
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-6",
      children: /* @__PURE__ */ jsx("a", {
        href: "/",
        className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600",
        children: "Back to Dashboard"
      })
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: services,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
function detectLogLevel(line) {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes("[error]") || lowerLine.includes("error:") || lowerLine.includes("uncaughtexception") || lowerLine.includes("unhandledrejection")) {
    return "error";
  }
  if (lowerLine.includes("[warn]") || lowerLine.includes("warning:") || lowerLine.includes("deprecated")) {
    return "warn";
  }
  if (lowerLine.includes("[debug]")) {
    return "debug";
  }
  if (lowerLine.includes("[verbose]")) {
    return "verbose";
  }
  return "info";
}
const loader$1 = async ({
  request,
  params
}) => {
  const serviceId = params.serviceId;
  if (!serviceId) {
    return new Response("Service ID is required", {
      status: 400
    });
  }
  const service = await getServiceById(serviceId);
  if (!service) {
    return new Response("Service not found", {
      status: 404
    });
  }
  const stream = new ReadableStream({
    start(controller) {
      const tail = spawn("tail", ["-f", `${service.path}/logs/service.log`]);
      let buffer = "";
      const send = (line) => {
        const level = detectLogLevel(line);
        const logMessage = {
          message: line,
          level,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        controller.enqueue(`data: ${JSON.stringify(logMessage)}

`);
      };
      tail.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        lines.forEach((line) => {
          if (line.trim()) {
            send(line);
          }
        });
      });
      tail.stderr.on("data", (data) => {
        const logMessage = {
          message: `Error: ${data.toString()}`,
          level: "error",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        controller.enqueue(`data: ${JSON.stringify(logMessage)}

`);
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
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
function ServiceStatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800";
      case "stopped":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };
  const getStatusText = () => {
    switch (status) {
      case "running":
        return "Running";
      case "stopped":
        return "Stopped";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`, children: [
    /* @__PURE__ */ jsx("span", { className: `w-2 h-2 mr-1.5 rounded-full ${status === "running" ? "bg-green-600 animate-pulse" : "bg-gray-400"}` }),
    getStatusText()
  ] });
}
const LOG_LIMIT_OPTIONS = [100, 500, 1e3, 2e3, 5e3];
const initialState = {
  logs: [],
  totalLogs: 0,
  maxLogs: 1e3,
  autoScroll: true
};
function logReducer(state, action2) {
  switch (action2.type) {
    case "ADD_LOG":
      return {
        ...state,
        logs: [...state.logs, action2.payload].slice(-state.maxLogs),
        totalLogs: state.totalLogs + 1
      };
    case "CLEAR_LOGS":
      return {
        ...state,
        logs: [],
        totalLogs: 0
      };
    case "SET_MAX_LOGS":
      return {
        ...state,
        maxLogs: action2.payload,
        logs: state.logs.slice(-action2.payload)
      };
    case "SET_AUTO_SCROLL":
      return {
        ...state,
        autoScroll: action2.payload
      };
    default:
      return state;
  }
}
function useServiceLogs({ serviceId, isVisible }) {
  const [state, dispatch] = useReducer(logReducer, initialState);
  const eventSourceRef = useRef(null);
  const handleNewLog = useCallback((logData) => {
    dispatch({ type: "ADD_LOG", payload: logData });
  }, []);
  const clearLogs = useCallback(() => {
    dispatch({ type: "CLEAR_LOGS" });
  }, []);
  const setMaxLogs = useCallback((limit) => {
    dispatch({ type: "SET_MAX_LOGS", payload: limit });
  }, []);
  const setAutoScroll = useCallback((enabled) => {
    dispatch({ type: "SET_AUTO_SCROLL", payload: enabled });
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
    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        handleNewLog(logData);
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
  }, [serviceId, isVisible, handleNewLog]);
  return {
    logs: state.logs,
    totalLogs: state.totalLogs,
    maxLogs: state.maxLogs,
    autoScroll: state.autoScroll,
    actions: {
      clearLogs,
      setMaxLogs,
      setAutoScroll
    }
  };
}
function ServiceLogs({
  serviceId,
  serviceName,
  isVisible,
  onClose,
  status
}) {
  const {
    logs,
    totalLogs,
    maxLogs,
    autoScroll,
    actions: { clearLogs, setMaxLogs, setAutoScroll }
  } = useServiceLogs({
    serviceId,
    isVisible
  });
  const logsContainerRef = useRef(null);
  useEffect(() => {
    if (autoScroll && logsContainerRef.current && logs.length > 0) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);
  const handleScroll = (e) => {
    e.stopPropagation();
    if (logsContainerRef.current) {
      const container = logsContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setAutoScroll(isNearBottom);
    }
  };
  const handleScrollToBottom = () => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };
  const getLogStyles = (level) => {
    switch (level) {
      case "error":
        return "text-red-400 bg-red-950/30";
      case "warn":
        return "text-yellow-400 bg-yellow-950/30";
      case "debug":
        return "text-blue-400 bg-blue-950/30";
      case "verbose":
        return "text-purple-400 bg-purple-950/30";
      default:
        return "text-green-400 bg-transparent";
    }
  };
  const getStatusStyles = () => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-red-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "modal-title",
      className: `
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-500 ease-out
        ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `
          fixed inset-0 backdrop-blur-sm
          transition-all duration-500 ease-out
          ${isVisible ? "bg-black/70" : "bg-black/0"}
        `,
            "aria-hidden": "true",
            onClick: onClose
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            role: "document",
            className: `
          bg-gray-900 w-full h-full max-w-[95vw] max-h-[95vh] rounded-lg 
          flex flex-col overflow-hidden relative z-10
          shadow-2xl shadow-purple-500/10
          transition-all duration-500 ease-out transform
          ${isVisible ? "opacity-100 scale-100 translate-y-0 rotate-0" : "opacity-0 scale-90 translate-y-8 rotate-1"}
        `,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
                  /* @__PURE__ */ jsxs(
                    "h2",
                    {
                      id: "modal-title",
                      className: "text-xl font-semibold text-white flex items-center space-x-2",
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "text-purple-400", children: serviceName }),
                        /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Logs" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                      /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${getStatusStyles()} animate-pulse` }),
                      /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400", children: [
                        "Showing ",
                        logs.length,
                        " of ",
                        totalLogs,
                        " lines",
                        totalLogs > maxLogs && /* @__PURE__ */ jsxs("span", { className: "text-yellow-400 ml-2", children: [
                          "(Limited to last ",
                          maxLogs,
                          ")"
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        value: maxLogs,
                        onChange: (e) => setMaxLogs(Number(e.target.value)),
                        className: "bg-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
                        children: LOG_LIMIT_OPTIONS.map((limit) => /* @__PURE__ */ jsxs("option", { value: limit, children: [
                          "Show ",
                          limit,
                          " logs"
                        ] }, limit))
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    className: "text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500",
                    "aria-label": "Close logs",
                    children: /* @__PURE__ */ jsx(
                      "svg",
                      {
                        className: "w-6 h-6",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /* @__PURE__ */ jsx(
                          "path",
                          {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M6 18L18 6M6 6l12 12"
                          }
                        )
                      }
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  ref: logsContainerRef,
                  onScroll: handleScroll,
                  className: "flex-1 overflow-y-auto p-6 font-mono text-sm overscroll-contain",
                  onWheel: (e) => e.stopPropagation(),
                  children: logs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-gray-500 flex items-center justify-center h-full text-lg", children: /* @__PURE__ */ jsx("span", { children: "Waiting for logs..." }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: logs.map((log, index) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `flex whitespace-pre-wrap break-all rounded transition-colors ${getLogStyles(log.level)}`,
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "w-12 flex-none px-2 py-1 text-gray-500 select-none border-r border-gray-800", children: totalLogs - logs.length + index + 1 }),
                        /* @__PURE__ */ jsx("div", { className: "flex-1 px-2 py-1", children: log.message })
                      ]
                    },
                    index
                  )) })
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "bg-gray-800 px-6 py-4 border-t border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-red-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Error" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-yellow-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Warning" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-green-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Info" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-blue-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Debug" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "h-3 w-3 rounded-full bg-purple-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: "Verbose" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-4", children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setAutoScroll(!autoScroll),
                      className: `
                  px-4 py-2 rounded-lg border transition-colors
                  ${autoScroll ? "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20" : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"}
                `,
                      children: [
                        "Auto-scroll ",
                        autoScroll ? "ON" : "OFF"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleScrollToBottom,
                      className: "px-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors",
                      children: "Scroll to Bottom ⬇️"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: clearLogs,
                      className: "px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors",
                      children: "Clear Logs 🗑️"
                    }
                  )
                ] })
              ] }) })
            ]
          }
        )
      ]
    }
  );
}
function ServiceCard({ service }) {
  const isRunning = service.status === "running";
  const submit = useSubmit();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  useEffect(() => {
    if (navigation.formData) {
      const formData = navigation.formData;
      const actionType = formData.get("action");
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
      }, 1e3);
      return () => clearTimeout(timer);
    }
  }, [navigation.formData, service.id, isProcessing, revalidator]);
  useEffect(() => {
    let timer;
    if (isProcessing) {
      timer = setInterval(() => {
        revalidator.revalidate();
      }, 2e3);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isProcessing, revalidator]);
  const handleAction = (action2) => {
    if (action2 === "refresh") {
      revalidator.revalidate();
      return;
    }
    if (action2 === "logs") {
      setShowLogs(!showLogs);
      return;
    }
    const formData = new FormData();
    formData.append("action", action2);
    formData.append("serviceId", service.id);
    submit(formData, { method: "post" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 \n      border border-gray-100 dark:border-gray-700\n      transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5\n      overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2", children: [
            service.name,
            /* @__PURE__ */ jsx(ServiceStatusBadge, { status: service.status })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
            "Port: ",
            /* @__PURE__ */ jsx("span", { className: "font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded", children: service.port })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `http://localhost:${service.port}/api`,
            target: "_blank",
            rel: "noreferrer",
            className: "text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 \n              text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600\n              transition-colors duration-200 flex items-center gap-1 group",
            children: [
              /* @__PURE__ */ jsx("span", { children: "API" }),
              /* @__PURE__ */ jsx(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  className: "w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5",
                  children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z", clipRule: "evenodd" })
                }
              )
            ]
          }
        )
      ] }),
      service.description && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2", children: service.description }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "Last Started" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: service.lastStarted ? new Date(service.lastStarted).toLocaleString() : "Never" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-500 dark:text-gray-400", children: "Last Stopped" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: service.lastStopped ? new Date(service.lastStopped).toLocaleString() : "Never" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700\n        flex items-center justify-end gap-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full max-w-lg ml-auto", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleAction(isRunning ? "stop" : "start"),
          disabled: isProcessing,
          className: `
              w-28
              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
              text-xs font-medium rounded-lg border whitespace-nowrap
              transition-all duration-200
              ${isProcessing ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700" : isRunning ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20" : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-500/10 dark:border-green-500/20 dark:hover:bg-green-500/20"}
            `,
          children: isProcessing ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ jsxs("svg", { className: "animate-spin w-3.5 h-3.5 shrink-0", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
              /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: processingAction === "start" ? "Starting" : "Stopping" })
          ] }) : /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center gap-1.5", children: isRunning ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 shrink-0", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" }) }),
            /* @__PURE__ */ jsx("span", { children: "Stop" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 shrink-0", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" }) }),
            /* @__PURE__ */ jsx("span", { children: "Start" })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("logs"),
          className: `
              w-28
              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
              text-xs font-medium rounded-lg border whitespace-nowrap
              transition-all duration-200
              ${showLogs ? "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 dark:hover:bg-purple-500/20" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"}
            `,
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 shrink-0", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M10 3c-4.31 0-8 3.033-8 7 0 2.024.978 3.825 2.499 5.085a3.478 3.478 0 01-.522 1.756.75.75 0 00.584 1.143 5.976 5.976 0 003.936-1.108c.487.082.99.124 1.503.124 4.31 0 8-3.033 8-7s-3.69-7-8-7z" }) }),
            /* @__PURE__ */ jsx("span", { children: "Logs" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleAction("refresh"),
          disabled: isProcessing,
          className: "\n              w-28\n              inline-flex items-center justify-center gap-1.5 px-3 py-1.5 \n              text-xs font-medium rounded-lg border whitespace-nowrap\n              bg-gray-50 text-gray-600 border-gray-200 \n              hover:bg-gray-100 \n              dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 \n              dark:hover:bg-gray-600\n              transition-all duration-200\n              disabled:opacity-50 disabled:cursor-not-allowed\n            ",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 shrink-0", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z", clipRule: "evenodd" }) }),
            /* @__PURE__ */ jsx("span", { children: "Refresh" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(
      ServiceLogs,
      {
        serviceId: service.id,
        serviceName: service.name,
        isVisible: showLogs,
        onClose: () => setShowLogs(false),
        status: service.status
      }
    )
  ] });
}
function ServiceList({ services: services2 }) {
  if (services2.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No services available" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Add services to start managing them." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: services2.map((service) => /* @__PURE__ */ jsx(ServiceCard, { service }, service.id)) });
}
const loader = async () => {
  const services2 = await getAllServices();
  return {
    services: services2
  };
};
const action = async ({
  request
}) => {
  const formData = await request.formData();
  const action2 = formData.get("action");
  if (action2 === "start") {
    const serviceId = formData.get("serviceId");
    await startServiceById(serviceId);
  } else if (action2 === "stop") {
    const serviceId = formData.get("serviceId");
    await stopServiceById(serviceId);
  } else if (action2 === "refresh") {
    const serviceId = formData.get("serviceId");
    const service = await getServiceById(serviceId);
    console.log("Service refreshed:", service);
  }
  return redirect("/");
};
const _index = withComponentProps(function Index() {
  const {
    services: services2
  } = useLoaderData();
  return /* @__PURE__ */ jsxs("div", {
    className: "bg-gray-100 dark:bg-gray-900 min-h-screen",
    children: [/* @__PURE__ */ jsx(ServiceList, {
      services: services2
    }), /* @__PURE__ */ jsx("div", {
      className: "mt-6",
      children: /* @__PURE__ */ jsx("a", {
        href: "/services",
        className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600",
        children: "Add New Service"
      })
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: _index,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BF2eY_r7.js", "imports": ["/assets/chunk-HA7DTUK3-BY0tfoDu.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DbmvWd_j.js", "imports": ["/assets/chunk-HA7DTUK3-BY0tfoDu.js", "/assets/with-props-GPLnpKcb.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/services": { "id": "routes/services", "parentId": "root", "path": "services", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/services-BjLtsdPs.js", "imports": ["/assets/with-props-GPLnpKcb.js", "/assets/chunk-HA7DTUK3-BY0tfoDu.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/services.$serviceId.logs": { "id": "routes/services.$serviceId.logs", "parentId": "routes/services", "path": ":serviceId/logs", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/services._serviceId.logs-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-BLzzEGC4.js", "imports": ["/assets/with-props-GPLnpKcb.js", "/assets/chunk-HA7DTUK3-BY0tfoDu.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-b0ac6266.js", "version": "b0ac6266" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/services": {
    id: "routes/services",
    parentId: "root",
    path: "services",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/services.$serviceId.logs": {
    id: "routes/services.$serviceId.logs",
    parentId: "routes/services",
    path: ":serviceId/logs",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
