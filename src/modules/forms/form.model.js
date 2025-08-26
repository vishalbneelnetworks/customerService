import mongoose, { Schema } from "mongoose";
import { FORM_STATUSES, INDUSTRY_TYPES } from "../../constant.js";

const countrySchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { _id: false }
);

const serviceSchema = new Schema(
  {
    name: { type: String, required: true },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "SubService",
      required: true,
    },
  },
  { _id: false }
);

const formSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    industryType: {
      type: String,
      enum: INDUSTRY_TYPES,
      required: true,
    },
    selectedServices: {
      type: [serviceSchema],
      required: true,
      default: [],
    },
    projectGoal: {
      type: String,
      required: false,
      default: "",
    },
    reference: {
      type: String,
      required: false,
      default: "",
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    preferredCountry: {
      type: [countrySchema],
      required: true,
      default: [],
    },
    status: {
      type: String,
      enum: FORM_STATUSES,
      default: "draft",
      required: true,
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

formSchema.index({ selectedServices: 1 });
formSchema.index({ industryType: 1 });
formSchema.index({ preferredCountry: 1 });
formSchema.index({ status: 1, createdAt: -1 });

formSchema.options.toJSON = {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
};

export const RequirementForm = mongoose.model("RequirementForm", formSchema);
