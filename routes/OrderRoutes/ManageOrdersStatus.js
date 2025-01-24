const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const moment = require ("moment")


// This will be used to update the substatus for a particular day in the order.
const updateSubStatusForOrder = async (orderId, date, newStatus) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    const subStatusIndex = order.subStatus.findIndex((status) =>
        moment(status.date).isSame(date, "day")
    );

    if (subStatusIndex !== -1) {
        order.subStatus[subStatusIndex].status = newStatus;
    } else {
        // If no entry for that date, we add a new substatus entry
        order.subStatus.push({ date, status: newStatus });
    }

    await order.save();
    return order;
};

// Function to update the plan end date calculation
const checkAndUpdateOrderStatus = async () => {
    const orders = await Order.find({ status: "Processing" });

    for (const order of orders) {
        // Use order.time as the start time and the plan value (e.g., 2 or 3 days) as the duration
        const planEndDate = moment(order.time).add(order.plan, "days"); // Add plan days to order.time

        // If the plan has ended, update status to "Plan Completed"
        if (moment().isAfter(planEndDate, "day")) {
            order.status = "Plan Completed";
            await order.save();
        }

        // Check if the current day needs to be updated
        const today = moment().startOf("day"); // Current day at 00:00:00
        const subStatus = order.subStatus.find((sub) => moment(sub.date).isSame(today, "day"));

        if (!subStatus) {
            // If no substatus exists for today, mark it as pending
            order.subStatus.push({
                date: today,
                status: "Pending",
            });

            await order.save();
        }
    }
};

// Schedule this check to run at the end of every day (midnight)
setInterval(checkAndUpdateOrderStatus, 24 * 60 * 60 * 1000); // every 24 hours



module.exports = (io) => {
  // Route to update individual order status
  router.put("/order/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      io.emit("orderStatusUpdated", updatedOrder);

      res.status(200).json({ 
        message: "Order status updated successfully", 
        order: updatedOrder 
      });
    } catch (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Route for bulk order status actions
  router.post("/orders/bulk-action", async (req, res) => {
    const { action, orderIds } = req.body;

    try {
        let newStatus;
        switch (action) {
            case "All Accept":
                newStatus = "Processing";
                break;
            case "All Reject":
                newStatus = "Rejected";
                break;
            case "Delivered All":
                newStatus = "Plan Completed";
                break;
            default:
                return res.status(400).json({ message: "Invalid action" });
        }

        const result = await Order.updateMany(
            { _id: { $in: orderIds } },
            { $set: { status: newStatus } }
        );

        // Fetch and emit updated orders
        const updatedOrders = await Order.find({ _id: { $in: orderIds } });

        // Emit real-time bulk update to all connected clients
        io.emit("bulkOrderStatusUpdated", {
            action,
            orders: updatedOrders,
        });

        res.status(200).json({
            message: "Bulk action completed successfully",
            updatedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error("Error performing bulk action:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Update sub-status route in backend
router.put("/order/:id/sub-status", async (req, res) => {
    const { id } = req.params;
    const { date, status } = req.body;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update the sub-status for that date
        const updatedOrder = await updateSubStatusForOrder(id, date, status);

        io.emit("orderStatusUpdated", updatedOrder);

        res.status(200).json({
            message: "Sub-status updated successfully",
            order: updatedOrder,
        });
    } catch (err) {
        console.error("Error updating sub-status:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


  return router;
};