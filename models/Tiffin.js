const mongoose = require("mongoose");

// Plan schema
const planSchema = new mongoose.Schema({
  label: { type: String, required: true },
  // PlanId: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId },
});

// Meal type schema
const mealTypeSchema = new mongoose.Schema({
  mealTypeId: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId },
  label: { type: String, required: true },
  description: { type: String, required: true },
  prices: { type: Map, of: Number, default: {} },
  specificPlans: { type: [String], default: [] },
});

const instructionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },
});

// Menu schema
const menuSchema = new mongoose.Schema({
  plans: [planSchema],
  mealTypes: [mealTypeSchema],
  instructions: [instructionSchema],
  // serviceDays: { type: String, default: "" },
  serviceDays: { type: [String], default: "" },
  isFlexibleDates: { type: Boolean, default: false },
});

// Combined kitchen schema
const kitchenSchema = new mongoose.Schema({
  kitchenName: {
    type: String,
    // required: true,
    unique: true,
  },
  category: {
    type: [
      {
        type: String,
        enum: ["veg", "non-veg", "both"],
      },
    ],
  },
  images: {
    type: [String], // Updated to support multiple images
  },
  specialMealDay: {
    type: String,
  },
  location: {
    type: String,
  },
  reviews: {
    type: String,
  },
  freeDelivery: {
    type: String,
  },
  deliveryDetails: {
    type: String,
  },
  deliveryCity: {
    type: String,
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  catering: {
    type: Boolean,
  },
  houseParty: {
    type: Boolean,
  },
  specialEvents: {
    type: Boolean,
  },
  kitchenOwner: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kitchenOwner",
    },
  ],
  menu: menuSchema,
});

const Tiffin = mongoose.model("Tiffin", kitchenSchema);
module.exports = Tiffin;
