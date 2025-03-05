import type { ActionFunction, LoaderFunction } from "react-router";
import { redirect, useLoaderData, useSubmit } from "react-router";
import ServiceList from "~/components/service-list";
import { ServiceGroups } from "~/components/service-groups";
import {
  getAllServices,
  startServiceById,
  stopServiceById,
} from "~/utils/service-manager.server";
import { ActionData, MicroService, ServiceGroup } from "~/utils/types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const SERVICES_CONFIG_PATH = path.join(process.cwd(), "services.json");

export const loader: LoaderFunction = async () => {
  const { services, groups } = await getAllServices();
  return { services, groups };
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
  } else if (action === "startGroup") {
    const groupId = formData.get("groupId") as string;
    const { groups } = await getAllServices();
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      for (const serviceId of group.services) {
        await startServiceById(serviceId);
      }
    }
  } else if (action === "stopGroup") {
    const groupId = formData.get("groupId") as string;
    const { groups } = await getAllServices();
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      for (const serviceId of group.services) {
        await stopServiceById(serviceId);
      }
    }
  } else if (action === "createGroup") {
    const name = formData.get("name") as string;
    const data = await fs.promises.readFile(SERVICES_CONFIG_PATH, "utf8");
    const config = JSON.parse(data);

    const newGroup: ServiceGroup = {
      id: uuidv4(),
      name,
      services: [],
    };

    config.groups = [...(config.groups || []), newGroup];
    await fs.promises.writeFile(
      SERVICES_CONFIG_PATH,
      JSON.stringify(config, null, 2)
    );
  } else if (action === "editGroup") {
    const groupId = formData.get("groupId") as string;
    const newName = formData.get("newName") as string;
    const data = await fs.promises.readFile(SERVICES_CONFIG_PATH, "utf8");
    const config = JSON.parse(data);

    const groupIndex = config.groups.findIndex(
      (g: ServiceGroup) => g.id === groupId
    );
    if (groupIndex !== -1) {
      config.groups[groupIndex].name = newName;
      await fs.promises.writeFile(
        SERVICES_CONFIG_PATH,
        JSON.stringify(config, null, 2)
      );
    }
  } else if (action === "assignService") {
    const groupId = formData.get("groupId") as string;
    const serviceId = formData.get("serviceId") as string;
    const data = await fs.promises.readFile(SERVICES_CONFIG_PATH, "utf8");
    const config = JSON.parse(data);

    const groupIndex = config.groups.findIndex(
      (g: ServiceGroup) => g.id === groupId
    );
    if (groupIndex !== -1) {
      config.groups[groupIndex].services.push(serviceId);
      await fs.promises.writeFile(
        SERVICES_CONFIG_PATH,
        JSON.stringify(config, null, 2)
      );
    }
  } else if (action === "removeService") {
    const groupId = formData.get("groupId") as string;
    const serviceId = formData.get("serviceId") as string;
    const data = await fs.promises.readFile(SERVICES_CONFIG_PATH, "utf8");
    const config = JSON.parse(data);

    const groupIndex = config.groups.findIndex(
      (g: ServiceGroup) => g.id === groupId
    );
    if (groupIndex !== -1) {
      config.groups[groupIndex].services = config.groups[
        groupIndex
      ].services.filter((id: string) => id !== serviceId);
      await fs.promises.writeFile(
        SERVICES_CONFIG_PATH,
        JSON.stringify(config, null, 2)
      );
    }
  }

  return redirect("/");
};

export default function Index() {
  const { services, groups } = useLoaderData<{
    services: MicroService[];
    groups: ServiceGroup[];
  }>();
  const submit = useSubmit();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Microservices Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <ServiceGroups
              services={services}
              groups={groups}
              onCreateGroup={(name) => {
                const formData = new FormData();
                formData.append("action", "createGroup");
                formData.append("name", name);
                submit(formData, { method: "post" });
              }}
              onStartGroup={(groupId) => {
                const formData = new FormData();
                formData.append("action", "startGroup");
                formData.append("groupId", groupId);
                submit(formData, { method: "post" });
              }}
              onStopGroup={(groupId) => {
                const formData = new FormData();
                formData.append("action", "stopGroup");
                formData.append("groupId", groupId);
                submit(formData, { method: "post" });
              }}
              onAssignService={(groupId, serviceId) => {
                const formData = new FormData();
                formData.append("action", "assignService");
                formData.append("groupId", groupId);
                formData.append("serviceId", serviceId);
                submit(formData, { method: "post" });
              }}
              onRemoveService={(groupId, serviceId) => {
                const formData = new FormData();
                formData.append("action", "removeService");
                formData.append("groupId", groupId);
                formData.append("serviceId", serviceId);
                submit(formData, { method: "post" });
              }}
              onEditGroup={(groupId, newName) => {
                const formData = new FormData();
                formData.append("action", "editGroup");
                formData.append("groupId", groupId);
                formData.append("newName", newName);
                submit(formData, { method: "post" });
              }}
            />
            <a
              href="/services"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Add New Service
            </a>
          </div>
        </div>
        <ServiceList services={services} />
      </div>
    </div>
  );
}
