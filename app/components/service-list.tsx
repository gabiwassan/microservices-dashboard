import { MicroService } from '~/utils/types';
import ServiceCard from './service-card';

interface ServiceListProps {
  services: MicroService[];
}

export default function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No services available
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Add services to start managing them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
