"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [jobRole, setJobRole] = useState(session?.user?.jobRole || '');
  const [image, setImage] = useState(session?.user?.image || '');
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setJobRole((session.user as any).jobRole || '');
      setImage(session.user.image || '');
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      let img = image;
      if (preview) {
        img = preview;
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, jobRole, image: img }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Update the session with new data
      await update({ 
        name, 
        jobRole, 
        image: img 
      });
      
      setImage(img);
      setPreview("");
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (session?.user) {
      setName(session.user.name || '');
      setJobRole((session.user as any).jobRole || '');
      setImage(session.user.image || '');
    }
    setPreview("");
    setIsEditing(false);
  };

  // Generate default avatar (DiceBear) if no image
  const getDefaultAvatar = (email: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`;
  };

  const currentImage = preview || image || getDefaultAvatar(session?.user?.email || "user");

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>View and edit your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col items-center gap-2 mb-4 relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={currentImage}/>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {(name || session?.user?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <>
                <button
                  type="button"
                  aria-label="Change profile picture"
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  onClick={() => document.getElementById('profile-pic-input')?.click()}
                  disabled={isSaving}
                >
                  <Camera className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                </button>
                {image && !image.includes('dicebear') && (
                  <button
                    type="button"
                    aria-label="Remove profile picture"
                    className="absolute bottom-2 left-2 bg-red-500 hover:bg-red-600 rounded-full p-1 shadow-md border border-red-600 text-white transition"
                    onClick={() => {
                      setImage("");
                      setPreview("");
                    }}
                    disabled={isSaving}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <Input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSaving}
                />
              </>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditing}
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={session?.user?.email || ''} readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="jobRole">Job Role</Label>
            <Input
              id="jobRole"
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              readOnly={!isEditing}
              disabled={isSaving}
            />
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}