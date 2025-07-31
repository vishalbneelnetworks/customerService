import mongoose, { Schema } from "mongoose";
import {
  FORM_STATUSES,
  FORM_TYPES,
  INQUIRY_TYPES,
  TIMELINE_TYPES,
  VENDOR_TIERS,
  INDUSTRY_TYPES,
} from "../constant.js";

const formSchema = new Schema(
  {
    formType: {
      type: String,
      enum: FORM_TYPES,
      required: true,
    },
    industryType: {
      type: String,
      enum: INDUSTRY_TYPES,
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

    description: { type: String, required: false },

    vendorTier: {
      type: String,
      enum: VENDOR_TIERS,
      required: true,
    },

    preferredTimeline: {
      type: String,
      enum: TIMELINE_TYPES,
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
        },
        { _id: false }
      ),
    },
    advancedInfo: {
      type: new Schema(
        {
          businessTemplateId: {
            type: Schema.Types.ObjectId,
            ref: "Template",
            required: true,
          },
          technicalTemplateId: {
            type: Schema.Types.ObjectId,
            ref: "Template",
            required: false,
          },

          responses: {
            type: Schema.Types.Mixed,
            required: false,
          },
        },
        { _id: false }
      ),
      required: false,
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
