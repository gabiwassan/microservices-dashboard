import { ServiceStatus } from '~/utils/types';

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
}

export default function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Ejecutando';
      case 'stopped':
        return 'Detenido';
      case 'error':
        return 'Error';
      default:
        return 'Desconocido';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${status === 'running' ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
      {getStatusText()}
    </span>
  );
}