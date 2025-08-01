import Joi from "joi";
import mongoose from "mongoose";

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const createSlabSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  vector: Joi.number().required(),
});

const createTagSchema = Joi.object({
  name: Joi.string().required(),
  slabId: Joi.string().custom(validateObjectId).required(),
  synonyms: Joi.array().items(Joi.string()).required(),
});

const updateSlabSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  vector: Joi.number(),
});

const updateTagSchema = Joi.object({
  name: Joi.string(),
  synonyms: Joi.array().items(Joi.string()),
});

const validateSlab = (slabData) => {
  const { error, value } = createSlabSchema.validate(slabData);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const validateTag = (tagData) => {
  const { error, value } = createTagSchema.validate(tagData);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const validateSlabUpdate = (slabData) => {
  const { error, value } = updateSlabSchema.validate(slabData);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const validateTagUpdate = (tagData) => {
  const { error, value } = updateTagSchema.validate(tagData);
  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const validateMongoId = (id) => {
  if (!id) {
    throw new Error("ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID");
  }
  return id;
};

const validateSynonym = (synonymData) => {
  const { error, value } = Joi.string().lowercase().validate(synonymData);

  if (error) {
    throw new Error(error.message);
  }
  return value;
};

const validateQuery = (query) => {
  const { error, value } = Joi.object({
    name: Joi.string(),
    slabName: Joi.string(),
    limit: Joi.number().default(10).min(1).max(100),
    page: Joi.number().default(1).min(1),
  }).validate(query);

  if (error) {
    throw new Error(error.message);
  }
  value.skip = (value.page - 1) * value.limit;
  return value;
};

export {
  validateSlab,
  validateTag,
  validateSlabUpdate,
  validateTagUpdate,
  validateMongoId,
  validateSynonym,
  validateQuery,
};
