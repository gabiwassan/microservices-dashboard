import {
  redirect,
  ActionFunction,
  LoaderFunction,
  useActionData,
  Form,
} from "react-router";
import {
  getAllServices,
  addService,
  removeService,
  startServiceById,
  stopServiceById,
} from "~/utils/service-manager.server";
import { ActionData } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  const services = await getAllServices();
  return new Response(JSON.stringify({ services }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === "add") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const port = parseInt(formData.get("port") as string, 10);
    const path = formData.get("path") as string;

    if (!name || !port || !path) {
      return { error: "All fields are required" };
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
  } else if (action === "start") {
    const serviceId = formData.get("serviceId") as string;
    await startServiceById(serviceId);
  } else if (action === "stop") {
    const serviceId = formData.get("serviceId") as string;
    await stopServiceById(serviceId);
  }

  return redirect("/services");
};

export default function Services() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-700 shadow rounded-lg">
          <div className="p-6">
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
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="port"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Port
                </label>
                <input
                  type="number"
                  name="port"
                  id="port"
                  className="mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="path"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Path
                </label>
                <input
                  type="text"
                  name="path"
                  id="path"
                  className="mt-1 block w-full h-6 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="absolute/path/to/service"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Service
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
