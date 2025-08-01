import { RequirementForm } from "../models/form.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  validateCreateForm,
  validateUpdateForm,
  validateFormQuery,
  validateStatusTransition,
  checkFormModifiable,
  validateMongoId,
} from "../validation/form.validation.js";

export const createForm = async (formData) => {
  const validatedData = validateCreateForm(formData);

  const existingForm = await RequirementForm.findOne({
    customerId: validatedData.customerId,
    formType: validatedData.formType,
    projectType: validatedData.projectType,
    subProjectType: validatedData.subProjectType,
  });

  if (existingForm) {
    throw new ApiError(
      400,
      `Form already exists for customer ${validatedData.customerId} with form type ${validatedData.formType} and project type ${validatedData.projectType} and subProjectType ${validatedData.subProjectType}`
    );
  }

  const newForm = await RequirementForm.create(validatedData);

  return newForm;
};

export const getFormById = async (formId) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);
  if (!form) {
    throw new ApiError(404, "Form not found");
  }
  return form;
};

export const getForms = async (queryParams = {}) => {
  const validatedQuery = validateFormQuery(queryParams);
  const {
    page,
    limit,
    formType,
    projectType,
    status,
    sortBy,
    sortOrder,
    industryType,
    subProjectType,
  } = validatedQuery;

  const matchStage = {};
  if (formType) matchStage.formType = formType;
  if (projectType) matchStage.projectType = projectType;
  if (status) matchStage.status = status;
  if (industryType) matchStage.industryType = industryType;
  if (subProjectType) matchStage.subProjectType = subProjectType;
  const sortStage = {};
  sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;

  const skip = (page - 1) * limit;

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

export const getFormsByProjectTypeOrSubProjectType = async (
  projectType,
  subProjectType = null,
  queryParams = {}
) => {
  const validatedQuery = validateFormQuery(queryParams);
  const { page = 1, limit = 10, status } = validatedQuery;

  const matchStage = { projectType };
  if (subProjectType) matchStage.subProjectType = subProjectType;
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

  console.log(matchStage);

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
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  checkFormModifiable(form, "update");

  const validatedData = validateUpdateForm(updateData);

  if (form.formType === "basic" && validatedData.advancedInfo) {
    throw new ApiError(400, "Cannot update advancedInfo for basic forms");
  }

  if (form.formType === "advanced" && validatedData.basicInfo) {
    throw new ApiError(400, "Cannot update basicInfo for advanced forms");
  }

  const updatedForm = await RequirementForm.findByIdAndUpdate(
    validatedId,
    validatedData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};

export const deleteForm = async (formId) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  checkFormModifiable(form, "delete");

  await RequirementForm.findByIdAndDelete(validatedId);
  return form;
};

export const changeFormStatus = async (formId, newStatus) => {
  const validatedId = validateMongoId(formId);
  const form = await RequirementForm.findById(validatedId);

  if (!form) {
    throw new ApiError(404, "Form not found");
  }

  if (form.status === newStatus) {
    throw new ApiError(400, "Form is already in this status");
  }

  validateStatusTransition(form.status, newStatus);

  const updateData = { status: newStatus };

  if (newStatus === "submitted") {
    updateData.submittedAt = new Date();
  } else if (newStatus === "approved" || newStatus === "rejected") {
    updateData.reviewedAt = new Date();
  } else if (newStatus === "published") {
    updateData.publishedAt = new Date();
  }

  const updatedForm = await RequirementForm.findByIdAndUpdate(
    validatedId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedForm;
};
