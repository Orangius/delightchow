import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  uuid,
  timestamp,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "super_admin"]);
export const users = pgTable("users", {
  user_id: serial("user_id").primaryKey(),
  surname: varchar("surname", { length: 256 }).notNull(),
  lastname: varchar("lastname", { length: 256 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  address: text("address"),
  role: roleEnum("role").default("user"),
});

export const foods = pgTable("foods", {
  food_id: serial("food_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  imageURL: text("imageURL").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 50 }),
});

export const orderStatusEnum = pgEnum("status", [
  "pending",
  "out for delivery",
  "delivered",
]);
export const orders = pgTable("orders", {
  order_id: uuid("order_id").primaryKey().defaultRandom(),
  user_id: integer("user_id").references(() => users.user_id),
  order_date: timestamp("order_date").defaultNow(),
  status: orderStatusEnum("status").default("pending"),
  total_amount: integer("total_amount").notNull(),
});

export const order_items = pgTable("order_items", {
  order_items_id: serial("order_items_id").primaryKey(),
  order_id: uuid("order_id").references(() => orders.order_id),
  food_id: integer("food_id").references(() => foods.food_id),
  quantity: integer("quantity").notNull(),
  amount: integer("amount").notNull(),
});

export const payment = pgTable("payment", {
  payment_id: uuid("payment_id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").references(() => orders.order_id),
  payment_method: varchar("payment_method").notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const session = pgTable("session", {
  sid: varchar("sid", { length: 50 }).primaryKey(),
  sess: json("sess"),
  expire: timestamp("expire", { precision: 6 }),
});
