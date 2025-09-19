import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      lowercase: true,
      trim: true,
      required: false,
    },
    addons: {
      type: [String],
      required: false,
      default: [],
      validate: {
        validator: function (v) {
          const names = v.map((addon) => addon);
          return names.length === new Set(names).size;
        },
        message:
          "Duplicate addon names are not allowed within the same service",
      },
    },
  },
  { timestamps: true, collection: "services" }
);

serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ name: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;
