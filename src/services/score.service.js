import axios from "axios";
import { validateMongoId } from "../validation/validation.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import Tag from "../models/tag.model.js";

export const getFormData = async (formId) => {
  try {
    const response = await axios.get(`${env.FORM_API_URL}/forms/${formId}`);
    const { data, message } = response.data;
    const omitedFields = [
      "customerId",
      "formId",
      "status",
      "updatedAt",
      "createdAt",
      "_id",
    ];
    const formData = Object.fromEntries(
      Object.entries(data).filter(([key]) => !omitedFields.includes(key))
    );
    return { formData, message };
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

export const getFormScore = async (formId) => {
  const validatedFormId = validateMongoId(formId);
  try {
    // Get form data
    const { formData } = await getFormData(validatedFormId);

    // Flatten the form data
    const flattenedFormData = flattenObject(formData);

    // Extract text values from the form data
    const textValues = extractTextValues(flattenedFormData);

    // Find matching tags
    const matchedTags = await findMatchingTags(textValues);

    // Calculate the form score
    const formScore = matchedTags.reduce((acc, tag) => {
      return acc + tag.slabId.vector;
    }, 0);

    // Return the form score and matched tags
    return {
      formId: validatedFormId,
      formScore,
      matchedTags: matchedTags.map((tag) => tag.name),
    };
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

function flattenObject(obj, parentKey = "", result = {}) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const newKey = parentKey ? `${parentKey}.${key}` : key;
    const value = obj[key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

function extractTextValues(formData) {
  const values = [];

  const structuredFields = [
    "projectType",
    "industryType",
    "subProjectType",
    "vendorTier",
    "preferredTimeline",
  ];

  structuredFields.forEach((field) => {
    if (formData[field]) {
      values.push(formData[field].toLowerCase());
    }
  });

  return [...new Set(values)];
}

async function findMatchingTags(textValues) {
  const matchedTags = await Tag.find({
    $or: [{ name: { $in: textValues } }, { synonyms: { $in: textValues } }],
  }).populate("slabId");

  return matchedTags;
}
