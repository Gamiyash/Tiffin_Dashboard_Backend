const mongoose = require("mongoose");

const flexiblePlanSchema = new mongoose.Schema({
  type: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  flexiDates: [Date],
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  total: { type: String, required: true },
  status: { type: String, required: true },
  time: { type: Date, required: true },
  specialInstructions: { type: String },
  plan: { type: String, required: true },
  distance: { type: String, required: true },
  mealType: { type: String, required: true },
  quantity: { type: Number, required: true },
  avatar: { type: String },
  flexiblePlan: flexiblePlanSchema,
  subStatus: [
    {
      date: { type: Date },
      status: { type: String, enum: ["Pending", "Delivered"], default: "Pending" },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
