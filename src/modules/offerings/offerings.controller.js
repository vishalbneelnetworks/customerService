import {
  createService,
  getService,
  getServices,
  updateService,
  deleteService,
} from "./offerings.service.js";

import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";

import {
  createSubService,
  getSubService,
  getSubServices,
  updateSubService,
  deleteSubService,
  getSubServicesByServiceId,
} from "./offerings.service.js";

// Service
export const createServiceController = asyncHandler(async (req, res) => {
  const service = req.body;
  const newService = await createService(service);
  res
    .status(201)
    .json(new ApiResponse(201, newService, "Service created successfully"));
});

export const getServiceController = asyncHandler(async (req, res) => {
  const serviceId = req.params.serviceId;
  const service = await getService(serviceId);
  res
    .status(200)
    .json(new ApiResponse(200, service, "Service fetched successfully"));
});

export const getServicesController = asyncHandler(async (req, res) => {
  const services = await getServices();
  res
    .status(200)
    .json(new ApiResponse(200, services, "Services fetched successfully"));
});

export const updateServiceController = asyncHandler(async (req, res) => {
  const service = req.body;
  const serviceId = req.params.serviceId;
  const updatedService = await updateService(serviceId, service);
  res
    .status(200)
    .json(new ApiResponse(200, updatedService, "Service updated successfully"));
});

export const deleteServiceController = asyncHandler(async (req, res) => {
  const serviceId = req.params.serviceId;
  const deletedService = await deleteService(serviceId);
  res
    .status(200)
    .json(new ApiResponse(200, deletedService, "Service deleted successfully"));
});

// SubService
export const createSubServiceController = asyncHandler(async (req, res) => {
  const subService = req.body;
  const serviceId = req.params.serviceId;
  subService.serviceId = serviceId;
  const newSubService = await createSubService(subService);
  res
    .status(201)
    .json(
      new ApiResponse(201, newSubService, "SubService created successfully")
    );
});

export const getSubServiceController = asyncHandler(async (req, res) => {
  const subServiceId = req.params.subServiceId;
  const subService = await getSubService(subServiceId);
  res
    .status(200)
    .json(new ApiResponse(200, subService, "SubService fetched successfully"));
});

export const getSubServicesController = asyncHandler(async (req, res) => {
  const subServices = await getSubServices();
  res
    .status(200)
    .json(
      new ApiResponse(200, subServices, "SubServices fetched successfully")
    );
});

export const updateSubServiceController = asyncHandler(async (req, res) => {
  const subService = req.body;
  const subServiceId = req.params.subServiceId;
  const updatedSubService = await updateSubService(subServiceId, subService);

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedSubService, "SubService updated successfully")
    );
});

export const deleteSubServiceController = asyncHandler(async (req, res) => {
  const subServiceId = req.params.subServiceId;
  const deletedSubService = await deleteSubService(subServiceId);
  res
    .status(200)
    .json(
      new ApiResponse(200, deletedSubService, "SubService deleted successfully")
    );
});

export const getSubServicesByServiceIdController = asyncHandler(
  async (req, res) => {
    const serviceId = req.params.serviceId;
    const subServices = await getSubServicesByServiceId(serviceId);
    res
      .status(200)
      .json(
        new ApiResponse(200, subServices, "SubServices fetched successfully")
      );
  }
);
