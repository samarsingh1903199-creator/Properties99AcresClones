import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model.js";
import { AuthRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { UserRole } from "../types/index.js";

function signToken(userId: string, email: string, role: UserRole) {
  return jwt.sign({ userId, email, role }, process.env.JWT_SECRET!);
}

function safeUser(user: InstanceType<typeof UserModel>) {
  const obj = user.toObject() as unknown as Record<string, unknown>;
  delete obj.passwordHash;
  return obj;
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }
  const token = signToken(String(user._id), user.email, user.role);
  res.json({ success: true, token, user: safeUser(user) });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, company, licenseNumber, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ success: false, message: "name, email, password and role are required" });
    return;
  }
  if (!["visitor", "dealer", "admin"].includes(role)) {
    res.status(400).json({ success: false, message: "role must be visitor | dealer | admin" });
    return;
  }
  if (await UserModel.findOne({ email: email.toLowerCase() })) {
    res.status(409).json({ success: false, message: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name, email, passwordHash,
    role: role as UserRole,
    phone: phone ?? "",
    company: company ?? "",
    licenseNumber: licenseNumber ?? "",
    verified: false,
  });
  const token = signToken(String(user._id), user.email, user.role);
  res.status(201).json({ success: true, token, user: safeUser(user) });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await UserModel.findById(authReq.user?.userId).select("-passwordHash");
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
  res.json({ success: true, user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { name, phone, company, licenseNumber } = req.body;
  const user = await UserModel.findByIdAndUpdate(
    authReq.user?.userId,
    { $set: { ...(name && { name }), ...(phone && { phone }), ...(company && { company }), ...(licenseNumber && { licenseNumber }) } },
    { new: true, select: "-passwordHash" }
  );
  if (!user) { res.status(404).json({ success: false, message: "User not found" }); return; }
  res.json({ success: true, user });
});
