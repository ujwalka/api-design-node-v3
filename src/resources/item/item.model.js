import mongoose from 'mongoose'
// Creating Schema for Item, validation? [1]
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'complete', 'pastdue'],
      default: 'active'
    },
    notes: String,
    due: Date,
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    },
    list: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'list',
      required: true
    }
  },
  { timestamps: true }
)
// Compound ID.. need more reading

itemSchema.index({ list: 1, name: 1 }, { unique: true })
// Export Item Schema as a Model [2] >> utils/crud.js, creating crudcontrollers
export const Item = mongoose.model('item', itemSchema)
