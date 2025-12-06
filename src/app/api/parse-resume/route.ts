import { createMistral } from '@ai-sdk/mistral';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

const workExperienceSchema = z.object({
  title: z.string().optional().default('').describe('Job title or position'),
  company: z.string().optional().default('').describe('Company name'),
  startDate: z.string().optional().default('').describe('Start date in YYYY-MM format or similar'),
  endDate: z.string().optional().default('').describe('End date in YYYY-MM format or "Present" if current'),
  description: z.string().optional().describe('Brief job description'),
  achievements: z.array(z.string()).optional().default([]).describe('Key achievements or responsibilities'),
});

const educationSchema = z.object({
  degree: z.string().optional().default('').describe('Degree or qualification name'),
  institution: z.string().optional().default('').describe('Educational institution name'),
  startDate: z.string().optional().default('').describe('Start date in YYYY-MM format'),
  endDate: z.string().optional().default('').describe('End date in YYYY-MM format'),
  fieldOfStudy: z.string().optional().describe('Field of study or major'),
  gpa: z.string().optional().describe('GPA if mentioned'),
});

const skillSchema = z.object({
  name: z.string().optional().default('').describe('Skill name'),
});

const languageSchema = z.object({
  language: z.string().optional().default('').describe('Language name (e.g., German, English)'),
  level: z.string().optional().default('').describe('Proficiency level (e.g., A1, A2, B1, B2, C1, C2, Native, Fluent)'),
});

const certificationSchema = z.object({
  name: z.string().optional().default('').describe('Certification name'),
  issuer: z.string().optional().default('').describe('Issuing organization'),
  date: z.string().optional().default('').describe('Date obtained'),
  expiryDate: z.string().optional().describe('Expiry date if applicable'),
  credentialId: z.string().optional().describe('Credential ID if mentioned'),
});

const projectSchema = z.object({
  name: z.string().optional().default('').describe('Project name'),
  description: z.string().optional().default('').describe('Project description'),
  startDate: z.string().optional().describe('Start date'),
  endDate: z.string().optional().describe('End date'),
  technologies: z.array(z.string()).optional().default([]).describe('Technologies used'),
  url: z.string().optional().describe('Project URL if available'),
});

const resumeSchema = z.object({
  personalInfo: z.object({
    name: z.string().optional().describe('Full name'),
    email: z.string().optional().describe('Email address'),
    phone: z.string().optional().describe('Phone number'),
    location: z.string().optional().describe('Location/address'),
    linkedin: z.string().optional().describe('LinkedIn URL'),
    github: z.string().optional().describe('GitHub URL'),
    website: z.string().optional().describe('Personal website URL'),
  }).optional(),
  summary: z.string().optional().describe('Professional summary or objective'),
  experiences: z.array(workExperienceSchema).optional().default([]).describe('Work experience history, empty array if none found'),
  education: z.array(educationSchema).optional().default([]).describe('Educational background, empty array if none found'),
  skills: z.array(skillSchema).optional().default([]).describe('Skills list, empty array if none found'),
  certifications: z.array(certificationSchema).optional().default([]).describe('Certifications'),
  projects: z.array(projectSchema).optional().default([]).describe('Projects'),
  languages: z.array(languageSchema).optional().default([]).describe('Languages spoken with proficiency levels'),
});


export async function POST(request: NextRequest) {
  console.log('=== Parse Resume API Called ===');
  
  try {
    const body = await request.json();
    
    const { resumeUrl } = body;

    if (!resumeUrl) {
      return NextResponse.json(
        { error: 'Resume URL is required' },
        { status: 400 }
      );
    }

    console.log('Starting resume parsing for URL:', resumeUrl);

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error('MISTRAL_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    try {
      new URL(resumeUrl);
    } catch (urlError) {
      console.error('Invalid URL format:', resumeUrl);
      return NextResponse.json(
        { error: 'Invalid resume URL format' },
        { status: 400 }
      );
    }

    console.log('Calling Mistral API...');
    const result = await generateObject({
      model: mistral('mistral-large-latest'),
      schema: resumeSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this resume document and extract all relevant information. 
              Parse the following sections carefully:
              - Personal information (name, contact details, social links)
              - Professional summary or objective
              - Work experience (with titles, companies, dates, and achievements)
              - Education (degrees, institutions, dates)
              - Skills (categorize if possible)
              - Certifications
              - Projects
              - Languages
              
              For dates, use YYYY-MM format when possible. If only year is available, use YYYY.
              For current positions, use "Present" as the end date.
              Extract all bullet points and achievements under each experience.`,
            },
            {
              type: 'file',
              data: new URL(resumeUrl),
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
      providerOptions: {
        mistral: {
          documentImageLimit: 8, 
          documentPageLimit: 8,  
        },
      },
    });

    console.log('Resume parsed successfully:', JSON.stringify(result.object, null, 2));

    return NextResponse.json({
      success: true,
      data: result.object,
    });

  } catch (error) {
    console.error('=== Error in /api/parse-resume ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to parse resume', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
