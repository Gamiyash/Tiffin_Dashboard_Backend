const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const moment = require("moment");

function getRandomDate(start, end) {
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

// // Helper function to generate daily sub-statuses based on plan
const initializeSubStatus = (order) => {
  const startDate = moment(order.time);  // Start date from the order time
  const days = parseInt(order.plan, 10) || 0;  // Get the plan duration in days
  const subStatus = [];

  for (let i = 0; i < days; i++) {
    const date = moment(startDate).add(i, "days").format("YYYY-MM-DD");  // Add days to start date
    subStatus.push({ date, status: "Pending" });  // Initialize all subStatus as "Pending"
  }

  return subStatus;
};

const initialRecentActivity = [
  {
      id: "#1423",
      customer: "John Doe",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, Anytown, AN 12345",
      total: "$450",
      status: "Plan Completed",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Leave the package at the doorstep.",
      plan: "7",
      distance: "4 KM",
      mealType: "Basic",
      quantity: 1,
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      flexiblePlan: {
          type: "date-range",
          startDate: new Date(2024, 0, 2),
          endDate: new Date(2024, 0, 10),
      },
      subStatus: [],
  },
  {
      id: "#1422",
      customer: "Jane Smith",
      phone: "+1 (555) 987-6543",
      address: "456 Maple Ave, Somecity, SC 54321",
      total: "$1200",
      status: "Processing",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Ring the doorbell upon arrival.",
      plan: "7",
      distance: "19 KM",
      mealType: "Premium",
      quantity: 2,
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      flexiblePlan: {
          type: "flexi-dates",
          flexiDates: [
              new Date(2024, 0, 3),
              new Date(2024, 0, 5),
              new Date(2024, 0, 8),
          ],
      },
      subStatus: [],
  },
  {
      id: "#1421",
      customer: "Ravi Kumar",
      phone: "+91 98765 43210",
      address: "789 Elm St, New Delhi, DL 110001",
      total: "$800",
      status: "Plan Completed",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Do not include onions.",
      plan: "7",
      distance: "12 KM",
      mealType: "Basic",
      quantity: 3,
      avatar: "https://randomuser.me/api/portraits/men/15.jpg",
      flexiblePlan: {
          type: "date-range",
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 31),
      },
      subStatus: [],
  },
  {
      id: "#1420",
      customer: "Ayesha Khan",
      phone: "+91 99876 54321",
      address: "123 Cherry Lane, Mumbai, MH 400001",
      total: "$650",
      status: "Rejected",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Deliver between 6-7 PM.",
      plan: "7",
      distance: "58 KM",
      mealType: "Vegetarian",
      quantity: 1,
      avatar: "https://randomuser.me/api/portraits/women/20.jpg",
      flexiblePlan: {
          type: "flexi-dates",
          flexiDates: [new Date(2024, 0, 4), new Date(2024, 0, 9)],
      },
      subStatus: [],
  },
  {
      id: "#1424",
      customer: "Mohit Sharma",
      phone: "+91 98700 12345",
      address: "101 Palm Street, Jaipur, RJ 302001",
      total: "$1000",
      status: "New Order",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Extra spicy food requested.",
      plan: "7",
      distance: "5 KM",
      mealType: "Deluxe",
      quantity: 2,
      avatar: "https://randomuser.me/api/portraits/men/25.jpg",
      flexiblePlan: {
          type: "date-range",
          startDate: new Date(2024, 0, 5),
          endDate: new Date(2024, 0, 15),
      },
      subStatus: [],
  },
  {
      id: "#1425",
      customer: "Emily Davis",
      phone: "+1 (555) 456-7890",
      address: "222 Broadway, New York, NY 10007",
      total: "$750",
      status: "New Order",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Add extra cutlery.",
      plan: "7",
      distance: "20 KM",
      mealType: "Non-Vegetarian",
      quantity: 2,
      avatar: "https://randomuser.me/api/portraits/women/16.jpg",
      flexiblePlan: {
          type: "flexi-dates",
          flexiDates: [new Date(2024, 0, 6), new Date(2024, 0, 10)],
      },
      subStatus: [],
  },
  {
      id: "#1426",
      customer: "Sanjay Mehta",
      phone: "+91 87654 32109",
      address: "88 MG Road, Pune, MH 411001",
      total: "$1400",
      status: "Plan Completed",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Deliver to the office reception.",
      plan: "7",
      distance: "13 KM",
      mealType: "Deluxe",
      quantity: 4,
      avatar: "https://randomuser.me/api/portraits/men/30.jpg",
      flexiblePlan: {
          type: "date-range",
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 0, 31),
      },
      subStatus: [],
  },
  {
      id: "#1427",
      customer: "Priya Nair",
      phone: "+91 98987 65432",
      address: "202 Greenfields, Kochi, KL 682001",
      total: "$550",
      status: "New Order",
      time: getRandomDate(new Date(2025, 0, 22), new Date()),
      specialInstructions: "Do not include garlic.",
      plan: "7",
      distance: "17 KM",
      mealType: "Vegetarian",
      quantity: 1,
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      flexiblePlan: {
          type: "date-range",
          startDate: new Date(2024, 0, 10),
          endDate: new Date(2024, 0, 15),
      },
      subStatus:[],
  },
];

const updatedActivity = initialRecentActivity.map(order => {
  return {
    ...order,
    subStatus: initializeSubStatus(order),  // Generate subStatus for each order
  };
});
// Route to save orders
router.post("/saveOrders", async (req, res) => {
  try {
    // const orders = req.body;
    const savedOrders = await Order.insertMany(updatedActivity, { ordered: true });
    res.status(201).json({ message: "Orders saved successfully", savedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save orders" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    // const orders = req.body;
    const deleteOrders = await Order.deleteMany();
    res.status(201).json({ message: "Orders delete successfully", deleteOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save orders" });
  }
});

// Route to fetch all orders
router.get("/getOrders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;