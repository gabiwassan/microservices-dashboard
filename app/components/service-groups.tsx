import React, { useState, useEffect } from "react";
import { Popover, Button, Input, Tag, Space, message, Select } from "antd";
import { PlusOutlined, TeamOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigation, useRevalidator } from "react-router";

interface ServiceGroup {
  id: string;
  name: string;
  services: string[];
}

interface Service {
  id: string;
  name: string;
  status: string;
}

interface ServiceGroupsProps {
  services: Service[];
  groups: ServiceGroup[];
  onCreateGroup: (name: string) => void;
  onStartGroup: (groupId: string) => void;
  onStopGroup: (groupId: string) => void;
  onAssignService: (groupId: string, serviceId: string) => void;
  onRemoveService: (groupId: string, serviceId: string) => void;
  onEditGroup: (groupId: string, newName: string) => void;
}

export const ServiceGroups: React.FC<ServiceGroupsProps> = ({
  services,
  groups,
  onCreateGroup,
  onStartGroup,
  onStopGroup,
  onAssignService,
  onRemoveService,
  onEditGroup,
}) => {
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [processingGroups, setProcessingGroups] = useState<{
    [key: string]: { isProcessing: boolean; action: "start" | "stop" | null };
  }>({});

  const navigation = useNavigation();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (navigation.formData) {
      const formData = navigation.formData;
      const actionType = formData.get("action") as string;
      const groupId = formData.get("groupId") as string;

      if (
        groupId &&
        (actionType === "startGroup" || actionType === "stopGroup")
      ) {
        setProcessingGroups((prev) => ({
          ...prev,
          [groupId]: {
            isProcessing: true,
            action: actionType === "startGroup" ? "start" : "stop",
          },
        }));
      }
    } else {
      // Check if any group is processing
      const hasProcessingGroups = Object.values(processingGroups).some(
        (g) => g.isProcessing
      );
      if (hasProcessingGroups) {
        const timer = setTimeout(() => {
          revalidator.revalidate();
          setProcessingGroups({});
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [navigation.formData, revalidator, groups, processingGroups]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const hasProcessingGroups = Object.values(processingGroups).some(
      (g) => g.isProcessing
    );

    if (hasProcessingGroups) {
      timer = setInterval(() => {
        revalidator.revalidate();
      }, 2000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [processingGroups, revalidator]);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim());
      setNewGroupName("");
    } else {
      message.warning("Please enter a group name");
    }
  };

  const handleAssignService = () => {
    if (selectedGroup && selectedService) {
      onAssignService(selectedGroup, selectedService);
      setSelectedService(null);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditingGroup(groupId);
      setEditingName(group.name);
    }
  };

  const handleSaveEdit = () => {
    if (editingGroup && editingName.trim()) {
      onEditGroup(editingGroup, editingName.trim());
      setEditingGroup(null);
      setEditingName("");
    }
  };

  const handleStartGroup = (groupId: string) => {
    if (!processingGroups[groupId]?.isProcessing) {
      onStartGroup(groupId);
    }
  };

  const handleStopGroup = (groupId: string) => {
    if (!processingGroups[groupId]?.isProcessing) {
      onStopGroup(groupId);
    }
  };

  const content = (
    <div className="w-[800px] bg-white dark:bg-gray-800 text-base">
      <div className="mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="New group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onPressEnter={handleCreateGroup}
            className="text-base dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
            size="large"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="text-base"
            onClick={handleCreateGroup}
            size="large"
          >
            Create Group
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-3">
          <Select
            className="flex-1 text-base"
            placeholder="Select group"
            value={selectedGroup}
            onChange={setSelectedGroup}
            size="large"
            popupClassName="dark:bg-gray-700 dark:text-white"
          >
            {groups.map((group) => (
              <Select.Option
                key={group.id}
                value={group.id}
                className="text-base"
              >
                {group.name}
              </Select.Option>
            ))}
          </Select>

          {selectedGroup && (
            <Select
              className="flex-1 text-base"
              placeholder="Select service"
              value={selectedService}
              onChange={setSelectedService}
              size="large"
              popupClassName="dark:bg-gray-700 dark:text-white"
            >
              {services
                .filter(
                  (service) =>
                    !groups
                      .find((g) => g.id === selectedGroup)
                      ?.services.includes(service.id)
                )
                .map((service) => (
                  <Select.Option
                    key={service.id}
                    value={service.id}
                    className="text-base"
                  >
                    {service.name}
                  </Select.Option>
                ))}
            </Select>
          )}

          {selectedGroup && selectedService && (
            <Button
              type="default"
              className="text-base dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={handleAssignService}
              size="large"
            >
              Assign
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="p-6 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              {editingGroup === group.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onPressEnter={handleSaveEdit}
                    className="text-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                    size="large"
                  />
                  <Button
                    size="large"
                    onClick={handleSaveEdit}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </span>
                  <Button
                    type="text"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => handleEditGroup(group.id)}
                    className="dark:text-gray-400 dark:hover:text-white"
                  />
                </div>
              )}
              <Space size="middle">
                <button
                  className={`
                    w-28
                    inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
                    text-xs font-medium rounded-lg border whitespace-nowrap
                    transition-all duration-200
                    ${
                      processingGroups[group.id]?.isProcessing
                        ? "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        : group.services.some(
                            (sid) =>
                              services.find((s) => s.id === sid)?.status ===
                              "running"
                          )
                        ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/30 dark:hover:border-red-500/30"
                        : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/30 dark:hover:border-green-500/30"
                    }
                  `}
                  onClick={() => handleStartGroup(group.id)}
                  disabled={processingGroups[group.id]?.isProcessing}
                >
                  {processingGroups[group.id]?.isProcessing ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg
                        className="animate-spin w-3.5 h-3.5 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>
                        {processingGroups[group.id]?.action === "start"
                          ? "Starting"
                          : "Stopping"}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      <span>Start</span>
                    </span>
                  )}
                </button>
                <button
                  className={`
                    w-28
                    inline-flex items-center justify-center gap-1.5 px-3 py-1.5 
                    text-xs font-medium rounded-lg border whitespace-nowrap
                    transition-all duration-200
                    ${
                      processingGroups[group.id]?.isProcessing
                        ? "bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                        : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/30 dark:hover:border-red-500/30"
                    }
                  `}
                  onClick={() => handleStopGroup(group.id)}
                  disabled={processingGroups[group.id]?.isProcessing}
                >
                  {processingGroups[group.id]?.isProcessing ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg
                        className="animate-spin w-3.5 h-3.5 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>
                        {processingGroups[group.id]?.action === "start"
                          ? "Starting"
                          : "Stopping"}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                      </svg>
                      <span>Stop</span>
                    </span>
                  )}
                </button>
              </Space>
            </div>
            <div className="flex flex-wrap gap-3">
              {group.services.map((serviceId) => {
                const service = services.find((s) => s.id === serviceId);
                return service ? (
                  <Tag
                    key={serviceId}
                    color={service.status === "running" ? "green" : "default"}
                    closable
                    onClose={() => onRemoveService(group.id, serviceId)}
                    className="text-base px-3 py-1"
                  >
                    {service.name}
                  </Tag>
                ) : null;
              })}
              {group.services.length === 0 && (
                <span className="text-base text-gray-500 dark:text-gray-400">
                  No services assigned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <div className="text-lg font-medium text-gray-900 dark:text-white">
          Service Groups
        </div>
      }
      trigger="click"
      placement="bottomLeft"
      overlayClassName="dark:bg-gray-800 dark:border-gray-700"
      styles={{ body: { background: "inherit" } }}
    >
      <Button icon={<TeamOutlined />} size="large">
        Groups
      </Button>
    </Popover>
  );
};
