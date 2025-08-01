import Tag from "../models/tag.model.js";
import Slab from "../models/slab.model.js";
import {
  validateTag,
  validateMongoId,
  validateTagUpdate,
  validateSynonym,
  validateQuery,
} from "../validation/validation.js";

export const createTag = async (tagData) => {
  const validatedTag = validateTag(tagData);
  const slabExists = await Slab.findById(validatedTag.slabId);
  if (!slabExists) {
    throw new Error("Slab does not exist");
  }
  const existingTag = await Tag.findOne({
    name: validatedTag.name,
    slabId: validatedTag.slabId,
  });
  if (existingTag) {
    return existingTag;
  }
  const tag = await Tag.create(validatedTag);
  return tag;
};

export const getTags = async (query) => {
  const { limit, skip } = validateQuery(query);
  const tags = await Tag.find().skip(skip).limit(limit);
  return tags;
};

export const getTagsBySlabId = async (slabId) => {
  const validatedSlabId = validateMongoId(slabId);
  const tags = await Tag.find({ slabId: validatedSlabId });
  return tags;
};

export const getTagById = async (tagId) => {
  const validatedTagId = validateMongoId(tagId);
  const tag = await Tag.findById(validatedTagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  return tag;
};

export const updateTag = async (tagId, tagData) => {
  const validatedTagId = validateMongoId(tagId);
  const validatedTagData = validateTagUpdate(tagData);
  const tag = await Tag.findByIdAndUpdate(validatedTagId, validatedTagData, {
    new: true,
  });
  if (!tag) {
    throw new Error("Tag not found");
  }
  return tag;
};

export const deleteTag = async (tagId) => {
  const validatedTagId = validateMongoId(tagId);
  const tag = await Tag.findByIdAndDelete(validatedTagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  return tag;
};

export const getSynonymsByTagId = async (tagId) => {
  const validatedTagId = validateMongoId(tagId);
  const tag = await Tag.findById(validatedTagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  return tag.synonyms;
};

export const createSynonym = async (tagId, synonymData) => {
  const validatedTagId = validateMongoId(tagId);
  const validatedSynonym = validateSynonym(synonymData);
  const tag = await Tag.findById(validatedTagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  if (!tag.synonyms.includes(validatedSynonym)) {
    tag.synonyms.push(validatedSynonym);
  }
  await tag.save();
  return tag;
};

export const updateSynonym = async (tagId, oldSynonym, newSynonym) => {
  const validatedTagId = validateMongoId(tagId);
  const validatedNewSynonym = validateSynonym(newSynonym);

  const tag = await Tag.findOneAndUpdate(
    { _id: validatedTagId, synonyms: oldSynonym },
    { $set: { "synonyms.$": validatedNewSynonym } },
    { new: true }
  );

  if (!tag) {
    throw new Error("Tag or synonym not found");
  }

  return tag;
};

export const deleteSynonym = async (tagId, synonymName) => {
  const validatedTagId = validateMongoId(tagId);
  const validatedSynonymName = validateSynonym(synonymName);
  const tag = await Tag.findById(validatedTagId);
  if (!tag) {
    throw new Error("Tag not found");
  }
  tag.synonyms = tag.synonyms.filter(
    (synonym) => synonym !== validatedSynonymName
  );
  await tag.save();
  return tag;
};
