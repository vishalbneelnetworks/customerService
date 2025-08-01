import mongoose, { Schema } from "mongoose";
import {
  FORM_STATUSES,
  FORM_TYPES,
  INQUIRY_TYPES,
  TIMELINE_TYPES,
  VENDOR_TIERS,
  INDUSTRY_TYPES,
} from "../constant.js";

const basicInfoSchema = new Schema(
  {
    inquiryType: {
      type: String,
      enum: INQUIRY_TYPES,
    },
  },
  { _id: false, required: false }
);

const advancedInfoSchema = new Schema(
  {
    projectGoal: {
      type: String,
      required: false,
      default: "",
    },
    designInspiration: {
      type: String,
      required: false,
      default: "",
    },
    projectConstraints: {
      type: String,
      required: false,
      default: "",
    },
  },
  { _id: false, required: false }
);

const formSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
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

    uploadedFiles: {
      type: Schema.Types.Mixed,
      required: false,
    },

    status: {
      type: String,
      enum: FORM_STATUSES,
      default: "draft",
      required: true,
    },
    basicInfo: basicInfoSchema,
    advancedInfo: advancedInfoSchema,
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

formSchema.options.toJSON = {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
};

export const RequirementForm = mongoose.model("RequirementForm", formSchema);
