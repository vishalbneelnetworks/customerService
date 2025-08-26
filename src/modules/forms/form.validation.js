import Joi from "joi";
import { ApiError } from "../../shared/utils/ApiError.js";
import { FORM_STATUSES, INDUSTRY_TYPES } from "../../constant.js";
import mongoose from "mongoose";
import { createStructuredValidationError } from "../../shared/utils/errorHandler.js";

const serviceSchema = Joi.object({
  name: Joi.string().required(),
  serviceId: Joi.string().required(),
});

const countrySchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
});

export const createFormSchema = Joi.object({
  customerId: Joi.string().required(),

  selectedServices: Joi.array().items(serviceSchema).required(),

  industryType: Joi.string()
    .valid(...INDUSTRY_TYPES)
    .required()
    .messages({
      "any.required": "Industry type is required",
      "any.only": `Industry type must be one of: ${INDUSTRY_TYPES.join(", ")}`,
    }),

  projectGoal: Joi.string().default(""),
  reference: Joi.string().default(""),

  budget: Joi.number().default(0),

  preferredCountry: Joi.array().items(countrySchema).default([]),

  status: Joi.string()
    .valid(...FORM_STATUSES)
    .default("draft")
    .messages({
      "any.only": `Status must be one of: ${FORM_STATUSES.join(", ")}`,
    }),
});

export const updateFormSchema = Joi.object({
  selectedServices: Joi.array().items(serviceSchema).default([]),
  projectGoal: Joi.string().default(""),
  reference: Joi.string().default(""),

  budget: Joi.number().default(0),

  preferredCountry: Joi.array().items(countrySchema).default([]),

  status: Joi.string()
    .valid(...FORM_STATUSES)
    .messages({
      "any.only": `Status must be one of: ${FORM_STATUSES.join(", ")}`,
    }),
});

export const formQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  selectedServices: Joi.array().items(serviceSchema),
  industryType: Joi.string().valid(...INDUSTRY_TYPES),
  status: Joi.string().valid(...FORM_STATUSES),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "status")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

export const validateStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    draft: ["submitted"],
    submitted: ["inprogress", "rejected"],
    inprogress: ["approved", "rejected"],
    approved: ["published"],
    rejected: ["draft"],
    published: [],
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions: ${
        validTransitions[currentStatus]?.join(", ") || "none"
      }`
    );
  }
};

export const checkFormModifiable = (form, action) => {
  if (form.status !== "draft") {
    throw new ApiError(
      400,
      `Form cannot be ${action}. Current status: ${form.status}. Only draft forms can be ${action}.`
    );
  }
};

export const validateCreateForm = (data) => {
  const { error, value } = createFormSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      400,
      "Validation failed",
      createStructuredValidationError(error)
    );
  }

  return value;
};

export const validateUpdateForm = (data) => {
  const { error, value } = updateFormSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    throw new ApiError(
      400,
      "Validation failed",
      createStructuredValidationError(error)
    );
  }

  return value;
};

export const validateFormQuery = (query) => {
  const { error, value } = formQuerySchema.validate(query, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ApiError(400, `Validation failed: ${errorMessages.join(", ")}`);
  }

  return value;
};

export const validateMongoId = (id) => {
  if (!id) {
    throw new ApiError(400, "ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid ID format");
  }
  return id;
};
