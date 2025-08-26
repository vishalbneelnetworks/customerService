import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createForm,
  getForms,
  deleteForm,
  changeFormStatus,
  getFormById,
  updateForm,
} from "./form.service.js";

export const createFormController = asyncHandler(async (req, res) => {
  const form = await createForm(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, form, "Form created successfully"));
});

export const getFormsController = asyncHandler(async (req, res) => {
  const response = await getForms(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Forms retrieved successfully"));
});

export const getFormByIdController = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const form = await getFormById(formId);

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Form retrieved successfully"));
});

export const updateFormController = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const updatedForm = await updateForm(formId, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedForm, "Form updated successfully"));
});

export const deleteFormController = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  await deleteForm(formId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Form deleted successfully"));
});

export const changeFormStatusController = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const { status } = req.body;

  const updatedForm = await changeFormStatus(formId, status);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedForm, `Form status changed to ${status}`)
    );
});

export const submitFormController = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const submittedForm = await changeFormStatus(formId, "submitted");

  return res
    .status(200)
    .json(new ApiResponse(200, submittedForm, "Form submitted successfully"));
});
