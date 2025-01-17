const express = require("express");
const mongoose = require("mongoose");
const Tiffin = require("../models/Tiffin");

const router = express.Router();

router.post("/add-plan", async (req, res) => {
  const { label } = req.body;

  if (!label) return res.status(400).json({ message: "Plan label is required." });

  try {
    const tiffin = await Tiffin.findOne();

    if (!tiffin) {
      const newTiffin = new Tiffin({ menu: { plans: [{ label }] } });
      await newTiffin.save();
      return res.status(201).json({ message: "Plan added successfully.", newTiffin });
    }

    tiffin.menu.plans.push({ label });
    await tiffin.save();
    res.status(201).json({ message: "Plan added successfully.", tiffin });
  } catch (error) {
    console.error("Error adding plan:", error); // Debugging
    res.status(500).json({ message: "Error adding plan.", error: error.message });
  }
});

router.put("/edit-meal-plan/:planId", async (req, res) => {
  const { planId } = req.params;
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ message: "Plan label is required." });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    const plan = tiffin.menu.plans.find((p) => p._id.toString() === planId);
    if (!plan) return res.status(404).json({ message: "Plan not found." });

    // Update the plan label
    plan.label = label;

    await tiffin.save();
    res.status(200).json({ message: "Meal plan updated successfully.", tiffin });
  } catch (error) {
    res.status(500).json({ message: "Error updating meal plan.", error });
  }
});

// Add a new meal type
router.post("/add-meal-type", async (req, res) => {
  const { label, description, prices } = req.body;

  if (!label || !description || !prices) {
    return res.status(400).json({ message: "Meal type details are incomplete." });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    tiffin.menu.mealTypes.push({
      mealTypeId: new mongoose.Types.ObjectId(),
      label,
      description,
      prices,
    });
    await tiffin.save();
    res.status(201).json({ message: "Meal type added successfully.", tiffin});
  } catch (error) {
    res.status(500).json({ message: "Error adding meal type.", error });
  }
});

router.post("/manage_mealdays&Flexidates", async (req, res) => {
  const { serviceDays, isFlexibleDates } = req.body;
  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    // tiffin.menu.serviceDays = serviceDays || tiffin.menu.serviceDays;
    tiffin.menu.serviceDays = Array.isArray(serviceDays) ? serviceDays : tiffin.menu.serviceDays;
    tiffin.menu.isFlexibleDates = isFlexibleDates !== undefined ? isFlexibleDates :tiffin.menu.isFlexibleDates;
    await tiffin.save();
    res.status(201).json({ message: "mealdays&Flexidates added successfully.", tiffin });
  } catch (error) {
    res.status(500).json({ message: "Error adding mealdays&Flexidates", error });
  }
});


// Apply meal plans route
router.post("/apply-meal-plans", async (req, res) => {
  const { mealTypeId, applyTo, selectedPlans } = req.body;
  
  console.log("Received data:", { mealTypeId, applyTo, selectedPlans }); // Debug log

  if (!mealTypeId || !applyTo) {
    return res.status(400).json({ message: "Meal type ID and apply option are required." });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    const mealType = tiffin.menu.mealTypes.find(
      (type) => type.mealTypeId.toString() === mealTypeId
    );
    
    if (!mealType) {
      console.log("Available meal types:", tiffin.menu.mealTypes.map(t => t.mealTypeId)); // Debug log
      return res.status(404).json({ message: "Meal type not found." });
    }

    // Handle plan assignment
    if (applyTo === "all") {
      // Get all plan labels directly from the plans array
      mealType.specificPlans = tiffin.menu.plans.map(plan => plan.label);
    } else if (applyTo === "specific" && Array.isArray(selectedPlans)) {
      // Store the selected plan labels directly
      mealType.specificPlans = selectedPlans;
    }

    console.log("Updated meal type:", mealType); // Debug log

    await tiffin.save();
    res.status(200).json({ 
      message: "Meal plans applied successfully.", 
      tiffin,
      appliedPlans: mealType.specificPlans // Return for verification
    });

  } catch (error) {
    console.error("Error applying meal plans:", error);
    res.status(500).json({ message: "Error applying meal plans.", error });
  }
});

// Edit meal type and plans route
router.put("/edit-meal-type/:mealTypeId", async (req, res) => {
  const { mealTypeId } = req.params;
  const { label, description, prices, applyTo, selectedPlans } = req.body;

  console.log("Edit request received:", { 
    mealTypeId, 
    label, 
    description, 
    prices, 
    applyTo, 
    selectedPlans 
  });

  if (!mealTypeId || !label || !description) {
    return res.status(400).json({ 
      message: "Meal type ID, label, and description are required." 
    });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    // Find the meal type to edit
    const mealTypeIndex = tiffin.menu.mealTypes.findIndex(
      (type) => type.mealTypeId.toString() === mealTypeId
    );

    if (mealTypeIndex === -1) {
      console.log("Available meal types:", tiffin.menu.mealTypes.map(t => t.mealTypeId));
      return res.status(404).json({ message: "Meal type not found." });
    }

    // Update basic meal type information
    tiffin.menu.mealTypes[mealTypeIndex].label = label;
    tiffin.menu.mealTypes[mealTypeIndex].description = description;
    tiffin.menu.mealTypes[mealTypeIndex].prices = prices;

    // Update plan assignments
    if (applyTo === "all") {
      // Get all plan labels
      tiffin.menu.mealTypes[mealTypeIndex].specificPlans = 
        tiffin.menu.plans.map(plan => plan.label);
    } else if (applyTo === "specific" && Array.isArray(selectedPlans)) {
      // Update with selected plan labels
      tiffin.menu.mealTypes[mealTypeIndex].specificPlans = selectedPlans;
    }

    console.log("Updated meal type:", tiffin.menu.mealTypes[mealTypeIndex]);

    await tiffin.save();

    res.status(200).json({
      message: "Meal type updated successfully.",
      tiffin,
      updatedMealType: tiffin.menu.mealTypes[mealTypeIndex],
      appliedPlans: tiffin.menu.mealTypes[mealTypeIndex].specificPlans
    });

  } catch (error) {
    console.error("Error updating meal type:", error);
    res.status(500).json({ message: "Error updating meal type.", error });
  }
});

// Fetch all menu data
router.get("/menu", async (req, res) => {
  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    res.status(200).json(tiffin.menu);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu data.", error });
  }
});

// Remove a plan
router.delete("/remove-plan/:label", async (req, res) => {
  const { label } = req.params;

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    tiffin.menu.plans = tiffin.menu.plans.filter((plan) => plan.label !== label);

    tiffin.menu.mealTypes.forEach((mealType) => {
      mealType.prices.delete(label);
    });

    await tiffin.save();
    res.status(200).json({ message: "Plan removed successfully.", tiffin });
  } catch (error) {
    res.status(500).json({ message: "Error removing plan.", error });
  }
});


//Instructions Part

// Route to add a new instruction
router.post('/add-instruction', async (req, res) => {
  const { title, details } = req.body;

  if (!title || !details) {
    return res.status(400).json({ message: "Title and details are required." });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    tiffin.menu.instructions.push({
      title,
      details,
    });
    await tiffin.save();
    res.status(201).json({ message: "Instruction added successfully.", tiffin });
  } catch (error) {
    res.status(500).json({ message: "Error adding instruction.", error });
  }
});

// Route to edit an instruction
router.put('/edit-instruction/:id', async (req, res) => {
  const { id } = req.params;
  const { title, details } = req.body;

  if (!title || !details) {
    return res.status(400).json({ message: "Title and details are required." });
  }

  try {
    const tiffin = await Tiffin.findOne();
    if (!tiffin) return res.status(404).json({ message: "Tiffin not found." });

    const instruction = tiffin.menu.instructions.id(id);
    if (!instruction) return res.status(404).json({ message: "Instruction not found." });

    instruction.title = title;
    instruction.details = details;

    await tiffin.save();
    res.status(200).json({ message: "Instruction updated successfully.", tiffin });
  } catch (error) {
    res.status(500).json({ message: "Error updating instruction.", error });
  }
});

module.exports = router;
