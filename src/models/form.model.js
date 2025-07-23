import mongoose, { Schema } from "mongoose";
import { FORM_STATUSES, FORM_TYPES, INQUIRY_TYPES } from "../constant.js";

const formSchema = new Schema(
  {
    formType: {
      type: String,
      enum: FORM_TYPES,
      required: true,
    },
    projectType: {
      type: String,
      lowercase: true,
      required: true,
    },
    subProjectType: {
      type: String,
      lowercase: true,
      required: true,
      default: "default",
    },
    description: { type: String, required: true },

    budgetRange: {
      type: String,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: FORM_STATUSES,
      default: "draft",
      required: true,
    },
    basicInfo: {
      type: new Schema(
        {
          inquiryType: {
            type: String,
            enum: INQUIRY_TYPES,
          },
          preferredTime: { type: String },
        },
        { _id: false }
      ),
    },
    advancedInfo: {
      type: Schema.Types.Mixed,
      required: false,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "RequirementTemplate",
      required: true,
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

formSchema.index({ projectType: 1, subProjectType: 1 });
formSchema.index({ projectType: 1 });
formSchema.index({ formType: 1 });
formSchema.index({ status: 1 });
formSchema.index({ status: 1, createdAt: -1 });
formSchema.index({ templateId: 1, status: 1 });

export const RequirementForm = mongoose.model("RequirementForm", formSchema);
