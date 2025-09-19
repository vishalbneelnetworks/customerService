import serviceService from "../services/service.service.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res
    .status(201)
    .json(ApiResponse.created(service, "Service created successfully"));
});

export const getAllServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getAllServices();
  res
    .status(200)
    .json(ApiResponse.success(services, "Services fetched successfully"));
});

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);
  res
    .status(200)
    .json(ApiResponse.success(service, "Service fetched successfully"));
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(req.params.id, req.body);
  res
    .status(200)
    .json(ApiResponse.success(service, "Service updated successfully"));
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await serviceService.deleteService(req.params.id);

  res
    .status(200)
    .json(ApiResponse.success(service, "Service deleted successfully"));
});

export const updateAddons = asyncHandler(async (req, res) => {
  const service = await serviceService.updateAddons(req.params.id, req.body);
  res
    .status(200)
    .json(ApiResponse.success(service, "Addons updated successfully"));
});

export default {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateAddons,
};
