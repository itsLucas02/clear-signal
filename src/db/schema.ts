import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const cases = pgTable("support_cases", {
  id: text("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  channel: text("channel").notNull().default("Chat"),
  assignee: text("assignee").notNull().default("Aisyah Rahman"),
  location: text("location").notNull(),
  plan: text("plan").notNull().default("Connect Plus"),
  avatarColor: text("avatar_color").notNull().default("peach"),
  completedSteps: jsonb("completed_steps").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});

export const notes = pgTable("case_notes", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  kind: text("kind").notNull().default("note"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const incidents = pgTable("network_incidents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  area: text("area").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  service: text("service").notNull(),
  summary: text("summary").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activities = pgTable("workspace_activities", {
  id: text("id").primaryKey(),
  caseId: text("case_id").references(() => cases.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedPlaybooks = pgTable("saved_playbooks", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
