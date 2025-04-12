import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const serviceTypeEnum = pgEnum('service_type', ['workshop', 'consultation', 'mentorship', 'design', 'development', 'photography', 'videography', 'other']);
export const serviceStatusEnum = pgEnum('service_status', ['active', 'inactive']);
export const servicePricingEnum = pgEnum('service_pricing', ['free', 'paid']);

export const equipmentStatusEnum = pgEnum('equipment_status', ['available', 'borrowed', 'maintenance']);

export const requestStatusEnum = pgEnum('request_status', ['pending', 'accepted', 'rejected', 'completed']);

export const networkConnectionStatusEnum = pgEnum('connection_status', ['pending', 'connected', 'rejected']);

// Organizations (users)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  description: text("description"),
  email: text("email").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: serviceTypeEnum("type").notNull(),
  pricing: servicePricingEnum("pricing").notNull(),
  price: integer("price"),
  availability: text("availability").notNull(),
  capacity: text("capacity"),
  status: serviceStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Equipment
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: equipmentStatusEnum("status").default("available").notNull(),
  availableUntil: timestamp("available_until"),
  deposit: integer("deposit"),
  conditions: text("conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Service Requests
export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  requestorId: integer("requestor_id").references(() => organizations.id).notNull(),
  status: requestStatusEnum("status").default("pending").notNull(),
  message: text("message"),
  dateRequested: timestamp("date_requested").defaultNow().notNull(),
  dateNeeded: timestamp("date_needed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Equipment Requests
export const equipmentRequests = pgTable("equipment_requests", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
  requestorId: integer("requestor_id").references(() => organizations.id).notNull(),
  status: requestStatusEnum("status").default("pending").notNull(),
  message: text("message"),
  borrowFrom: timestamp("borrow_from").notNull(),
  borrowUntil: timestamp("borrow_until").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Network Connections
export const networkConnections = pgTable("network_connections", {
  id: serial("id").primaryKey(),
  requestorId: integer("requestor_id").references(() => organizations.id).notNull(),
  targetId: integer("target_id").references(() => organizations.id).notNull(),
  status: networkConnectionStatusEnum("status").default("pending").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Ensure connections are unique between two organizations
    uniqueConnection: uniqueIndex("unique_connection_idx").on(table.requestorId, table.targetId),
  };
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => organizations.id).notNull(),
  receiverId: integer("receiver_id").references(() => organizations.id).notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
  dateRequested: true,
});

export const insertEquipmentRequestSchema = createInsertSchema(equipmentRequests).omit({
  id: true,
  createdAt: true,
});

export const insertNetworkConnectionSchema = createInsertSchema(networkConnections).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

export type EquipmentRequest = typeof equipmentRequests.$inferSelect;
export type InsertEquipmentRequest = z.infer<typeof insertEquipmentRequestSchema>;

export type NetworkConnection = typeof networkConnections.$inferSelect;
export type InsertNetworkConnection = z.infer<typeof insertNetworkConnectionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Login = z.infer<typeof loginSchema>;
