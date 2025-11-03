"use client";

import { useState, useRef } from "react";
import { useProfileStore } from "@/lib/stores/profileStore";
import { profileAPI } from "@/lib/appwrite/profile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { date } from "zod";
import { useAuthStore } from "@/lib/stores/authStore";
import { account, storage, appwriteConfig, ID } from "@/lib/appwrite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronDownIcon, Camera, User, Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";

interface ProfileOnboardingProps {
  userId: string;
}

export default function ProfileOnboarding() {
  const { setProfile } = useProfileStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    profilePictureUrl: "",
    gender: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      setError('');

      // preview 
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const uploadedFile = await storage.createFile({
        bucketId: appwriteConfig.profilePicsBucketId,
        fileId: ID.unique(),
        file: file,
      });

      const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.profilePicsBucketId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;

      setFormData({
        ...formData,
        profilePictureUrl: fileUrl,
      });

      console.log('Image uploaded successfully:', fileUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setPreviewUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      // Validate
      if (!formData.name || !formData.email || !formData.role || !formData.location || !formData.dateOfBirth || !formData.gender) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // TODO: handle OAuth data here
      // Create profile
      const newProfile = await profileAPI.createProfile({
        userId: user?.$id!,
        ...formData,
      });

      // Update store
      setProfile(newProfile);
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-background rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Authentiq! 👋</h1>
        <p className="text-muted-foreground mb-8">
          Let's set up your profile to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {/* Profile Picture */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Profile Picture
              </FieldLabel>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar 
                    className="w-32 h-32 cursor-pointer border-4 border-border hover:border-primary transition-colors"
                    onClick={handleAvatarClick}
                  >
                    <AvatarImage 
                      src={previewUrl || formData.profilePictureUrl} 
                      alt="Profile preview"
                    />
                    <AvatarFallback className="text-4xl bg-muted">
                      {formData.name ? getInitials(formData.name) : <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* overlay */}
                  <div 
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarClick}
                  disabled={isUploadingImage}
                  className="gap-2"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Click the avatar or button to upload. Max 5MB.
                </p>
              </div>
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2"
                placeholder="John Doe"
                required
              />
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2"
                placeholder="john@example.com"
                required
              />
            </Field>

            {/* Role */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </FieldLabel>

              <Input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2"
                placeholder="e.g. Frontend Developer"
                required
              />
            </Field>

            {/* Location */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Location <span className="text-red-500">*</span>
              </FieldLabel>

              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2"
                placeholder="e.g. Amman, Jordan"
                required
              />
            </Field>

            {/* Gender */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Gender <span className="text-red-500">*</span>
              </FieldLabel>

              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Date of Birth */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </FieldLabel>
              {/* <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2"
                required
              /> */}

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    required
                    onSelect={(date) => {
                      setDate(date);
                      setFormData({
                        ...formData,
                        dateOfBirth: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      });
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel className="block text-sm font-medium mb-2">
                Bio
              </FieldLabel>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 "
                placeholder="Tell us about yourself..."
              />
            </Field>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size={"main"}
              disabled={isSubmitting}
              className="w-full!  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Profile..." : "Complete Profile"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
