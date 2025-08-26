import { RequirementForm } from "./form.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import {
  validateCreateForm,
  validateFormQuery,
  validateStatusTransition,
  checkFormModifiable,
  validateMongoId,
  validateUpdateForm,
} from "./form.validation.js";
import { eventBus } from "../../shared/events/index.js";
import Event from "../../shared/events/Event.js";

export const createForm = async (formData) => {
  const startTime = new Date();
  // const validatedData = validateCreateForm(formData);
  // const newForm = await RequirementForm.create(validatedData);

  const newForm = {
    formId: "123",
    customerId: "123",
    customerLocation: "India",
    selectedServices: formData.selectedServices,
  };
  eventBus.emit(
    new Event({
      type: "form.created",
      data: { newForm, startTime },
      source: "form.service",
    })
  );

  return newForm;
};

export const getFormById = async (formId) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }
  return form;
};

export const getForms = async (queryParams = {}) => {
  const validatedQuery = validateFormQuery(queryParams);
  const {
    page,
    limit,
    selectedServices,
    status,
    sortBy,
    sortOrder,
    industryType,
    preferredCountry,
  } = validatedQuery;

  const matchStage = {};
  if (selectedServices) matchStage.selectedServices = selectedServices;
  if (status) matchStage.status = status;
  if (industryType) matchStage.industryType = industryType;
  if (preferredCountry) matchStage.preferredCountry = preferredCountry;
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        forms: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await RequirementForm.aggregate(pipeline);
  const forms = result.forms;
  const total = result.totalCount[0]?.total || 0;

  return {
    forms,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalForms: total,
      hasNext: skip + forms.length < total,
      hasPrev: page > 1,
    },
  };
};

export const updateForm = async (formId, updateData) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  checkFormModifiable(form, "update");

  const validatedData = validateUpdateForm(updateData);

  const updatedForm = await RequirementForm.findByIdAndUpdate(
    validatedId,
    validatedData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};

export const deleteForm = async (formId) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  checkFormModifiable(form, "delete");

  await RequirementForm.findByIdAndDelete(validatedId);
  return form;
};

export const changeFormStatus = async (formId, newStatus) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (form.status === newStatus) {
    throw new ApiError(400, "Form is already in this status");
  }

  validateStatusTransition(form.status, newStatus);

  const updateData = { status: newStatus };

  if (newStatus === "submitted") {
    updateData.submittedAt = new Date();
  } else if (newStatus === "approved" || newStatus === "rejected") {
    updateData.reviewedAt = new Date();
  } else if (newStatus === "published") {
    updateData.publishedAt = new Date();
  }

  const updatedForm = await RequirementForm.findByIdAndUpdate(
    validatedId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};
