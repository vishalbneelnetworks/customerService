import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";
import { FIELD_TYPES, TEMPLATE_TYPES } from "../constant.js";

const optionSchema = Joi.alternatives().try(
  Joi.string().trim().min(1).max(200).messages({
    "string.empty": "Option cannot be empty",
    "string.min": "Option must be at least 1 character long",
    "string.max": "Option must be at most 200 characters long",
  }),

  Joi.object({
    value: Joi.string().required().trim().min(1).max(100).messages({
      "any.required": "Option value is required",
      "string.empty": "Option value cannot be empty",
      "string.max": "Option value must be at most 100 characters long",
    }),
    label: Joi.string().required().trim().min(1).max(200).messages({
      "any.required": "Option label is required",
      "string.empty": "Option label cannot be empty",
      "string.max": "Option label must be at most 200 characters long",
    }),
  })
);

const fieldSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(50).messages({
    "string.empty": "Field name is required",
    "string.min": "Field name must be at least 1 character long",
    "string.max": "Field name must be at most 50 characters long",
  }),

  label: Joi.string().required().trim().min(1).max(100).messages({
    "string.empty": "Field label is required",
    "string.min": "Field label must be at least 1 character long",
    "string.max": "Field label must be at most 100 characters long",
  }),

  type: Joi.string()
    .required()
    .valid(...FIELD_TYPES)
    .messages({
      "any.required": "Field type is required",
      "any.only": `Field type must be one of: ${FIELD_TYPES.join(", ")}`,
    }),

  required: Joi.boolean().default(false),
  placeholder: Joi.string().allow("").max(200),
  helpText: Joi.string().allow("").max(500),
  options: Joi.array().items(optionSchema).min(1).messages({
    "array.base": "Options must be an array",
    "array.min": "At least one option is required when options are provided",
  }),
});

export const createTemplateSchema = Joi.object({
  templateType: Joi.string()
    .required()
    .valid(...TEMPLATE_TYPES)
    .messages({
      "any.required": "Template type is required",
      "any.only": `Template type must be one of: ${TEMPLATE_TYPES.join(", ")}`,
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

  subProjectType: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .pattern(/^[a-z_]+$/)
    .when("templateType", {
      is: "business",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "Sub-project type is required for business templates",
      "any.unknown": "Sub-project type is not allowed for technical templates",
      "string.pattern.base":
        "Sub-project type can only contain lowercase letters and underscores",
    }),

  version: Joi.string()
    .trim()
    .default("v1")
    .pattern(/^v\d+$/)
    .messages({
      "string.pattern.base": "Version must be in format v1, v2, v3, etc.",
    }),

  fields: Joi.array().items(fieldSchema).min(1).required().messages({
    "array.min": "At least one field is required",
    "any.required": "Fields are required",
  }),

  createdBy: Joi.string().trim(),
  isActive: Joi.boolean().default(true),
});

export const updateTemplateSchema = Joi.object({
  fields: Joi.array().items(fieldSchema).min(1).messages({
    "array.min": "At least one field is required",
  }),
  isActive: Joi.boolean(),
  createdBy: Joi.string().trim(),
  deactivateOldVersion: Joi.boolean().default(true),
});

export const templateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),

  templateType: Joi.string()
    .valid(...TEMPLATE_TYPES)
    .messages({
      "any.only": `Template type must be one of: ${TEMPLATE_TYPES.join(", ")}`,
    }),

  projectType: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z_]+$/),

  subProjectType: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z_]+$/),

  isActive: Joi.string().valid("true", "false"),
});

export const validateCreateTemplate = (data) => {
  const { error, value } = createTemplateSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ApiError(400, `Validation failed: ${errorMessages.join(", ")}`);
  }

  return value;
};

export const validateUpdateTemplate = (data) => {
  const { error, value } = updateTemplateSchema.validate(data, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ApiError(400, `Validation failed: ${errorMessages.join(", ")}`);
  }

  return value;
};

export const validateTemplateQuery = (query) => {
  const { error, value } = templateQuerySchema.validate(query, {
    abortEarly: false,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    throw new ApiError(400, `Validation failed: ${errorMessages.join(", ")}`);
  }

  return value;
};
