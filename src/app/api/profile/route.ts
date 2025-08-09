import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { name, jobRole, image } = await request.json();
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    
    // Validate image if provided
    if (image && typeof image === 'string') {
      // Check if it's a valid base64 image
      if (!image.startsWith('data:image/')) {
        return NextResponse.json({ message: "Invalid image format" }, { status: 400 });
      }
      
      // Check image size (base64 is about 33% larger than binary)
      const base64Size = image.length * 0.75;
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (base64Size > maxSize) {
        return NextResponse.json({ message: "Image size must be less than 2MB" }, { status: 400 });
      }
    }
    
    await connectToDatabase();
    
    const updateData: any = { 
      name: name.trim(), 
      jobRole: jobRole?.trim() || '' 
    };
    
    // Only update image if provided
    if (image !== undefined) {
      updateData.image = image;
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        user: { 
          name: updatedUser.name, 
          email: updatedUser.email, 
          jobRole: updatedUser.jobRole, 
          image: updatedUser.image 
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      user: { 
        name: user.name, 
        email: user.email, 
        jobRole: user.jobRole, 
        image: user.image 
      } 
    }, { status: 200 });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}