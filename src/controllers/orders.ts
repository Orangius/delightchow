import { db } from "@/db/db.js";
import { foods, order_items, orders, users } from "@/db/schema.js";
import { Request, Response, Router } from "express";
import { eq } from "drizzle-orm";
import { validationResult } from "express-validator";

export async function getAllOrders(request: Request, response: Response) {
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
  } catch (error) {
    console.log(error);
    return response.status(500).send({ msg: "An error occured" });
  }
}

export async function getOrderbyId(request: Request, response: Response) {
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
  } catch (error) {
    console.log(error);
    return response.status(500).send({ msg: "An error occured" });
  }
}

export async function patchUpdateOrders(request: Request, response: Response) {
  const result = validationResult(request);
  const orderId = request.params.id;
  const { body } = request;
  let orderStatus = body.status;
  orderStatus = (orderStatus as string).toLowerCase();
  console.log(body.status);
  if (!result.isEmpty())
    return response.status(400).send({ error: result.array() });

  try {
    const patchedOrder = await db
      .update(orders)
      .set({
        status: orderStatus,
      })
      .where(eq(orders.order_id, orderId))
      .returning({ order_id: orders.order_id });
    //console.log(patchedOrder);
    return response.status(200).send(patchedOrder);
  } catch (error) {
    console.log(error);
    return response.status(500).send({ msg: "An error occured" });
  }
}

export async function placeOrder(request: Request, response: Response) {
  // ............required..............................
  //get the user id, and the total amount
  // order_id, food_id, quantity, amount

  //get the id of the user who placed the order from request.user
  // for each meal ordered, fetch the meal price from the database, it will be used to ////calculate the total amont later

  const result = validationResult(request);

  const { body } = request;
  const order_items_from_client = body;
  console.log(order_items_from_client);

  if (!result.isEmpty())
    return response.status(400).send({ error: result.array() });

  interface OrderItem {
    food_id: number;
    food_quantity: number;
    food_price: number;
  }

  async function getFoodPrice(food_id: number) {
    try {
      const getFoodPrice = await db
        .select({
          price: foods.price,
        })
        .from(foods)
        .where(eq(foods.food_id, food_id));
      if (!getFoodPrice[0].price)
        return response.status(404).send({ message: "food not found" });
      return getFoodPrice[0].price;
    } catch (error) {
      return response.status(500).send({ message: "An error occured" });
    }
  }

  let order: Partial<OrderItem> = {};
  let orderArray = [];
  let orderTotalAmount = 0;

  // get the prices of the order from the database to make sure the client sisnt modify it
  // here is also where the total price of the order is calculated as the orderTotalAmount
  for (let item = 0; item < order_items_from_client.length; item++) {
    const foodPrice = await getFoodPrice(order_items_from_client[item].food_id);
    orderTotalAmount +=
      (foodPrice as number) * order_items_from_client[item].food_quantity;
    order = { ...order_items_from_client[item], food_price: foodPrice };
    orderArray.push(order);
  }

  console.log("Order: ", orderArray);
  console.log("Total: ", orderTotalAmount);
  // add these items to the database

  // this is the adding of order to the order database and then also to the joining table
  // transaction is supposed to be used here since i am doing two writes to the db
  //but this is fine for now
  try {
    const OrderId = await db
      .insert(orders)
      .values({
        user_id: request.user?.user_id,
        total_amount: orderTotalAmount,
      })
      .returning({ InsertedOrderId: orders.order_id });

    for (let item = 0; item < orderArray.length; item++) {
      const InsertIntoOrderItems = await db.insert(order_items).values({
        order_id: OrderId[0].InsertedOrderId as string,
        food_id: orderArray[item].food_id as number,
        quantity: orderArray[item].food_quantity as number,
        amount: orderArray[item].food_price as number,
      });
    }
    return response.status(201).send({ message: OrderId });
  } catch (error) {
    return response.status(500).send({ message: "An error occured" });
  }
}
