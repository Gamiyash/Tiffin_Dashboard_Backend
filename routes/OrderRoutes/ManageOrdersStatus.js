const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const moment = require("moment")


// This will be used to update the substatus for a particular day in the order.
// const updateSubStatusForOrder = async (orderId, date, newStatus) => {
//     const order = await Order.findById(orderId);
//     if (!order) {
//         throw new Error("Order not found");
//     }

//     const subStatusIndex = order.subStatus.findIndex((status) =>
//         moment(status.date).isSame(date, "day")
//     );

//     if (subStatusIndex !== -1) {
//         order.subStatus[subStatusIndex].status = newStatus;
//     } else {
//         // If no entry for that date, we add a new substatus entry
//         order.subStatus.push({ date, status: newStatus });
//     }

//     await order.save();
//     return order;
// };


// const checkAndUpdateOrderStatus = async () => {
//     const orders = await Order.find({ status: "Processing" });

//     const today = moment().startOf("day");

//     for (const order of orders) {
//         let subStatusChanged = false;

//         // Update substatus for today
//         if (order.flexiblePlan.type === "normal") {
//             const startDate = moment(order.time);
//             const endDate = moment(order.time).add(parseInt(order.flexiblePlan.plan, 10), "days");

//             if (today.isBetween(startDate, endDate, "day", "[]")) {
//                 const subStatus = order.subStatus.find((entry) =>
//                     moment(entry.date).isSame(today, "day")
//                 );

//                 if (!subStatus) {
//                     order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
//                     subStatusChanged = true;
//                 }
//             }
//         } else if (order.flexiblePlan.type === "date-range") {
//             const startDate = moment(order.flexiblePlan.startDate);
//             const endDate = moment(order.flexiblePlan.endDate);

//             if (today.isBetween(startDate, endDate, "day", "[]")) {
//                 const subStatus = order.subStatus.find((entry) =>
//                     moment(entry.date).isSame(today, "day")
//                 );

//                 if (!subStatus) {
//                     order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
//                     subStatusChanged = true;
//                 }
//             }
//         } else if (order.flexiblePlan.type === "flexi-dates") {
//             const isTodayInFlexiDates = order.flexiblePlan.flexiDates.some((date) =>
//                 moment(date).isSame(today, "day")
//             );

//             if (isTodayInFlexiDates) {
//                 const subStatus = order.subStatus.find((entry) =>
//                     moment(entry.date).isSame(today, "day")
//                 );

//                 if (!subStatus) {
//                     order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
//                     subStatusChanged = true;
//                 }
//             }
//         }

//         if (subStatusChanged) {
//             await order.save();
//         }
//     }
// };

// // Run daily at midnight
// setInterval(checkAndUpdateOrderStatus, 24 * 60 * 60 * 1000);

const checkAndUpdateOrderStatus = async () => {
    const orders = await Order.find({ status: "Processing" });

    const today = moment().startOf("day").local(); // Use local timezone

    for (const order of orders) {
        let subStatusChanged = false;

        // Update substatus for today
        if (order.flexiblePlan.type === "normal") {
            const startDate = moment(order.time).local(); // Convert order.time to local
            const endDate = moment(order.time).local().add(parseInt(order.flexiblePlan.plan, 10), "days");

            if (today.isBetween(startDate, endDate, "day", "[]")) {
                const subStatus = order.subStatus.find((entry) =>
                    moment(entry.date).local().isSame(today, "day") // Ensure comparison in local time
                );

                if (!subStatus) {
                    order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
                    subStatusChanged = true;
                }
            }
        } else if (order.flexiblePlan.type === "date-range") {
            const startDate = moment(order.flexiblePlan.startDate).local(); // Convert to local
            const endDate = moment(order.flexiblePlan.endDate).local();

            if (today.isBetween(startDate, endDate, "day", "[]")) {
                const subStatus = order.subStatus.find((entry) =>
                    moment(entry.date).local().isSame(today, "day") // Ensure comparison in local time
                );

                if (!subStatus) {
                    order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
                    subStatusChanged = true;
                }
            }
        } else if (order.flexiblePlan.type === "flexi-dates") {
            const isTodayInFlexiDates = order.flexiblePlan.flexiDates.some((date) =>
                moment(date).local().isSame(today, "day") // Ensure comparison in local time
            );

            if (isTodayInFlexiDates) {
                const subStatus = order.subStatus.find((entry) =>
                    moment(entry.date).local().isSame(today, "day") // Ensure comparison in local time
                );

                if (!subStatus) {
                    order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
                    subStatusChanged = true;
                }
            }
        }

        if (subStatusChanged) {
            await order.save();
        }
    }
};

// Run daily at midnight
setInterval(checkAndUpdateOrderStatus, 24 * 60 * 60 * 1000);

// const checkAndUpdateOrderStatus = async () => {
//     const orders = await Order.find({ status: "Processing" });

//     const today = moment().startOf("day").local(); // Use local timezone

//     for (const order of orders) {
//         let subStatusChanged = false;
//         let statusUpdated = false;

//         // Variables for start and end date
//         let startDate, endDate;

//         // Determine the start and end dates based on the plan type
//         if (order.flexiblePlan.type === "normal") {
//             startDate = moment(order.time).local(); // Convert order.time to local
//             endDate = moment(order.time).local().add(parseInt(order.flexiblePlan.plan, 10), "days");
//         } else if (order.flexiblePlan.type === "date-range") {
//             startDate = moment(order.flexiblePlan.startDate).local(); // Convert to local
//             endDate = moment(order.flexiblePlan.endDate).local();
//         } else if (order.flexiblePlan.type === "flexi-dates") {
//             // For "flexi-dates" plan type, use the provided flexiDates array
//             startDate = moment(order.flexiblePlan.startDate).local();
//             endDate = moment(order.flexiblePlan.endDate).local();
//         }

//         // Check if today is beyond the plan's end date and apply status changes accordingly
//         if (today.isAfter(endDate)) {
//             if (order.status !== "Accepted" && order.status !== "Plan Completed") {
//                 // If plan duration is over and not accepted, mark order as "Rejected"
//                 order.status = "Rejected";
//                 statusUpdated = true;
//             } else if (order.status === "Processing") {
//                 // If accepted and still in processing, update status to "Plan Completed"
//                 order.status = "Plan Completed";
//                 statusUpdated = true;
//             }
//         }

//         // For each plan type, update substatus
//         if (order.flexiblePlan.type === "normal" || order.flexiblePlan.type === "date-range" || order.flexiblePlan.type === "flexi-dates") {
//             // Check if we need to update the substatus for today
//             const subStatus = order.subStatus.find((entry) =>
//                 moment(entry.date).local().isSame(today, "day") // Ensure comparison in local time
//             );

//             // If substatus for today is not found, add it
//             if (!subStatus) {
//                 order.subStatus.push({ date: today.toDate(), status: "Not Delivered" });
//                 subStatusChanged = true;
//             }
//         }

//         // Save changes if there are updates
//         if (subStatusChanged || statusUpdated) {
//             await order.save(); // Save the changes to the order
//         }
//     }
// };

// // checkAndUpdateOrderStatus();

// // Run daily at midnight
// // setInterval(checkAndUpdateOrderStatus, 24 * 60 * 60 * 1000); // Check every day
// setInterval(checkAndUpdateOrderStatus, 1000);


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

    router.post("/orders/bulk-action", async (req, res) => {
        const { action, orderIds } = req.body;
    
        try {
            if (action === "Delivered All") {
                const today = moment().local().startOf("day").toDate();
    
                // Find all orders in "Processing" and check if today's subStatus is matched
                const orders = await Order.find({ 
                    _id: { $in: orderIds },
                    status: "Processing",
                    subStatus: { $elemMatch: { date: { $gte: today }, status: { $ne: "Delivered" } } } // Ensure status for today exists and not already "Delivered"
                });
    
                for (const order of orders) {
                    const subStatusIndex = order.subStatus.findIndex((entry) =>
                        moment(entry.date).local().isSame(today, "day") // Ensure comparison in local time
                    );
    
                    if (subStatusIndex !== -1) {
                        // Update today's subStatus to "Delivered"
                        order.subStatus[subStatusIndex].status = "Delivered";
                    } else {
                        // Add today's subStatus if not present
                        order.subStatus.push({ date: today, status: "Delivered" });
                    }
    
                    await order.save();
                }
    
                // Emit updated orders to connected clients
                const updatedOrders = await Order.find({ _id: { $in: orderIds } });
                io.emit("bulkOrderStatusUpdated", {
                    action,
                    orders: updatedOrders,
                });
    
                return res.status(200).json({
                    message: "Bulk action completed successfully",
                    updatedCount: updatedOrders.length,
                });
            } else {
                // Handle "All Accept" and "All Reject"
                const validStatuses = ["New Order"]; // Only target New Orders
                const newStatus = action === "All Accept" ? "Processing" : "Rejected";
    
                const ordersToUpdate = await Order.find({
                    _id: { $in: orderIds },
                    status: { $in: validStatuses },
                    subStatus: { $elemMatch: { date: { $gte: moment().local().startOf('day').toDate() }, status: { $ne: "Delivered" } } } // Ensure today's status is either not delivered or absent
                });
    
                for (const order of ordersToUpdate) {
                    order.status = newStatus;
                    await order.save();
                }
    
                // Fetch and emit updated orders
                const updatedOrders = await Order.find({ _id: { $in: orderIds } });
                io.emit("bulkOrderStatusUpdated", {
                    action,
                    orders: updatedOrders,
                });
    
                return res.status(200).json({
                    message: "Bulk action completed successfully",
                    updatedCount: updatedOrders.length,
                });
            }
        } catch (err) {
            console.error("Error performing bulk action:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    

    router.put("/order/:id/sub-status", async (req, res) => {
        const { id } = req.params;
        const { date, status } = req.body;

        try {
            const order = await Order.findById(id);
            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            const targetDate = moment(date).local().startOf("day");

            const subStatusIndex = order.subStatus.findIndex((entry) =>
                moment(entry.date).local().isSame(targetDate, "day")
            );

            if (subStatusIndex !== -1) {
                order.subStatus[subStatusIndex].status = status;
            } else {
                order.subStatus.push({ date: targetDate.toDate(), status });
            }

            await order.save();

            io.emit("subStatusUpdated", order);
            res.status(200).json(order);
        } catch (err) {
            console.error("Error updating sub-status:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });


    return router;
};