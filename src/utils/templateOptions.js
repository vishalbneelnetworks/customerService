export const convertOptionsToValueLabel = (options) => {
  if (!Array.isArray(options)) return options;

  return options.map((option) => {
    if (
      typeof option === "object" &&
      option !== null &&
      option.value &&
      option.label
    ) {
      return {
        value: option.value,
        label: option.label,
      };
    }

    if (typeof option === "string") {
      return {
        value: generateValueFromLabel(option),
        label: option,
      };
    }

    return option;
  });
};

export const generateValueFromLabel = (label) => {
  if (!label || typeof label !== "string") return "";

  return label
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

export const extractOptionValues = (options) => {
  if (!Array.isArray(options)) return [];

  return options.map((option) => {
    if (typeof option === "string") {
      return generateValueFromLabel(option);
    }
    if (typeof option === "object" && option.value) {
      return option.value;
    }
    return option;
  });
};

export const getOptionLabel = (options, value) => {
  if (!Array.isArray(options)) return value;

  const option = options.find((opt) => {
    if (typeof opt === "string") {
      return generateValueFromLabel(opt) === value;
    }
    if (typeof opt === "object" && opt.value) {
      return opt.value === value;
    }
    return false;
  });

  if (typeof option === "string") return option;
  if (typeof option === "object" && option.label) return option.label;
  return value;
};
