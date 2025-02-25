import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ServiceList from "~/components/ServiceList";
import { getAllServices } from "~/utils/service-manager.server";
import { MicroService } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  // Aquí puedes obtener los servicios desde tu API o base de datos
  const services = await getAllServices(); // Asegúrate de tener esta función
  return { services };
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