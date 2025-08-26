import Joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const createServiceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

export const validateCreateService = (service) => {
  const { error, value } = createServiceSchema.validate(service);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const createSubServiceSchema = Joi.object({
  serviceId: Joi.string().custom(validateObjectId).required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

export const validateCreateSubService = (subService) => {
  const { error, value } = createSubServiceSchema.validate(subService);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const updateServiceSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const validateUpdateService = (service) => {
  const { error, value } = updateServiceSchema.validate(service);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const updateSubServiceSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const validateUpdateSubService = (subService) => {
  const { error, value } = updateSubServiceSchema.validate(subService);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};
