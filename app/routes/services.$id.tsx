import { useParams } from 'react-router';
import ServiceLogs from '../components/ServiceLogs';
import type { MicroService } from '../utils/types';
import { useEffect, useState } from 'react';
import { getServiceById } from '../utils/service-manager.server';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<MicroService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!id) throw new Error('Service ID is required');
        const serviceData = await getServiceById(id);
        if (!serviceData) {
          throw new Error('Service not found');
        }
        setService(serviceData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Service not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{service.name}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Status</p>
            <p
              className={`font-semibold ${
                service.status === 'running' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Port</p>
            <p className="font-semibold">{service.port}</p>
          </div>
          <div>
            <p className="text-gray-600">Path</p>
            <p className="font-semibold">{service.path}</p>
          </div>
          {service.description && (
            <div className="col-span-2">
              <p className="text-gray-600">Description</p>
              <p className="font-semibold">{service.description}</p>
            </div>
          )}
        </div>

        <ServiceLogs service={service} />
      </div>
    </div>
  );
}
