import { Template } from "../models/template.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateTemplateQuery,
} from "../validation/template.validation.js";
import mongoose from "mongoose";
import { RequirementForm } from "../models/form.model.js";
import { convertOptionsToValueLabel } from "../utils/templateOptions.js";

export const createTemplate = async (templateData) => {
  const validatedData = validateCreateTemplate(templateData);
  const { templateType, projectType, subProjectType, version } = validatedData;

  if (validatedData.fields) {
    validatedData.fields = validatedData.fields.map((field) => {
      if (field.options && Array.isArray(field.options)) {
        field.options = convertOptionsToValueLabel(field.options);
      }
      return field;
    });
  }

  const uniqueQuery = {
    templateType,
    projectType,
    version,
  };

  if (templateType === "business") {
    uniqueQuery.subProjectType = subProjectType || "default";
  }

  const existingTemplate = await Template.findOne(uniqueQuery);

  if (existingTemplate) {
    const identifier =
      templateType === "business"
        ? `${projectType}/${subProjectType || "default"}`
        : projectType;
    throw new ApiError(
      400,
      `${templateType} template for ${identifier} version ${version} already exists`
    );
  }

  const template = await Template.create(validatedData);
  return template;
};

export const getTemplates = async (queryParams = {}) => {
  const validatedQuery = validateTemplateQuery(queryParams);
  const { page, limit, templateType, projectType, subProjectType, isActive } =
    validatedQuery;

  const filter = {};
  if (templateType) filter.templateType = templateType;
  if (projectType) filter.projectType = projectType;
  if (subProjectType) filter.subProjectType = subProjectType;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const skip = (page - 1) * limit;

  const templates = await Template.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Template.countDocuments(filter);

  return {
    templates,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTemplates: total,
      hasNext: skip + templates.length < total,
      hasPrev: page > 1,
    },
  };
};

export const getTemplateById = async (templateId) => {
  if (!templateId) {
    throw new ApiError(400, "Template ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(templateId)) {
    throw new ApiError(400, "Invalid template ID format");
  }

  const template = await Template.findById(templateId);

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  return template;
};

export const getBusinessTemplateByProjectAndSubType = async (
  projectType,
  subProjectType,
  version = null
) => {
  const query = {
    templateType: "business",
    projectType: projectType.toLowerCase(),
    subProjectType: subProjectType.toLowerCase(),
    isActive: true,
  };

  if (version) {
    query.version = version;
  }

  const template = await Template.findOne(query).sort({
    createdAt: -1,
  });

  if (!template) {
    throw new ApiError(
      404,
      `No business template found for ${projectType}/${subProjectType}`
    );
  }

  return template;
};

export const getTechnicalTemplateByProjectType = async (
  projectType,
  version = null
) => {
  const query = {
    templateType: "technical",
    projectType: projectType.toLowerCase(),
    isActive: true,
  };

  if (version) {
    query.version = version;
  }

  const template = await Template.findOne(query).sort({
    createdAt: -1,
  });

  if (!template) {
    throw new ApiError(
      404,
      `No technical template found for project type: ${projectType}`
    );
  }

  return template;
};

export const getAdvancedFormTemplates = async (projectType, subProjectType) => {
  try {
    let businessTemplate;
    try {
      businessTemplate = await getBusinessTemplateByProjectAndSubType(
        projectType,
        subProjectType
      );
    } catch (error) {
      console.log(
        `No specific business template found for ${projectType}/${subProjectType}, using universal template`
      );
      businessTemplate = await getBusinessTemplateByProjectAndSubType(
        "universal",
        "default"
      );
    }
    let technicalTemplate = null;
    try {
      technicalTemplate = await getTechnicalTemplateByProjectType(projectType);
    } catch (error) {
      console.log(
        `No specific technical template found for ${projectType}, using universal template`
      );
      try {
        technicalTemplate = await getTechnicalTemplateByProjectType(
          "universal"
        );
      } catch (fallbackError) {
        console.log(
          "No universal technical template found, proceeding without technical template"
        );
      }
    }

    return {
      businessTemplate,
      technicalTemplate,
      isUniversal: {
        business: businessTemplate.projectType === "universal",
        technical: technicalTemplate?.projectType === "universal",
      },
    };
  } catch (error) {
    throw new ApiError(
      404,
      `Templates not found for ${projectType}/${subProjectType}: ${error.message}`
    );
  }
};

export const updateTemplate = async (templateId, updateData) => {
  const validatedData = validateUpdateTemplate(updateData);

  if (validatedData.fields) {
    validatedData.fields = validatedData.fields.map((field) => {
      if (field.options && Array.isArray(field.options)) {
        field.options = convertOptionsToValueLabel(field.options);
      }
      return field;
    });
  }

  const existingTemplate = await getTemplateById(templateId);

  if (!existingTemplate.isActive) {
    throw new ApiError(
      400,
      `Cannot update inactive template. Template is version ${existingTemplate.version} and is inactive.`
    );
  }

  const currentVersion = existingTemplate.version;
  const versionNumber = parseInt(currentVersion.replace("v", "")) + 1;
  const newVersion = `v${versionNumber}`;

  const uniqueQuery = {
    templateType: existingTemplate.templateType,
    projectType: existingTemplate.projectType,
    version: newVersion,
  };

  if (existingTemplate.templateType === "business") {
    uniqueQuery.subProjectType = existingTemplate.subProjectType;
  }

  const existingNewVersion = await Template.findOne(uniqueQuery);

  if (existingNewVersion) {
    const identifier =
      existingTemplate.templateType === "business"
        ? `${existingTemplate.projectType}/${existingTemplate.subProjectType}`
        : existingTemplate.projectType;
    throw new ApiError(
      400,
      `${existingTemplate.templateType} template version ${newVersion} already exists for ${identifier}`
    );
  }

  const newTemplateData = {
    templateType: existingTemplate.templateType,
    projectType: existingTemplate.projectType,
    version: newVersion,
    fields: validatedData.fields || existingTemplate.fields,
    createdBy: validatedData.createdBy || existingTemplate.createdBy,
    isActive:
      validatedData.isActive !== undefined ? validatedData.isActive : true,
  };

  if (existingTemplate.templateType === "business") {
    newTemplateData.subProjectType = existingTemplate.subProjectType;
  }

  const newTemplate = await Template.create(newTemplateData);

  if (validatedData.deactivateOldVersion !== false) {
    existingTemplate.isActive = false;
    await existingTemplate.save();
  }

  return {
    newTemplate,
    oldTemplate: existingTemplate,
    message: `New version ${newVersion} created. Old version ${currentVersion} ${
      existingTemplate.isActive ? "remains active" : "deactivated"
    }.`,
  };
};

export const deleteTemplate = async (templateId) => {
  const template = await getTemplateById(templateId);

  const templateField =
    template.templateType === "business"
      ? "advancedInfo.businessTemplateId"
      : "advancedInfo.technicalTemplateId";

  const formsUsingTemplate = await RequirementForm.countDocuments({
    [templateField]: templateId,
  });

  if (formsUsingTemplate > 0) {
    throw new ApiError(
      400,
      `Cannot delete template. ${formsUsingTemplate} forms are using this ${template.templateType} template. Deactivate instead.`
    );
  }

  await Template.findByIdAndDelete(templateId);
  return template;
};

export const toggleTemplateStatus = async (templateId) => {
  const template = await getTemplateById(templateId);
  template.isActive = !template.isActive;
  await template.save();
  return template;
};

export const getTemplatesByType = async (templateType, queryParams = {}) => {
  return getTemplates({ ...queryParams, templateType });
};

const templateService = {
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
};

export default templateService;
