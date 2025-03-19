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

    return redirect("/?newService=true");
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Service
          </h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Dashboard
          </a>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {actionData?.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg text-red-700 dark:text-red-200">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-6">
              <input type="hidden" name="action" value="add" />

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 py-2.5 px-3"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 py-2.5 px-3"
                  placeholder="Optional description of your service"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="port"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Port Number
                  </label>
                  <input
                    type="number"
                    name="port"
                    id="port"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 py-2.5 px-3"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="path"
                    className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Service Path
                  </label>
                  <input
                    type="text"
                    name="path"
                    id="path"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 py-2.5 px-3"
                    placeholder="/path/to/service"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 dark:focus:ring-indigo-400 transition-colors duration-200"
                >
                  Create Service
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
