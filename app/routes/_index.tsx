import type { ActionFunction, LoaderFunction } from "react-router";
import { redirect, useLoaderData } from "react-router";
import ServiceList from "~/components/service-list";
import {
  getAllServices,
  startServiceById,
  stopServiceById,
  getServiceById,
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
  } else if (action === "refresh") {
    const serviceId = formData.get("serviceId") as string;
    const service = await getServiceById(serviceId);
    console.log("Service refreshed:", service);
  }

  return redirect("/");
};

export default function Index() {
  const { services } = useLoaderData<{ services: MicroService[] }>();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Available Services
      </h1>
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
