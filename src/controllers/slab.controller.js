import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createSlab,
  getSlabs,
  getSlabById,
  updateSlab,
  deleteSlab,
  getTagsBySlabId,
} from "../services/slab.service.js";

export const createSlabController = asyncHandler(async (req, res) => {
  const slab = await createSlab(req.body);
  res.status(201).json(new ApiResponse(201, slab, "Slab created successfully"));
});

export const getSlabsController = asyncHandler(async (req, res) => {
  const slabs = await getSlabs();
  res
    .status(200)
    .json(new ApiResponse(200, slabs, "Slabs fetched successfully"));
});

export const getSlabByIdController = asyncHandler(async (req, res) => {
  const slab = await getSlabById(req.params.slabId);
  res.status(200).json(new ApiResponse(200, slab, "Slab fetched successfully"));
});

export const updateSlabController = asyncHandler(async (req, res) => {
  const slab = await updateSlab(req.params.slabId, req.body);
  res.status(200).json(new ApiResponse(200, slab, "Slab updated successfully"));
});

export const deleteSlabController = asyncHandler(async (req, res) => {
  const slab = await deleteSlab(req.params.slabId);
  res.status(200).json(new ApiResponse(200, slab, "Slab deleted successfully"));
});

export const getTagsBySlabIdController = asyncHandler(async (req, res) => {
  const tags = await getTagsBySlabId(req.params.slabId);
  res.status(200).json(new ApiResponse(200, tags, "Tags fetched successfully"));
});
