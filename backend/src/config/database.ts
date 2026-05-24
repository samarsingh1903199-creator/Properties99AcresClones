import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in .env");

  mongoose.connection.on("connected",    () => console.log("  MongoDB  → connected to Atlas"));
  mongoose.connection.on("disconnected", () => console.log("  MongoDB  → disconnected"));
  mongoose.connection.on("error",        (err) => console.error("  MongoDB  → error:", err.message));

  await mongoose.connect(uri, {
    dbName: "luxury-real-estate",
    tls: true,
    tlsAllowInvalidCertificates: true,
  });
}
