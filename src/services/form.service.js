import { RequirementForm } from "../models/form.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  validateCreateForm,
  validateUpdateForm,
  validateFormQuery,
  validateAdvancedForm,
  validateStatusTransition,
  checkFormModifiable,
  // validateAgainstTemplate,
} from "../validation/form.validation.js";
import mongoose from "mongoose";
import { Template } from "../models/template.model.js";

export const createForm = async (formData) => {
  const validatedData = validateCreateForm(formData);

  if (validatedData.formType === "advanced" && validatedData.advancedInfo) {
    const { businessTemplateId, technicalTemplateId, responses } =
      validatedData.advancedInfo;

    const businessTemplate = await Template.findById(businessTemplateId);

    if (!businessTemplate) {
      throw new ApiError(404, "Business template not found");
    }

    if (businessTemplate.templateType !== "business") {
      throw new ApiError(400, "Invalid business template type");
    }

    let technicalTemplate = null;
    if (technicalTemplateId) {
      technicalTemplate = await Template.findById(technicalTemplateId);
      if (!technicalTemplate) {
        throw new ApiError(404, "Technical template not found");
      }

      if (technicalTemplate.templateType !== "technical") {
        throw new ApiError(400, "Invalid technical template type");
      }
    }

    const validatedResponses = validateAdvancedForm(
      responses,
      businessTemplate,
      technicalTemplate
    );

    validatedData.advancedInfo.responses = validatedResponses;
  }

  const form = await RequirementForm.create(validatedData);

  return form;
};

export const getFormWithTemplate = async (formId) => {
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    throw new ApiError(400, "Invalid form ID format");
  }

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(formId) } },
    {
      $lookup: {
        from: "templates",
        localField: "advancedInfo.businessTemplateId",
        foreignField: "_id",
        as: "businessTemplate",
      },
    },
    {
      $lookup: {
        from: "templates",
        localField: "advancedInfo.technicalTemplateId",
        foreignField: "_id",
        as: "technicalTemplate",
      },
    },
    {
      $unwind: { path: "$businessTemplate", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$technicalTemplate", preserveNullAndEmptyArrays: true },
    },
  ];

  const [result] = await RequirementForm.aggregate(pipeline);
  const form = result;

  return form;
};

export const getFormById = async (formId) => {
  const form = await RequirementForm.findById(formId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }
  return form;
};

export const getForms = async (queryParams = {}) => {
  // Validate query parameters
  const validatedQuery = validateFormQuery(queryParams);
  const { page, limit, formType, projectType, status, sortBy, sortOrder } =
    validatedQuery;

  // Build match stage
  const matchStage = {};
  if (formType) matchStage.formType = formType;
  if (projectType) matchStage.projectType = projectType;
  if (status) matchStage.status = status;

  // Build sort stage
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

  // Aggregation pipeline
  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    {
      $facet: {
        forms: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await RequirementForm.aggregate(pipeline);
  const forms = result.forms;
  const total = result.totalCount[0]?.total || 0;

  return {
    forms,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalForms: total,
      hasNext: skip + forms.length < total,
      hasPrev: page > 1,
    },
  };
};

export const getFormsByProjectType = async (projectType, queryParams = {}) => {
  if (!projectType) {
    throw new ApiError(400, "Project type is required");
  }

  const validatedQuery = validateFormQuery(queryParams);
  const { page = 1, limit = 10, status } = validatedQuery;

  const matchStage = { projectType };
  if (status) matchStage.status = status;

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        forms: [{ $skip: skip }, { $limit: parseInt(limit) }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await RequirementForm.aggregate(pipeline);
  const forms = result.forms;
  const total = result.totalCount[0]?.total || 0;

  return {
    forms,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalForms: total,
      hasNext: skip + forms.length < total,
      hasPrev: page > 1,
    },
  };
};

export const updateForm = async (formId, updateData) => {
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    throw new ApiError(400, "Invalid form ID format");
  }

  const form = await RequirementForm.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if form can be modified (only draft forms)
  checkFormModifiable(form);

  // Validate update data
  const validatedData = validateUpdateForm(updateData);

  if (form.formType === "basic" && validatedData.advancedInfo) {
    throw new ApiError(400, "Cannot update advancedInfo for basic forms");
  }

  if (form.formType === "advanced" && validatedData.basicInfo) {
    throw new ApiError(400, "Cannot update basicInfo for advanced forms");
  }

  if (validatedData.advancedInfo) {
    const businessTemplate = await Template.findById(
      form.advancedInfo.businessTemplateId
    );

    if (!businessTemplate) {
      throw new ApiError(404, "Business template not found");
    }

    if (businessTemplate.templateType !== "business") {
      throw new ApiError(400, "Invalid business template type");
    }

    let technicalTemplate = null;

    if (form.advancedInfo.technicalTemplateId) {
      technicalTemplate = await Template.findById(
        form.advancedInfo.technicalTemplateId
      );
      if (!technicalTemplate) {
        throw new ApiError(404, "Technical template not found");
      }

      if (technicalTemplate.templateType !== "technical") {
        throw new ApiError(400, "Invalid technical template type");
      }
    }

    const validatedResponses = validateAdvancedForm(
      validatedData.advancedInfo.responses,
      businessTemplate,
      technicalTemplate
    );
    validatedData.advancedInfo.responses = validatedResponses;
  }

  // Update the form
  const updatedForm = await RequirementForm.findByIdAndUpdate(
    formId,
    validatedData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};

export const deleteForm = async (formId) => {
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    throw new ApiError(400, "Invalid form ID format");
  }

  const form = await RequirementForm.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  // Check if form can be deleted (only draft forms)
  checkFormModifiable(form);

  await RequirementForm.findByIdAndDelete(formId);
  return form;
};

export const changeFormStatus = async (formId, newStatus) => {
  if (!formId) {
    throw new ApiError(400, "Form ID is required");
  }

  if (!newStatus) {
    throw new ApiError(400, "Status is required");
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    throw new ApiError(400, "Invalid form ID format");
  }

  const form = await RequirementForm.findById(formId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (form.status === newStatus) {
    throw new ApiError(400, "Form is already in this status");
  }

  // Validate status transition
  validateStatusTransition(form.status, newStatus);

  // Update timestamps based on status
  const updateData = { status: newStatus };

  if (newStatus === "submitted") {
    updateData.submittedAt = new Date();
  } else if (newStatus === "approved" || newStatus === "rejected") {
    updateData.reviewedAt = new Date();
  } else if (newStatus === "published") {
    updateData.publishedAt = new Date();
  }

  const updatedForm = await RequirementForm.findByIdAndUpdate(
    formId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};

// Default export for convenience
const formService = {
  createForm,
  getFormWithTemplate,
  getForms,
  getFormById,
  getFormsByProjectType,
  updateForm,
  deleteForm,
  changeFormStatus,
};

export default formService;
