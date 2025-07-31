import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  getBusinessTemplateByProjectAndSubType,
  getTechnicalTemplateByProjectType,
  getAdvancedFormTemplates,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  getTemplatesByType,
} from "../services/template.service.js";

export const createTemplateController = asyncHandler(async (req, res) => {
  const template = await createTemplate(req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        template,
        `${template.templateType} template created successfully`
      )
    );
});

export const getTemplatesController = asyncHandler(async (req, res) => {
  const response = await getTemplates(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Templates retrieved successfully"));
});

export const getTemplatesByTypeController = asyncHandler(async (req, res) => {
  const { templateType } = req.params;
  const response = await getTemplatesByType(templateType, req.query);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        response,
        `${templateType} templates retrieved successfully`
      )
    );
});

export const getTemplateByIdController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const template = await getTemplateById(templateId);

  return res
    .status(200)
    .json(new ApiResponse(200, template, "Template retrieved successfully"));
});

export const getBusinessTemplateController = asyncHandler(async (req, res) => {
  const { projectType, subProjectType } = req.params;
  const { version } = req.query;

  const template = await getBusinessTemplateByProjectAndSubType(
    projectType,
    subProjectType,
    version
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, template, "Business template retrieved successfully")
    );
});

export const getTechnicalTemplateController = asyncHandler(async (req, res) => {
  const { projectType } = req.params;
  const { version } = req.query;

  const template = await getTechnicalTemplateByProjectType(
    projectType,
    version
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        template,
        "Technical template retrieved successfully"
      )
    );
});

export const getAdvancedFormTemplatesController = asyncHandler(
  async (req, res) => {
    const { projectType, subProjectType } = req.params;

    const templates = await getAdvancedFormTemplates(
      projectType,
      subProjectType
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          templates,
          "Advanced form templates retrieved successfully"
        )
      );
  }
);

export const updateTemplateController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const result = await updateTemplate(templateId, req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Template updated with new version"));
});

export const deleteTemplateController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const deletedTemplate = await deleteTemplate(templateId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedTemplate,
        `${deletedTemplate.templateType} template deleted successfully`
      )
    );
});

export const toggleTemplateStatusController = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const template = await toggleTemplateStatus(templateId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        template,
        `${template.templateType} template ${
          template.isActive ? "activated" : "deactivated"
        } successfully`
      )
    );
});

const templateController = {
  createTemplateController,
  getTemplatesController,
  getTemplatesByTypeController,
  getTemplateByIdController,
  getBusinessTemplateController,
  getTechnicalTemplateController,
  getAdvancedFormTemplatesController,
  updateTemplateController,
  deleteTemplateController,
  toggleTemplateStatusController,
};

export default templateController;
