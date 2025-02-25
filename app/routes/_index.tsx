import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ServiceList from "~/components/ServiceList";
import { MicroService } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  return redirect("/services");
};

export default function Index() {
  const { services } = useLoaderData<{ services: MicroService[] }>();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Estado de los Servicios</h2>
        <a
          href="/services"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Administrar Servicios
        </a>
      </div>
      
      <ServiceList services={services} />
    </div>
  );
}