import mongoose, { Schema } from "mongoose";

const inquirySchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    resolvedBy: {
      type: String,
      default: null,
      required: false,
      comment: "The user who resolved the inquiry all the time will be admin",
    },
    rejectReason: {
      type: String,
      default: null,
      required: false,
      comment: "The reason for rejecting the inquiry",
    },
    resolvedAt: {
      type: Date,
      default: null,
      required: false,
      comment: "The date and time when the inquiry was resolved",
    },
    rejectedAt: {
      type: Date,
      default: null,
      required: false,
      comment: "The date and time when the inquiry was rejected",
    },
  },
  { timestamps: true, collection: "inquiries" }
);
