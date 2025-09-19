import { Service } from "../models/index.js";
import { ApiError } from "../utils/index.js";

const createService = async (serviceData) => {
  const { name, description, addons = [] } = serviceData;
  try {
    if (!name) {
      throw new ApiError(400, "Name is required");
    }
    const existingService = await Service.findOne({ name });
    if (existingService) {
      throw new ApiError(400, "Service already exists");
    }
    const service = await Service.create({ name, description, addons });
    return service;
  } catch (error) {
    throw new ApiError(500, "Failed to create service", error);
  }
};

const getAllServices = async () => {
  try {
    const services = await Service.find({});
    return services;
  } catch (error) {
    throw new ApiError(500, "Failed to get all services", error);
  }
};

const getServiceById = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "Id is required");
    }
    const service = await Service.findById(id);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    return service;
  } catch (error) {
    throw new ApiError(500, "Failed to get service by id", error);
  }
};

const updateService = async (id, serviceData) => {
  try {
    if (!id) {
      throw new ApiError(400, "Id is required");
    }
    const service = await Service.findByIdAndUpdate(id, serviceData, {
      new: true,
    });
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    return service;
  } catch (error) {
    throw new ApiError(500, "Failed to update service", error);
  }
};

const deleteService = async (id) => {
  try {
    if (!id) {
      throw new ApiError(400, "Id is required");
    }
    const service = await Service.findByIdAndDelete(id);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    return { message: "Service deleted successfully" };
  } catch (error) {
    throw new ApiError(500, "Failed to delete service", error);
  }
};

const updateAddons = async (serviceId, addons = []) => {
  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }
    service.addons = addons;
    await service.save();
    return service;
  } catch (error) {
    throw new ApiError(500, "Failed to update addons", error);
  }
};

export default {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateAddons,
};
