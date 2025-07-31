// src/models/template.model.js - Single unified model
import mongoose, { Schema } from "mongoose";
import { FIELD_TYPES, TEMPLATE_TYPES } from "../constant.js";

const fieldSchema = new Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: FIELD_TYPES, required: true },
    required: { type: Boolean, default: false },
    placeholder: { type: String },
    helpText: { type: String },
    options: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { _id: false }
);

const templateSchema = new Schema(
  {
    templateType: {
      type: String,
      enum: TEMPLATE_TYPES,
      required: true,
      index: true,
    },

    projectType: {
      type: String,
      lowercase: true,
      required: true,
      index: true,
    },

    subProjectType: {
      type: String,
      lowercase: true,
      required: function () {
        return this.templateType === "business";
      },
      default: "default",
      index: true,
    },

    version: { type: String, required: true, default: "v1" },
    fields: { type: [fieldSchema], required: true },
    createdBy: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

templateSchema.index({
  templateType: 1,
  projectType: 1,
  subProjectType: 1,
  isActive: 1,
});

export const Template = mongoose.model("Template", templateSchema);
