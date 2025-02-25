import { redirect, ActionFunction, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import {
  getAllServices,
  startServiceById,
  stopServiceById,
  addService,
  removeService,
} from "~/utils/service-manager.server";
import ServiceList from "~/components/ServiceList";
import { MicroService } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  const services = await getAllServices();
  return { services };
};

interface ActionData {
  error?: string;
}

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
  } else if (action === "add") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const port = parseInt(formData.get("port") as string, 10);
    const path = formData.get("path") as string;

    if (!name || !port || !path) {
      return { error: "Todos los campos son requeridos" };
    }

    await addService({
      name,
      description,
      port,
      path,
    });
  } else if (action === "remove") {
    const serviceId = formData.get("serviceId") as string;
    await removeService(serviceId);
  }

  return redirect("/services");
};

export default function Services() {
  const { services } = useLoaderData<{ services: MicroService[] }>();
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Administrar Servicios
        </h2>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Agregar Nuevo Servicio
          </h3>

          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <input type="hidden" name="action" value="add" />

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                htmlFor="port"
                className="block text-sm font-medium text-gray-700"
              >
                Puerto
              </label>
              <input
                type="number"
                name="port"
                id="port"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="path"
                className="block text-sm font-medium text-gray-700"
              >
                Ruta del Servicio
              </label>
              <input
                type="text"
                name="path"
                id="path"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="/ruta/absoluta/al/microservicio"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Agregar Servicio
              </button>
            </div>
          </Form>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Servicios Configurados
      </h3>
      <ServiceList services={services} />

      <div className="mt-6">
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
}
