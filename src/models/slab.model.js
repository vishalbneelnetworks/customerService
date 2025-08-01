import mongoose, { Schema } from "mongoose";

const slabSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  vector: {
    type: Number,
    required: true,
  },
});

slabSchema.index({ name: 1, vector: 1 }, { unique: true });

// slabSchema.pre("save", async function (next) {
//   this.vector = Math.floor(Math.random() * 100);
//   next();
// });

slabSchema.options.toJSON = {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

const Slab = mongoose.model("Slab", slabSchema);

export default Slab;
