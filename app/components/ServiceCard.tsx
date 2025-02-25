import { Form } from '@remix-run/react';
import { MicroService } from '~/utils/types';
import ServiceStatusBadge from './ServiceStatusBadge';

interface ServiceCardProps {
  service: MicroService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const isRunning = service.status === 'running';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Service Title</h3>
            <ServiceStatusBadge status={service.status} />
          </div>
          <div className="text-sm text-gray-500">
            Puerto: {service.port}
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">Description of the service.</p>
        
        <div className="mt-4">
          {service.lastStarted && (
            <p className="text-xs text-gray-500">
              Último inicio: {new Date(service.lastStarted).toLocaleString()}
            </p>
          )}
          {service.lastStopped && (
            <p className="text-xs text-gray-500">
              Última detención: {new Date(service.lastStopped).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end space-x-2">
        <Form method="post">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="action" value={isRunning ? 'stop' : 'start'} />
          <button
            type="submit"
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${
              isRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isRunning ? 'Detener' : 'Iniciar'}
          </button>
        </Form>
      </div>
    </div>
  );
}