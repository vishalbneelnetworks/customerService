import mongoose, { Schema } from "mongoose";

const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  slabId: {
    type: Schema.Types.ObjectId,
    ref: "Slab",
    required: true,
  },
  synonyms: {
    type: [String],
    required: true,
  },
});

tagSchema.index({ name: 1, slabId: 1 }, { unique: true });

tagSchema.pre("save", async function (next) {
  this.synonyms = this.synonyms.map((synonym) => synonym.toLowerCase().trim());
  next();
});

tagSchema.options.toJSON = {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const Tag = mongoose.model("Tag", tagSchema);
export default Tag;
