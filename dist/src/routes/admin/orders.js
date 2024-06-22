import { db } from "../../db/db.js";
import { foods, order_items, orders, users } from "../../db/schema.js";
import { Router } from "express";
import { eq } from "drizzle-orm";
import { body, param, validationResult } from "express-validator";
const orderRoutes = Router();
orderRoutes.get("/orders", async (request, response) => {
    // go to the database and get all the orders in the database
    //and return all the orders there
    try {
        const returnedOrders = await db
            .select({
            order_id: orders.order_id,
            order_status: orders.status,
            order_date: orders.order_date,
        })
            .from(orders);
        if (returnedOrders.length === 0)
            return response.status(404).send({ msg: "No orders yet" });
        response.status(200).send(returnedOrders);
    }
    catch (error) {
        console.log(error);
        return response.status(500).send({ msg: "An error occured" });
    }
});
orderRoutes.get("/orders/:id", param("id").isUUID().withMessage("Invalid order id"), async (request, response) => {
    const result = validationResult(request);
    if (!result.isEmpty())
        return response.status(400).send({ error: result.array() });
    const orderId = request.params.id;
    try {
        const returnedOrder = await db
            .select({
            surname: users.surname,
            lastname: users.lastname,
            phone: users.phone,
            address: users.address,
            //.........order.........
            orderId: orders.order_id,
            date: orders.order_date,
            orderStatus: orders.status,
            //.........food........
            mealName: foods.name,
            mealDescription: foods.description,
            mealPrice: foods.price,
            mealId: foods.food_id,
            //........orderitems.......
            mealQuantity: order_items.quantity,
        })
            .from(orders)
            .innerJoin(users, eq(orders.user_id, users.user_id))
            .innerJoin(order_items, eq(orders.order_id, order_items.order_id))
            .innerJoin(foods, eq(order_items.food_id, foods.food_id))
            .where(eq(orders.order_id, orderId));
        if (returnedOrder.length === 0)
            return response.status(404).send({ msg: "Not found" });
        return response.status(200).send(returnedOrder);
    }
    catch (error) {
        console.log(error);
        return response.status(500).send({ msg: "An error occured" });
    }
});
orderRoutes.patch("/orders/:id", param("id").isUUID().withMessage("Invalid order id"), body("status").notEmpty().withMessage("Status cannot be empty").isString(), async (request, response) => {
    const result = validationResult(request);
    const orderId = request.params.id;
    const { body } = request;
    console.log(body.status);
    if (!result.isEmpty())
        return response.status(400).send({ error: result.array() });
    try {
        const patchedOrder = await db
            .update(orders)
            .set({
            status: body.status,
        })
            .where(eq(orders.order_id, orderId))
            .returning({ order_id: orders.order_id });
        //console.log(patchedOrder);
        return response.status(200).send(patchedOrder);
    }
    catch (error) {
        console.log(error);
        return response.status(500).send({ msg: "An error occured" });
    }
});
export default orderRoutes;
