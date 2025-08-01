import { asyncHandler } from "../utils/asyncHandler.js";
import { getFormData, getFormScore } from "../services/score.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getFormDataController = asyncHandler(async (req, res) => {
  const { formData, message } = await getFormData(req.params.formId);
  res.status(200).json(new ApiResponse(200, formData, message));
});

export const getFormScoreController = asyncHandler(async (req, res) => {
  const { formId, formScore, matchedTags } = await getFormScore(
    req.params.formId
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { formId, formScore, matchedTags },
        "Form score fetched successfully"
      )
    );
});
