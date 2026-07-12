/**
 * Seed script — Laxminarayan ownership only
 * Seeds: Admin, employees, departments, categories
 *
 * Does NOT seed: Assets, Allocations, Bookings, Maintenance, Audits
 * (those are teammate-owned data per §16)
 *
 * Run: npm run seed (from /server directory)
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Department from "./models/Department.js";
import Category from "./models/Category.js";

const seed = async () => {
  await connectDB();

  console.log("🌱 Seeding Laxminarayan-owned data...");

  // Clear existing data (only owned models)
  await User.deleteMany({});
  await Department.deleteMany({});
  await Category.deleteMany({});

  // ── Departments ─────────────────────────────────────────────────────
  const [itDept, hrDept, opsDept] = await Department.insertMany([
    { name: "Information Technology", status: "active" },
    { name: "Human Resources", status: "active" },
    { name: "Operations", status: "active" },
  ]);
  console.log("✅ Departments seeded");

  // ── Users ───────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@1234", 12);
  const empHash = await bcrypt.hash("Employee@1234", 12);

  const admin = await User.create({
    name: "Laxminarayan Admin",
    email: "admin@assetflow.com",
    passwordHash: adminHash,
    role: "admin",
    department: itDept._id,
    status: "active",
  });

  const [emp1, emp2, emp3] = await User.insertMany([
    {
      name: "Jeny Bhatt",
      email: "jeny@assetflow.com",
      passwordHash: empHash,
      role: "asset_manager",
      department: itDept._id,
      status: "active",
    },
    {
      name: "Mahek Sharma",
      email: "mahek@assetflow.com",
      passwordHash: empHash,
      role: "dept_head",
      department: hrDept._id,
      status: "active",
    },
    {
      name: "Satyam Verma",
      email: "satyam@assetflow.com",
      passwordHash: empHash,
      role: "employee",
      department: opsDept._id,
      status: "active",
    },
  ]);
  console.log("✅ Users seeded");

  // Set department heads after users exist
  await Department.findByIdAndUpdate(itDept._id, { head: admin._id });
  await Department.findByIdAndUpdate(hrDept._id, { head: emp2._id });
  await Department.findByIdAndUpdate(opsDept._id, { head: emp3._id });
  console.log("✅ Department heads linked");

  // ── Categories ──────────────────────────────────────────────────────
  await Category.insertMany([
    {
      name: "Laptop",
      customFields: { brand: "", ram: "", storage: "", os: "" },
    },
    {
      name: "Monitor",
      customFields: { brand: "", size: "", resolution: "" },
    },
    {
      name: "Furniture",
      customFields: { material: "", color: "" },
    },
    {
      name: "Vehicle",
      customFields: { make: "", model: "", year: "", licensePlate: "" },
    },
    {
      name: "Networking Equipment",
      customFields: { type: "", brand: "", ports: "" },
    },
  ]);
  console.log("✅ Categories seeded");

  console.log("\n🎉 Seed complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin login:    admin@assetflow.com / Admin@1234");
  console.log("Employee login: jeny@assetflow.com  / Employee@1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
  process.exit(1);
});
