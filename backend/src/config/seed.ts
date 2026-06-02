import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.model.js";
import { PropertyModel } from "../models/Property.model.js";
import { InquiryModel } from "../models/Inquiry.model.js";
import { VisitEnquiryModel } from "../models/VisitEnquiry.model.js";
import { CategoryModel } from "../models/Category.model.js";

const DEFAULT_CATEGORIES = [
  /* Listing types */
  { name: "For Rent",  slug: "rent",    categoryType: "listing", icon: "key",       order: 1 },
  { name: "For Sale",  slug: "sale",    categoryType: "listing", icon: "home",      order: 2 },
  { name: "Lease",     slug: "lease",   categoryType: "listing", icon: "layers",    order: 3 },

  /* Property types */
  { name: "Luxury Homes",   slug: "luxury-homes",  categoryType: "property", icon: "crown",    order: 1 },
  { name: "Apartments",     slug: "apartment",     categoryType: "property", icon: "building2", order: 2 },
  { name: "Villas",         slug: "villa",         categoryType: "property", icon: "tree-palm", order: 3 },
  { name: "Commercial",     slug: "commercial",    categoryType: "property", icon: "briefcase", order: 4 },
  { name: "Plots",          slug: "plot",          categoryType: "property", icon: "map",       order: 5 },
  { name: "New Projects",   slug: "new-projects",  categoryType: "property", icon: "sparkles",  order: 6 },
  { name: "PG / Co-Living", slug: "pg-co-living",  categoryType: "property", icon: "users",     order: 7 },
];

async function seedCategories() {
  const count = await CategoryModel.countDocuments();
  if (count > 0) return;
  await CategoryModel.insertMany(DEFAULT_CATEGORIES);
  console.log(`  Seeding   → inserted ${DEFAULT_CATEGORIES.length} default categories`);
}

export async function seedIfEmpty(): Promise<void> {
  await seedCategories();

  const userCount = await UserModel.countDocuments();

  /* ── Full seed when DB is completely empty ── */
  if (userCount === 0) {
    console.log("  Seeding   → inserting sample data…");

    const passwordHash = await bcrypt.hash("password", 10);
    const user = await UserModel.create({
      name: "Ravi Sharma", email: "ravi@vexrealty.com", passwordHash,
      role: "dealer", phone: "+91 98765 43210",
      company: "VEX Realty", licenseNumber: "DL-MH-2024-001", verified: true,
    });

    const ownerId = String(user._id);

    const [p1, p2, p3] = await PropertyModel.insertMany([
      {
        title: "Luxury Sea-View Penthouse", type: "penthouse", listingType: "sale",
        price: 12500000, area: 4200, bedrooms: 5, bathrooms: 6,
        location: "Marine Drive, Mumbai", city: "Mumbai",
        description: "Exquisite penthouse with panoramic sea views.",
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
        ],
        status: "active", views: 342, inquiries: 18, ownerId,
        amenities: {
          parking: 3, powerBackup: true, security24x7: true, separateElectricityMeter: true,
          waterSupply: "both", highSpeedWifi: true, gymnasium: true, swimmingPool: true,
          clubHouse: true, airConditioning: true, acCount: 8,
          furnishingStatus: "fully-furnished", bedsCount: 5, almirah: true, storage: true,
          securityDeposit: 500000, distanceFromLocation: 0.5,
        },
      },
      {
        title: "Modern Villa with Pool", type: "villa", listingType: "sale",
        price: 8750000, area: 5800, bedrooms: 6, bathrooms: 7,
        location: "Golf Course Road, Gurugram", city: "Gurugram",
        description: "Sprawling villa with private pool and landscaped garden.",
        images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
        status: "active", views: 210, inquiries: 11, ownerId,
        amenities: {
          parking: 3, powerBackup: true, security24x7: true, separateElectricityMeter: true,
          waterSupply: "both", highSpeedWifi: true, gymnasium: false, swimmingPool: true,
          clubHouse: false, airConditioning: true, acCount: 6,
          furnishingStatus: "semi-furnished", bedsCount: 6, almirah: true, storage: true,
          securityDeposit: 0, distanceFromLocation: 1.2,
        },
      },
      {
        title: "Executive 3BHK Apartment", type: "apartment", listingType: "rent",
        price: 85000, area: 1850, bedrooms: 3, bathrooms: 3,
        location: "Bandra West, Mumbai", city: "Mumbai",
        description: "Well-furnished premium apartment in prime location.",
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
        status: "pending", views: 98, inquiries: 5, ownerId,
        amenities: {
          parking: 1, powerBackup: true, security24x7: true, separateElectricityMeter: true,
          waterSupply: "municipal", highSpeedWifi: true, gymnasium: true, swimmingPool: false,
          clubHouse: true, airConditioning: true, acCount: 3,
          furnishingStatus: "fully-furnished", bedsCount: 3, almirah: true, storage: false,
          securityDeposit: 170000, distanceFromLocation: 0.3,
        },
      },
    ]);

    await InquiryModel.insertMany([
      { name: "Priya Mehta",  phone: "+91 98765 11111", email: "priya@example.com",  propertyId: String(p1._id), propertyTitle: p1.title, message: "I'd like to schedule a site visit this weekend.", status: "new",       ownerId },
      { name: "Arjun Kapoor", phone: "+91 98765 22222", email: "arjun@example.com",  propertyId: String(p2._id), propertyTitle: p2.title, message: "Can you share the floor plan and more photos?",   status: "responded", ownerId },
      { name: "Sunita Rao",   phone: "+91 98765 33333", email: "sunita@example.com", propertyId: String(p3._id), propertyTitle: p3.title, message: "Is the property pet-friendly?",                   status: "responded", ownerId },
      { name: "Vikram Singh", phone: "+91 98765 44444", email: "vikram@example.com", propertyId: String(p1._id), propertyTitle: p1.title, message: "Is there room for price negotiation?",             status: "closed",    ownerId },
    ]);

    console.log("  Seeding   → done (user: ravi@vexrealty.com / password)");
    return;
  }

  /* ── Partial seed: create sample inquiries for existing dealers who have none ── */
  const inquiryCount = await InquiryModel.countDocuments();
  if (inquiryCount > 0) return;

  console.log("  Seeding   → adding sample inquiries for existing dealers…");

  const properties = await PropertyModel.find().sort({ createdAt: -1 }).limit(5);
  if (properties.length === 0) return;

  const SAMPLE_CUSTOMERS = [
    { name: "Priya Mehta",   phone: "+91 98765 11111", email: "priya@example.com",  message: "I'd like to schedule a site visit this weekend.",   status: "new" },
    { name: "Arjun Kapoor",  phone: "+91 98765 22222", email: "arjun@example.com",  message: "Can you share the floor plan and more photos?",     status: "responded" },
    { name: "Sunita Rao",    phone: "+91 98765 33333", email: "sunita@example.com", message: "Is the property pet-friendly? What's the monthly maintenance?", status: "responded" },
    { name: "Vikram Singh",  phone: "+91 98765 44444", email: "vikram@example.com", message: "Is there room for price negotiation?",               status: "closed" },
    { name: "Neha Joshi",    phone: "+91 98765 55555", email: "neha@example.com",   message: "What is the earliest possible possession date?",     status: "new" },
  ];

  const docs = properties.map((prop, i) => ({
    name:          SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length].name,
    phone:         SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length].phone,
    email:         SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length].email,
    message:       SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length].message,
    status:        SAMPLE_CUSTOMERS[i % SAMPLE_CUSTOMERS.length].status,
    propertyId:    String(prop._id),
    propertyTitle: prop.title,
    ownerId:       prop.ownerId,
  }));

  await InquiryModel.insertMany(docs);
  console.log(`  Seeding   → inserted ${docs.length} sample inquiries for existing properties`);
}
