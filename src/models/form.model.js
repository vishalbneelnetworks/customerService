import mongoose, { Schema } from "mongoose";

const serviceSelectionSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    selectedAddons: {
      type: [String],
      required: false,
      default: [],
    },
  },
  { _id: false }
);

const locationPreferenceSchema = new Schema(
  {
    countries: {
      type: [String],
      required: true,
      default: ["Any Country"],
      minlength: [1, "At least one country is required"],
    },
    cities: {
      type: [String],
      required: false,
    },
  },
  { _id: false }
);

const vendorPreferenceSchema = new Schema(
  {
    vendorType: {
      type: String,
      enum: ["freelancer", "company", "both"],
      required: true,
    },
    noOfVendors: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
      min: [1, "Number of vendors must be at least 1"],
      max: [3, "Number of vendors must be at most 3"],
    },
  },
  { _id: false }
);

const budgetPreferenceSchema = new Schema(
  {
    budget: {
      type: Number,
      required: true,
      min: [0, "Budget must be positive"],
    },
    budgetType: {
      type: String,
      enum: ["hourly", "fixed"],
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
    serviceSelection: {
      type: serviceSelectionSchema,
      required: true,
    },
    locationPreference: {
      type: locationPreferenceSchema,
      required: true,
    },
    vendorPreference: {
      type: vendorPreferenceSchema,
      required: true,
    },
    budgetPreference: {
      type: budgetPreferenceSchema,
      required: true,
    },
    estimatedTime: {
      type: String,
      enum: ["ASAP", "soon", "not urgent"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    source: {
      enum: ["admin", "customer"],
      default: "customer",
      type: String,
      required: true,
      comment: "The source of the form",
    },
    createdBy: {
      type: String,
      default: null,
      required: false,
      comment: "The user who created the form all the time will be admin",
    },
  },
  { timestamps: true, collection: "forms" }
);

formSchema.index({ createdAt: -1 });
formSchema.index({ customerId: 1, serviceSelection: 1 });
formSchema.index({ createdBy: 1 });
formSchema.index({ source: 1 });

const Form = mongoose.model("Form", formSchema);
export default Form;
