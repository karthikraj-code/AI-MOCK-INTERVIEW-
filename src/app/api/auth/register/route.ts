import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, jobRole } = await request.json();

    if (!email || !password || !name) { // jobRole is optional, so not included here
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      jobRole,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully", user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}