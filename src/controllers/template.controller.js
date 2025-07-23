import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  getProjectTypesWithSubTypes,
  getTemplateByProjectAndSubType,
} from "../services/template.service.js";

// Create a new template
export const createTemplateController = asyncHandler(async (req, res) => {
  const template = await createTemplate(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, template, "Template created successfully"));
});

// Get all templates with pagination and filtering
export const getTemplatesController = asyncHandler(async (req, res) => {
  const response = await getTemplates(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Templates retrieved successfully"));
});

// Get template by ID
export const getTemplateByIdController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const template = await getTemplateById(templateId);

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template retrieved successfully"));
});

// Update template
export const updateTemplateController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const result = await updateTemplate(templateId, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Template updated with new version"));
});

// Delete template
export const deleteTemplateController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  await deleteTemplate(templateId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Template deleted successfully"));
});

// Toggle template active status
export const toggleTemplateStatusController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const template = await toggleTemplateStatus(templateId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        template,
        `Template ${
          template.isActive ? "activated" : "deactivated"
        } successfully`
      )
    );
});

// Get all project types with their sub-types
export const getProjectTypesWithSubTypesController = asyncHandler(
  async (req, res) => {
    const projectTypesWithSubTypes = await getProjectTypesWithSubTypes();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...projectTypesWithSubTypes },
          "Project types with sub-types retrieved successfully"
        )
      );
  }
);

// Get template by project type and sub-project type
export const getTemplateByProjectSubTypeController = asyncHandler(
  async (req, res) => {
    const { projectType, subProjectType } = req.params;
    const { version } = req.query;

    const template = await getTemplateByProjectAndSubType(
      projectType,
      subProjectType,
      version
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, { template }, "Template retrieved successfully")
      );
  }
);
