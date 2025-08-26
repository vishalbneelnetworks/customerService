import mongoose, { Schema } from "mongoose";

export const serviceSchema = new Schema({
  name: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
});

serviceSchema.index({ name: 1 });

serviceSchema.options.toJSON = {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
};

export const Service = mongoose.model("Service", serviceSchema);

export const subServiceSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  name: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
});

subServiceSchema.index({ serviceId: 1, name: 1 });

subServiceSchema.options.toJSON = {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
};

export const SubService = mongoose.model("SubService", subServiceSchema);
