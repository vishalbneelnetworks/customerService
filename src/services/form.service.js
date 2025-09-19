import { Form } from "../models/index.js";
import { ApiError } from "../utils/index.js";
import {
  publishFormGenerateLead,
  publishFormNotifyCustomer,
} from "../events/publisher.js";

const submitForm = async (formData) => {
  const { source } = formData;
  try {
    const form = await Form.create(formData);
    if (!form) {
      throw new ApiError(500, "Failed to submit form");
    }

    if (source === "customer") {
      await publishFormGenerateLead(form);
    }

    if (source === "admin") {
      await publishFormNotifyCustomer(form);
    }

    return form;
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to process form submission"
    );
  }
};

const getFormById = async (id) => {
  try {
    const form = await Form.findById(id);
    return form;
  } catch (error) {
    throw new ApiError(500, "Failed to get form", error);
  }
};

const getFormsByCustomerId = async (customerId) => {
  try {
    const forms = await Form.find({ customerId });
    return forms;
  } catch (error) {
    throw new ApiError(500, "Failed to get forms", error);
  }
};

const getAllForms = async () => {
  try {
    const forms = await Form.find();
    return forms;
  } catch (error) {
    throw new ApiError(500, "Failed to get all forms", error);
  }
};

const deleteFormById = async (id) => {
  try {
    const form = await Form.findByIdAndDelete(id);
    return form;
  } catch (error) {
    throw new ApiError(500, "Failed to delete form", error);
  }
};

export default {
  submitForm,
  getFormById,
  getFormsByCustomerId,
  getAllForms,
  deleteFormById,
};
