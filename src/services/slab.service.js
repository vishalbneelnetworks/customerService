import Slab from "../models/slab.model.js";
import {
  validateSlab,
  validateSlabUpdate,
  validateMongoId,
} from "../validation/validation.js";
import Tag from "../models/tag.model.js";

export const createSlab = async (slabData) => {
  const validatedSlab = validateSlab(slabData);
  const existingSlab = await Slab.findOne({ name: validatedSlab.name });
  if (existingSlab) {
    throw new Error("Slab already exists");
  }
  const slab = await Slab.create(validatedSlab);
  return slab;
};

export const getSlabs = async () => {
  const slabs = await Slab.find();
  return slabs;
};

export const getSlabById = async (slabId) => {
  const validatedSlabId = validateMongoId(slabId);
  const slab = await Slab.findById(validatedSlabId);
  if (!slab) {
    throw new Error("Slab not found");
  }
  return slab;
};

export const updateSlab = async (slabId, slabData) => {
  const validatedSlabId = validateMongoId(slabId);
  const validatedSlabData = validateSlabUpdate(slabData);
  const slab = await Slab.findByIdAndUpdate(
    validatedSlabId,
    validatedSlabData,
    { new: true }
  );
  if (!slab) {
    throw new Error("Slab not found");
  }
  return slab;
};

export const deleteSlab = async (slabId) => {
  const validatedSlabId = validateMongoId(slabId);
  const slab = await Slab.findByIdAndDelete(validatedSlabId);
  if (!slab) {
    throw new Error("Slab not found");
  }
  return slab;
};

export const getTagsBySlabId = async (slabId) => {
  const validatedSlabId = validateMongoId(slabId);
  const tags = await Tag.find({ slabId: validatedSlabId });
  return tags;
};
