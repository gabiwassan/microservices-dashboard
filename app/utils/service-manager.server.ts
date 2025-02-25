import { 
    loadServices, 
    saveServices, 
    checkServiceStatus, 
    startService, 
    stopService 
  } from '~/models/service.server';
  import { MicroService } from '~/utils/types';
  
  export async function getAllServices() {
    const services = await loadServices();
    
    // Verificar el estado actual de cada servicio
    const servicesWithStatus = await Promise.all(
      services.map(async (service) => {
        const status = await checkServiceStatus(service);
        return { ...service, status };
      })
    );
    
    return servicesWithStatus;
  }
  
  export async function getServiceById(id: string) {
    const services = await loadServices();
    const service = services.find(s => s.id === id);
    
    if (service) {
      service.status = await checkServiceStatus(service);
    }
    
    return service;
  }
  
  export async function startServiceById(id: string) {
    const services = await loadServices();
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return false;
    }
    
    const success = await startService(services[serviceIndex]);
    
    if (success) {
      services[serviceIndex].lastStarted = new Date();
      services[serviceIndex].status = 'running';
      await saveServices(services);
    }
    
    return success;
  }
  
  export async function stopServiceById(id: string) {
    const services = await loadServices();
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return false;
    }
    
    const success = await stopService(services[serviceIndex]);
    
    if (success) {
      services[serviceIndex].lastStopped = new Date();
      services[serviceIndex].status = 'stopped';
      await saveServices(services);
    }
    
    return success;
  }
  
  export async function addService(service: Omit<MicroService, 'id' | 'status'>) {
    const services = await loadServices();
    
    const newService: MicroService = {
      ...service,
      id: crypto.randomUUID(),
      status: 'stopped'
    };
    
    services.push(newService);
    await saveServices(services);
    
    return newService;
  }
  
  export async function removeService(id: string) {
    const services = await loadServices();
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return false;
    }
    
    // Detener el servicio antes de eliminarlo
    await stopService(services[serviceIndex]);
    
    // Eliminar el servicio de la lista
    services.splice(serviceIndex, 1);
    await saveServices(services);
    
    return true;
  }