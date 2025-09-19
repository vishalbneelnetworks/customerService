import formService from "../services/form.service.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { submitFormValidation } from "../validations/form.validation.js";

export const submitForm = asyncHandler(async (req, res) => {
  const validatedData = submitFormValidation(req.body);
  const { user } = req;

  if (user.role === "admin") {
    validatedData.createdBy = user.id;
    validatedData.source = "admin";
  } else {
    // pass explicitly
    validatedData.source = "customer";
  }

  const form = await formService.submitForm(validatedData);
  res
    .status(201)
    .json(ApiResponse.created(form, "Form submitted successfully"));
});

export const getFormById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const form = await formService.getFormById(id);
  res.status(200).json(ApiResponse.success(form, "Form fetched successfully"));
});

export const getFormsByCustomerId = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  if (!customerId) {
    throw new ApiError(400, "Customer id is required");
  }
  const forms = await formService.getFormsByCustomerId(customerId);
  res
    .status(200)
    .json(ApiResponse.success(forms, "Forms fetched successfully"));
});

export const getAllForms = asyncHandler(async (req, res) => {
  const forms = await formService.getAllForms();
  res
    .status(200)
    .json(ApiResponse.success(forms, "Forms fetched successfully"));
});

export const deleteFormById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Id is required");
  }
  const form = await formService.deleteFormById(id);
  res.status(200).json(ApiResponse.success(form, "Form deleted successfully"));
});

export default {
  submitForm,
  getFormById,
  getFormsByCustomerId,
  getAllForms,
  deleteFormById,
};
