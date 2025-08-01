import {
  createTag,
  getTags,
  getTagsBySlabId,
  getTagById,
  updateTag,
  deleteTag,
  getSynonymsByTagId,
  createSynonym,
  updateSynonym,
  deleteSynonym,
} from "../services/tags.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createTagController = asyncHandler(async (req, res) => {
  const tag = await createTag(req.body);
  res.status(201).json(new ApiResponse(201, tag, "Tag created successfully"));
});

export const getTagsBySlabIdController = asyncHandler(async (req, res) => {
  const tags = await getTagsBySlabId(req.params.slabId);
  res.status(200).json(new ApiResponse(200, tags, "Tags fetched successfully"));
});

export const getTagsController = asyncHandler(async (req, res) => {
  const tags = await getTags(req.query);
  res.status(200).json(new ApiResponse(200, tags, "Tags fetched successfully"));
});

export const getTagByIdController = asyncHandler(async (req, res) => {
  const tag = await getTagById(req.params.tagId);
  res.status(200).json(new ApiResponse(200, tag, "Tag fetched successfully"));
});

export const updateTagController = asyncHandler(async (req, res) => {
  const tag = await updateTag(req.params.tagId, req.body);
  res.status(200).json(new ApiResponse(200, tag, "Tag updated successfully"));
});

export const deleteTagController = asyncHandler(async (req, res) => {
  const tag = await deleteTag(req.params.tagId);
  res.status(200).json(new ApiResponse(200, tag, "Tag deleted successfully"));
});

// Synonyms
export const getSynonymsByTagIdController = asyncHandler(async (req, res) => {
  const synonyms = await getSynonymsByTagId(req.params.tagId);
  res
    .status(200)
    .json(new ApiResponse(200, synonyms, "Synonyms fetched successfully"));
});

export const createSynonymController = asyncHandler(async (req, res) => {
  const synonym = await createSynonym(req.params.tagId, req.body.synonym);
  res
    .status(201)
    .json(new ApiResponse(201, synonym, "Synonym created successfully"));
});

export const updateSynonymController = asyncHandler(async (req, res) => {
  const synonym = await updateSynonym(
    req.params.tagId,
    req.params.synonymName,
    req.body.newSynonymName
  );
  res
    .status(200)
    .json(new ApiResponse(200, synonym, "Synonym updated successfully"));
});

export const deleteSynonymController = asyncHandler(async (req, res) => {
  const synonym = await deleteSynonym(req.params.tagId, req.params.synonymName);
  res
    .status(200)
    .json(new ApiResponse(200, synonym, "Synonym deleted successfully"));
});
