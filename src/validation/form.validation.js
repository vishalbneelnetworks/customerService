import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";
import {
  FORM_STATUSES,
  FORM_TYPES,
  INQUIRY_TYPES,
  INDUSTRY_TYPES,
  VENDOR_TIERS,
  TIMELINE_TYPES,
} from "../constant.js";
import mongoose from "mongoose";
import { createStructuredValidationError } from "../utils/errorHandler.js";

const basicInfoSchema = Joi.object({
  inquiryType: Joi.string()
    .valid(...INQUIRY_TYPES)
    .messages({
      "any.only": `Inquiry type must be one of: ${INQUIRY_TYPES.join(", ")}`,
    }),
});

const advancedInfoSchema = Joi.object({
  projectGoal: Joi.string().default(""),
  designInspiration: Joi.string().default(""),
  projectConstraints: Joi.string().default("nothing to provide"),
});

export const createFormSchema = Joi.object({
  customerId: Joi.string().required(),
  formType: Joi.string()
    .valid(...FORM_TYPES)
    .required()
    .messages({
      "any.required": "Form type is required",
      "any.only": `Form type must be one of: ${FORM_TYPES.join(", ")}`,
    }),

  projectType: Joi.string()
    .required()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .pattern(/^[a-z_]+$/)
    .messages({
      "any.required": "Project type is required",
      "string.pattern.base":
        "Project type can only contain lowercase letters and underscores",
    }),

  subProjectType: Joi.string().trim().lowercase().default("default").messages({
    "string.base": "Sub-project type must be a string",
  }),

  industryType: Joi.string()
    .valid(...INDUSTRY_TYPES)
    .required()
    .messages({
      "any.required": "Industry type is required",
      "any.only": `Industry type must be one of: ${INDUSTRY_TYPES.join(", ")}`,
    }),

  description: Joi.string().required().min(10).max(1000).messages({
    "any.required": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description must be at most 1000 characters long",
  }),

  vendorTier: Joi.string()
    .valid(...VENDOR_TIERS)
    .required()
    .messages({
      "any.required": "Vendor tier is required",
      "any.only": `Vendor tier must be one of: ${VENDOR_TIERS.join(", ")}`,
    }),

  preferredTimeline: Joi.string()
    .valid(...TIMELINE_TYPES)
    .required()
    .messages({
      "any.required": "Preferred timeline is required",
      "any.only": `Preferred timeline must be one of: ${TIMELINE_TYPES.join(
        ", "
      )}`,
    }),

  status: Joi.string()
    .valid(...FORM_STATUSES)
    .default("draft")
    .messages({
      "any.only": `Status must be one of: ${FORM_STATUSES.join(", ")}`,
    }),

  basicInfo: basicInfoSchema.when("formType", {
    is: "basic",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),

  advancedInfo: advancedInfoSchema.when("formType", {
    is: "advanced",
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateFormSchema = Joi.object({
  description: Joi.string().min(10).max(1000).messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description must be at most 1000 characters long",
  }),

  vendorTier: Joi.string()
    .valid(...VENDOR_TIERS)
    .messages({
      "any.only": `Vendor tier must be one of: ${VENDOR_TIERS.join(", ")}`,
    }),

  preferredTimeline: Joi.string()
    .valid(...TIMELINE_TYPES)
    .messages({
      "any.only": `Preferred timeline must be one of: ${TIMELINE_TYPES.join(
        ", "
      )}`,
    }),

  basicInfo: basicInfoSchema,
  advancedInfo: advancedInfoSchema,
});

export const formQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  formType: Joi.string().valid(...FORM_TYPES),
  projectType: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .pattern(/^[a-z_]+$/)
    .messages({
      "string.pattern.base":
        "Project type can only contain lowercase letters and underscores",
    }),
  subProjectType: Joi.string().trim().lowercase().messages({
    "string.base": "Sub-project type must be a string",
  }),
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
