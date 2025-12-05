"use client";

import { useState, useRef, useEffect } from "react";
import { useProfileStore } from "@/lib/stores/profileStore";
import { profileAPI } from "@/lib/supabase/profile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuthStore } from "@/lib/stores/authStore";
import supabase from "@/lib/supabase";
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
import { 
  ChevronDownIcon, 
  Camera, 
  User, 
  Upload, 
  Loader2, 
  FileText, 
  Check, 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderKanban, 
  Award, 
  Languages, 
  Plus, 
  Trash2,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials, cn } from "@/lib/utils";
import { 
  ParsedResume, 
  WorkExperience, 
  Education, 
  Skill, 
  Certification, 
  Project,
  Language 
} from "@/lib/interfaces/resume";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const ONBOARDING_STORAGE_KEY = "authentiq_onboarding_data";
const TOTAL_STEPS = 5;

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  isEmpty = false,
  badge,
  onAdd,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isEmpty?: boolean;
  badge?: string | number;
  onAdd?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen && !isEmpty);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-colors",
          "hover:bg-muted/50 cursor-pointer",
          isOpen && "border-b"
        )}
      >
        <div 
          className="flex items-center gap-3 flex-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          {icon && <span className="text-primary">{icon}</span>}
          <span className="font-medium">{title}</span>
          {badge !== undefined && Number(badge) > 0 && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
          {isEmpty && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Empty
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onAdd && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
                setIsOpen(true);
              }}
              className="h-7 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <ChevronDown
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200 cursor-pointer",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>
      {isOpen && (
        <div className="p-4">
          {isEmpty ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                No data found in your resume for this section.
              </p>
              {onAdd && (
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {title.slice(0, -1)}
                </Button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfileOnboarding() {
  const { setProfile } = useProfileStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    role: "",
    bio: "",
    location: "",
    date_of_birth: "",
    pfp_url: "",
    gender: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>("");
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  
  // Editable resume data states
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [summary, setSummary] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Initialize editable fields from parsed resume
  useEffect(() => {
    if (parsedResume) {
      setExperiences(parsedResume.experiences || []);
      setEducation(parsedResume.education || []);
      setSkills(parsedResume.skills || []);
      setProjects(parsedResume.projects || []);
      setCertifications(parsedResume.certifications || []);
      setLanguages(parsedResume.languages || []);
      setSummary(parsedResume.summary || "");
    }
  }, [parsedResume]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        setPreviewUrl(parsed.previewUrl || "");
        setResumeUrl(parsed.resumeUrl || "");
        setParsedResume(parsed.parsedResume || null);
        setCurrentStep(parsed.currentStep || 1);
        
        // Load editable fields
        if (parsed.experiences) setExperiences(parsed.experiences);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.skills) setSkills(parsed.skills);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.certifications) setCertifications(parsed.certifications);
        if (parsed.languages) setLanguages(parsed.languages);
        if (parsed.summary) setSummary(parsed.summary);
        
        if (parsed.formData?.date_of_birth) {
          setDate(new Date(parsed.formData.date_of_birth));
        }
      } catch (err) {
        console.error("Error loading saved onboarding data:", err);
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        pfp_url: publicUrl,
      });
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

  const saveToLocalStorage = () => {
    const dataToSave = {
      formData,
      previewUrl,
      resumeUrl,
      parsedResume,
      currentStep,
      experiences,
      education,
      skills,
      projects,
      certifications,
      languages,
      summary,
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.role || !formData.location || !formData.date_of_birth || !formData.gender) {
        setError("Please fill in all required fields");
        return;
      }
      setError("");
      saveToLocalStorage();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!resumeUrl) {
        setError("Please upload your resume");
        return;
      }
      setError("");
      
      try {
        setIsParsingResume(true);
        const response = await fetch('/api/parse-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeUrl }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.details || responseData.error || 'Failed to parse resume');
        }

        const { data } = responseData;
        setParsedResume(data);
        saveToLocalStorage();
        setCurrentStep(3);
      } catch (err) {
        console.error('Error parsing resume:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume';
        setError(`${errorMessage}. You can continue anyway.`);
        setTimeout(() => {
          setError('');
          saveToLocalStorage();
          setCurrentStep(3);
        }, 3000);
      } finally {
        setIsParsingResume(false);
      }
    } else if (currentStep < TOTAL_STEPS) {
      setError("");
      saveToLocalStorage();
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setError("");
    saveToLocalStorage();
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Resume size should be less than 10MB');
      return;
    }

    try {
      setIsUploadingResume(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resume')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resume')
        .getPublicUrl(filePath);

      setResumeUrl(publicUrl);
      setResumeFile(file);
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const buildFinalParsedResume = (): ParsedResume => {
    return {
      personalInfo: parsedResume?.personalInfo || {},
      summary: summary || "",
      experiences: experiences || [],
      education: education || [],
      skills: skills || [],
      certifications: certifications || [],
      projects: projects || [],
      languages: languages || [],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const resumeId = resumeUrl ? resumeUrl.split('/').pop()?.split('?')[0] : undefined;
      const finalParsedResume = buildFinalParsedResume();
      
      const newProfile = await profileAPI.createProfile({
        user_id: user?.id!,
        ...formData,
        resume_id: resumeId,
        parsed_resume: finalParsedResume,
      });

      setProfile(newProfile);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Experience handlers
  const addExperience = () => {
    setExperiences([...experiences, {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      achievements: [],
    }]);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | string[]) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, {
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      fieldOfStudy: "",
      gpa: "",
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Skills handlers
  const addSkill = () => {
    setSkills([...skills, { name: "" }]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Project handlers
  const addProject = () => {
    setProjects([...projects, {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      technologies: [],
      url: "",
    }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | string[]) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([...certifications, {
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
      credentialId: "",
    }]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Language handlers
  const addLanguage = () => {
    setLanguages([...languages, { language: "", level: "" }]);
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Profile" },
      { num: 2, label: "Resume" },
      { num: 3, label: "Experience" },
      { num: 4, label: "Skills" },
      { num: 5, label: "Review" },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep === step.num 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : currentStep > step.num
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}>
                {currentStep > step.num ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold text-sm">{step.num}</span>
                )}
              </div>
              <span className={cn(
                "text-xs mt-1",
                currentStep >= step.num ? "text-primary" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-2 mb-5",
                currentStep > step.num ? 'bg-primary' : 'bg-muted-foreground/30'
              )} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>
      
      <FieldGroup>
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
                <AvatarImage src={previewUrl || formData.pfp_url} alt="Profile preview" />
                <AvatarFallback className="text-4xl bg-muted">
                  {formData.name ? getInitials(formData.name) : <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
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
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Upload Photo</>
              )}
            </Button>
          </div>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Full Name <span className="text-red-500">*</span></FieldLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Email <span className="text-red-500">*</span></FieldLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Role <span className="text-red-500">*</span></FieldLabel>
            <Input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Location <span className="text-red-500">*</span></FieldLabel>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Amman, Jordan"
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Gender <span className="text-red-500">*</span></FieldLabel>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Date of Birth <span className="text-red-500">*</span></FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal">
                  {date ? date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    setDate(d);
                    setFormData({
                      ...formData,
                      date_of_birth: d ? d.toISOString().split("T")[0] : "",
                    });
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
        </div>

        <Field>
          <FieldLabel>Bio</FieldLabel>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </Field>
      </FieldGroup>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">We'll extract your professional details automatically</p>
      </div>
      
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
        {resumeUrl ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg w-full max-w-md">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {resumeFile?.name || 'Resume uploaded'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {resumeFile?.size ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                </p>
              </div>
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => resumeInputRef.current?.click()}
              disabled={isUploadingResume}
            >
              Upload Different Resume
            </Button>
          </div>
        ) : (
          <>
            <FileText className="w-16 h-16 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium mb-1">Upload your resume</p>
              <p className="text-sm text-muted-foreground mb-4">PDF or Word document, max 10MB</p>
            </div>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={isUploadingResume}
            />
            <Button
              type="button"
              onClick={() => resumeInputRef.current?.click()}
              disabled={isUploadingResume}
              className="gap-2"
            >
              {isUploadingResume ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" /> Choose File</>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Experience & Education</h2>
        <p className="text-muted-foreground">Review and edit your professional background</p>
      </div>

      {/* Professional Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Brief professional summary..."
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Work Experience */}
      <CollapsibleSection
        title="Work Experience"
        icon={<Briefcase className="h-5 w-5" />}
        badge={experiences.length}
        isEmpty={experiences.length === 0}
        onAdd={addExperience}
      >
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <Card key={index} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeExperience(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input
                      value={exp.title || ""}
                      onChange={(e) => updateExperience(index, "title", e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={exp.company || ""}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      value={exp.startDate || ""}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                      placeholder="2020-01"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      value={exp.endDate || ""}
                      onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                      placeholder="Present"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={exp.description || ""}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    rows={2}
                    placeholder="Brief overview of your role and responsibilities..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    <span>Achievements / Key Points</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        const achievements = exp.achievements || [];
                        updateExperience(index, "achievements", [...achievements, ""]);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </label>
                  <div className="space-y-2 mt-2">
                    {(exp.achievements || []).map((achievement, achievementIndex) => (
                      <div key={achievementIndex} className="flex items-center gap-2">
                        <span className="text-muted-foreground">•</span>
                        <Input
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...(exp.achievements || [])];
                            newAchievements[achievementIndex] = e.target.value;
                            updateExperience(index, "achievements", newAchievements);
                          }}
                          placeholder="Led a team of 5 engineers..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const newAchievements = (exp.achievements || []).filter(
                              (_, i) => i !== achievementIndex
                            );
                            updateExperience(index, "achievements", newAchievements);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!exp.achievements || exp.achievements.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">
                        Add bullet points highlighting your key achievements and responsibilities
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {experiences.length > 0 && (
            <Button type="button" variant="outline" onClick={addExperience} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Another Experience
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Education */}
      <CollapsibleSection
        title="Education"
        icon={<GraduationCap className="h-5 w-5" />}
        badge={education.length}
        isEmpty={education.length === 0}
        onAdd={addEducation}
      >
        <div className="space-y-4">
          {education.map((edu, index) => (
            <Card key={index} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Degree</label>
                    <Input
                      value={edu.degree || ""}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      placeholder="Bachelor's in Computer Science"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Institution</label>
                    <Input
                      value={edu.institution || ""}
                      onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      placeholder="University Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      value={edu.startDate || ""}
                      onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                      placeholder="2016"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      value={edu.endDate || ""}
                      onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GPA</label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {education.length > 0 && (
            <Button type="button" variant="outline" onClick={addEducation} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Another Education
            </Button>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Skills & Projects</h2>
        <p className="text-muted-foreground">Showcase your abilities and work</p>
      </div>

      {/* Skills */}
      <CollapsibleSection
        title="Skills"
        icon={<Code className="h-5 w-5" />}
        badge={skills.length}
        isEmpty={skills.length === 0}
        onAdd={addSkill}
      >
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={skill.name || ""}
                onChange={(e) => updateSkill(index, "name", e.target.value)}
                placeholder="Skill name (e.g. React, Python, Project Management)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeSkill(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {skills.length > 0 && (
            <Button type="button" variant="outline" onClick={addSkill} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Skill
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Projects */}
      <CollapsibleSection
        title="Projects"
        icon={<FolderKanban className="h-5 w-5" />}
        badge={projects.length}
        isEmpty={projects.length === 0}
        onAdd={addProject}
      >
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={index} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeProject(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={project.name || ""}
                      onChange={(e) => updateProject(index, "name", e.target.value)}
                      placeholder="Project Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={project.url || ""}
                      onChange={(e) => updateProject(index, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={project.description || ""}
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                    rows={2}
                    placeholder="What does this project do?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Technologies (comma-separated)</label>
                  <Input
                    value={project.technologies?.join(", ") || ""}
                    onChange={(e) => updateProject(index, "technologies", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                    placeholder="React, Node.js, TypeScript"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length > 0 && (
            <Button type="button" variant="outline" onClick={addProject} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Certifications */}
      <CollapsibleSection
        title="Certifications"
        icon={<Award className="h-5 w-5" />}
        badge={certifications.length}
        isEmpty={certifications.length === 0}
        onAdd={addCertification}
      >
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <Card key={index} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeCertification(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Certification Name</label>
                    <Input
                      value={cert.name || ""}
                      onChange={(e) => updateCertification(index, "name", e.target.value)}
                      placeholder="AWS Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Issuer</label>
                    <Input
                      value={cert.issuer || ""}
                      onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                      placeholder="Amazon Web Services"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Date Obtained</label>
                    <Input
                      value={cert.date || ""}
                      onChange={(e) => updateCertification(index, "date", e.target.value)}
                      placeholder="2023-06"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Credential ID</label>
                    <Input
                      value={cert.credentialId || ""}
                      onChange={(e) => updateCertification(index, "credentialId", e.target.value)}
                      placeholder="ABC123XYZ"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {certifications.length > 0 && (
            <Button type="button" variant="outline" onClick={addCertification} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Certification
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Languages */}
      <CollapsibleSection
        title="Languages"
        icon={<Languages className="h-5 w-5" />}
        badge={languages.length}
        isEmpty={languages.length === 0}
        onAdd={addLanguage}
      >
        <div className="space-y-3">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={lang.language || ""}
                onChange={(e) => updateLanguage(index, "language", e.target.value)}
                placeholder="e.g. German, Arabic"
                className="flex-1"
              />
              <Select
                value={lang.level || ""}
                onValueChange={(value) => updateLanguage(index, "level", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                  <SelectItem value="Native">Native</SelectItem>
                  <SelectItem value="Fluent">Fluent</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeLanguage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {languages.length > 0 && (
            <Button type="button" variant="outline" onClick={addLanguage} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Language
            </Button>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderStep5 = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Review Your Profile</h2>
          <p className="text-muted-foreground">Make sure everything looks correct</p>
        </div>

        {/* Profile Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={previewUrl || formData.pfp_url} />
                <AvatarFallback className="text-xl">
                  {formData.name ? getInitials(formData.name) : <User />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{formData.name}</CardTitle>
                <CardDescription>{formData.role}</CardDescription>
                <p className="text-sm text-muted-foreground">{formData.location}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span>{formData.email}</span>
            </div>
            {formData.bio && (
              <p className="text-sm text-muted-foreground">{formData.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* Resume Data Preview */}
        <div className="space-y-4">
          {summary && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{summary}</p>
              </CardContent>
            </Card>
          )}

          {experiences.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experience ({experiences.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {experiences.map((exp, i) => (
                  <div key={i} className={i > 0 ? "pt-3 border-t" : ""}>
                    <p className="font-medium">{exp.title || "Untitled Position"}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} • {exp.startDate} - {exp.endDate}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-1">{exp.description}</p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="text-sm mt-1 space-y-0.5">
                        {exp.achievements.filter(Boolean).map((achievement, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {education.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education ({education.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {education.map((edu, i) => (
                  <div key={i} className={i > 0 ? "pt-3 border-t" : ""}>
                    <p className="font-medium">{edu.degree || "Degree"}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution} • {edu.startDate} - {edu.endDate}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills ({skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {projects.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projects ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.map((proj, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-medium">{proj.name || "Untitled Project"}</span>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications ({certifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {certifications.map((cert, i) => (
                  <div key={i}>
                    <span className="font-medium">{cert.name}</span>
                    <span className="text-sm text-muted-foreground"> • {cert.issuer}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {languages.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {languages.filter(l => l.language).map((lang, i) => (
                    <Badge key={i} variant="outline">
                      {lang.language}{lang.level && ` (${lang.level})`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            By completing your profile, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-background rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Authentiq! 👋</h1>
        <p className="text-muted-foreground mb-8">
          Let's set up your profile to get started
        </p>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                className="flex-1"
                disabled={isParsingResume || isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1"
                disabled={isParsingResume || (currentStep === 2 && isUploadingResume)}
              >
                {isParsingResume ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Parsing Resume...</>
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Profile...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Complete Profile</>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
