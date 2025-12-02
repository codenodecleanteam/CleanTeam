import {
  pgEnum,
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const languageCodeEnum = pgEnum("language_code", ["en", "pt", "es"]);
export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "owner",
  "admin",
  "cleaner",
]);
export const cleanerStatusEnum = pgEnum("cleaner_status", ["active", "inactive"]);
export const scheduleStatusEnum = pgEnum("schedule_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);
export const clientFrequencyEnum = pgEnum("client_frequency", [
  "weekly",
  "bi-weekly",
  "monthly",
  "one-time",
]);

const timestampUtc = (name: string) =>
  timestamp(name, { withTimezone: true }).defaultNow().notNull();

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("trial"),
  planCode: text("plan_code").default("standard"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  isBlocked: boolean("is_blocked").notNull().default(false),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const companyRelations = relations(companies, ({ many }) => ({
  profiles: many(profiles),
  cleaners: many(cleaners),
  clients: many(clients),
  schedules: many(schedules),
}));

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").references(() => companies.id),
  role: userRoleEnum("role").notNull().default("owner"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  language: languageCodeEnum("language").notNull().default("en"),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const profileRelations = relations(profiles, ({ one, many }) => ({
  company: one(companies, {
    fields: [profiles.companyId],
    references: [companies.id],
  }),
  cleaner: one(cleaners, {
    fields: [profiles.id],
    references: [cleaners.profileId],
  }),
  schedulesAsDriver: many(schedules, { relationName: "driver" }),
  schedulesAsHelper1: many(schedules, { relationName: "helper1" }),
  schedulesAsHelper2: many(schedules, { relationName: "helper2" }),
}));

export const cleaners = pgTable("cleaners", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  language: languageCodeEnum("language").notNull().default("en"),
  drives: boolean("drives").notNull().default(false),
  status: cleanerStatusEnum("status").notNull().default("active"),
  area: text("area"),
  notes: text("notes"),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const cleanerRelations = relations(cleaners, ({ one, many }) => ({
  company: one(companies, {
    fields: [cleaners.companyId],
    references: [companies.id],
  }),
  profile: one(profiles, {
    fields: [cleaners.profileId],
    references: [profiles.id],
  }),
  schedulesAsDriver: many(schedules, { relationName: "driver" }),
  schedulesAsHelper1: many(schedules, { relationName: "helper1" }),
  schedulesAsHelper2: many(schedules, { relationName: "helper2" }),
  reports: many(reports),
}));

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  frequency: clientFrequencyEnum("frequency"),
  notes: text("notes"),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const clientRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.companyId],
    references: [companies.id],
  }),
  schedules: many(schedules),
}));

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
  jobDate: date("job_date").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }),
  driveId: uuid("drive_id")
    .notNull()
    .references(() => cleaners.id),
  helper1Id: uuid("helper1_id")
    .notNull()
    .references(() => cleaners.id),
  helper2Id: uuid("helper2_id").references(() => cleaners.id),
  status: scheduleStatusEnum("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const scheduleRelations = relations(schedules, ({ one, many }) => ({
  company: one(companies, {
    fields: [schedules.companyId],
    references: [companies.id],
  }),
  client: one(clients, {
    fields: [schedules.clientId],
    references: [clients.id],
  }),
  driver: one(cleaners, {
    fields: [schedules.driveId],
    references: [cleaners.id],
    relationName: "driver",
  }),
  helper1: one(cleaners, {
    fields: [schedules.helper1Id],
    references: [cleaners.id],
    relationName: "helper1",
  }),
  helper2: one(cleaners, {
    fields: [schedules.helper2Id],
    references: [cleaners.id],
    relationName: "helper2",
  }),
  reports: many(reports),
}));

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  cleanerId: uuid("cleaner_id").references(() => cleaners.id, {
    onDelete: "set null",
  }),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  issues: text("issues"),
  extraTasks: text("extra_tasks"),
  notes: text("notes"),
  createdAt: timestampUtc("created_at"),
  updatedAt: timestampUtc("updated_at"),
});

export const reportRelations = relations(reports, ({ one }) => ({
  schedule: one(schedules, {
    fields: [reports.scheduleId],
    references: [schedules.id],
  }),
  cleaner: one(cleaners, {
    fields: [reports.cleanerId],
    references: [cleaners.id],
  }),
}));

export type Company = typeof companies.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Cleaner = typeof cleaners.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type Report = typeof reports.$inferSelect;
