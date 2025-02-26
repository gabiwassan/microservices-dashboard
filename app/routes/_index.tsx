import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import ServiceList from "~/components/ServiceList";
import {
  getAllServices,
  startServiceById,
  stopServiceById,
} from "~/utils/service-manager.server";
import { ActionData, MicroService } from "~/utils/types";


export const loader: LoaderFunction = async () => {
  const services = await getAllServices();
  return { services };
};

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "start") {
    const serviceId = formData.get("serviceId") as string;
    await startServiceById(serviceId);
  } else if (action === "stop") {
    const serviceId = formData.get("serviceId") as string;
    await stopServiceById(serviceId);
  }

  return redirect("/");
};

export default function Index() {
  const { services } = useLoaderData<{ services: MicroService[] }>();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <ServiceList services={services} />
      <div className="mt-6">
        <a
          href="/services"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Add New Service
        </a>
      </div>
    </div>
  );
}
