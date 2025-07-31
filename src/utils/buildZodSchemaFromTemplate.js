import Joi from "joi";
import { extractOptionValues } from "./templateOptions.js";

function mapFieldToJoi(field) {
  let base;

  switch (field.type) {
    case "string":
      base = Joi.string();
      break;
    case "string[]":
      base = Joi.array().items(Joi.string());
      break;
    case "number":
      base = Joi.number();
      break;
    case "number[]":
      base = Joi.array().items(Joi.number());
      break;
    case "boolean":
      base = Joi.boolean();
      break;
    default:
      throw new Error(`Unsupported field type: ${field.type}`);
  }

  if (field.options && Array.isArray(field.options)) {
    const validValues = extractOptionValues(field.options);

    if (field.type === "string") {
      base = base.valid(...validValues).messages({
        "any.only": `${field.name} must be one of: ${validValues.join(", ")}`,
      });
    } else if (field.type === "string[]") {
      base = Joi.array().items(
        Joi.string()
          .valid(...validValues)
          .messages({
            "any.only": `Each ${field.name} must be one of: ${validValues.join(
              ", "
            )}`,
          })
      );
    }
  }

  return field.required ? base.required() : base.optional();
}

export function buildJoiSchemaFromTemplate(template) {
  const schemaShape = {};

  for (const field of template.fields) {
    schemaShape[field.name] = mapFieldToJoi(field);
  }

  return Joi.object(schemaShape);
}

export function validateAdvancedInfo(
  responses,
  businessTemplate,
  technicalTemplate = null
) {
  const businessFields = {};
  const technicalFields = {};

  if (responses.businessValue) {
    businessTemplate.fields.forEach((field) => {
      if (responses.businessValue[field.name] !== undefined) {
        businessFields[field.name] = responses.businessValue[field.name];
      }
    });
  }

  if (technicalTemplate && responses.technicalValue) {
    technicalTemplate.fields.forEach((field) => {
      if (responses.technicalValue[field.name] !== undefined) {
        technicalFields[field.name] = responses.technicalValue[field.name];
      }
    });
  }

  const businessSchema = buildJoiSchemaFromTemplate(businessTemplate);
  const { error: businessError, value: businessValue } =
    businessSchema.validate(businessFields, { abortEarly: false });

  if (businessError) {
    const details = businessError.details.map((d) => `Business: ${d.message}`);
    throw new Error(`Business validation failed: ${details.join(", ")}`);
  }

  let technicalValue = {};
  if (technicalTemplate && Object.keys(technicalFields).length > 0) {
    const technicalSchema = buildJoiSchemaFromTemplate(technicalTemplate);
    const { error: technicalError, value: techValue } =
      technicalSchema.validate(technicalFields, { abortEarly: false });

    if (technicalError) {
      const details = technicalError.details.map(
        (d) => `Technical: ${d.message}`
      );
      throw new Error(`Technical validation failed: ${details.join(", ")}`);
    }
    technicalValue = techValue;
  }

  return { businessValue, technicalValue };
}
