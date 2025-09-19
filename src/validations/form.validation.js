import Joi from "joi";
import { ApiError } from "../utils/index.js";

const submitFormSchema = Joi.object({
  customerId: Joi.string().required(),
  serviceSelection: Joi.object({
    serviceId: Joi.string().required(),
    serviceName: Joi.string().required(),
    selectedAddons: Joi.array().items(Joi.string()).default([]).required(),
  }).required(),
  locationPreference: Joi.object({
    countries: Joi.array().items(Joi.string()).required().min(1),
    cities: Joi.array().items(Joi.string()).default([]).required(),
  }).required(),
  vendorPreference: Joi.object({
    vendorType: Joi.string().valid("freelancer", "company", "both").required(),
    noOfVendors: Joi.number().min(1).max(3).required(),
  }).required(),
  budgetPreference: Joi.object({
    budget: Joi.number().min(0).required(),
    budgetType: Joi.string().valid("hourly", "fixed").required(),
  }).required(),
  estimatedTime: Joi.string().valid("ASAP", "soon", "not urgent").required(),
  description: Joi.string().default("").required(),
});

export const submitFormValidation = (data) => {
  const { error } = submitFormSchema.validate(data);
  if (error) {
    throw new ApiError(400, error.message);
  }
  return data;
};
