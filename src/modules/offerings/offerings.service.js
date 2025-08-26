import { Service, SubService } from "./offerings.model.js";
import {
  validateCreateService,
  validateCreateSubService,
  validateUpdateService,
  validateUpdateSubService,
} from "./offerings.validation.js";

// Service
export const createService = async (service) => {
  const validatedService = validateCreateService(service);
  const newService = await Service.create(validatedService);
  return newService;
};

export const getService = async (serviceId) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

export const getServices = async () => {
  const services = await Service.find();
  return services;
};

export const updateService = async (serviceId, service) => {
  const validatedService = validateUpdateService(service);
  const updatedService = await Service.findByIdAndUpdate(
    serviceId,
    validatedService,
    { new: true }
  );
  return updatedService;
};

export const deleteService = async (serviceId) => {
  const deletedService = await Service.findByIdAndDelete(serviceId);
  return deletedService;
};

// SubService
export const createSubService = async (subService) => {
  const validatedSubService = validateCreateSubService(subService);
  const newSubService = await SubService.create(validatedSubService);
  return newSubService;
};

export const getSubService = async (subServiceId) => {
  const subService = await SubService.findById(subServiceId);
  if (!subService) {
    throw new Error("SubService not found");
  }
  return subService;
};

export const getSubServices = async () => {
  const subServices = await SubService.find();
  return subServices;
};

export const getSubServicesByServiceId = async (serviceId) => {
  const subServices = await SubService.find({ serviceId });
  return subServices;
};

export const updateSubService = async (subServiceId, subService) => {
  const validatedSubService = validateUpdateSubService(subService);
  const updatedSubService = await SubService.findByIdAndUpdate(
    subServiceId,
    validatedSubService,
    { new: true }
  );
  return updatedSubService;
};

export const deleteSubService = async (subServiceId) => {
  const deletedSubService = await SubService.findByIdAndDelete(subServiceId);
  return deletedSubService;
};
