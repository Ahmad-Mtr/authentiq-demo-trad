import { Profile } from "@/lib/interfaces";
import { Mail, MapPin, Phone, Linkedin, Github, Globe } from "lucide-react";
import React from "react";

interface ProfileResumeProps {
  profile: Profile;
}

const ProfileResume = ({ profile }: ProfileResumeProps) => {
  const resume = profile.parsed_resume;
  const personalInfo = resume?.personalInfo;

  return (
    <div className="space-y-8  ">
      {/* Contact / Personal Details */}
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold border-b pb-2">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
          )}
          {personalInfo?.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {personalInfo?.linkedin && (
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {personalInfo?.github && (
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {personalInfo?.website && (
            <a
              href={personalInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </section>

      {/* Professional Summary */}
      {(resume?.summary || profile.bio) && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold border-b pb-2">Professional Summary</h2>
          <p className="text-muted-foreground leading-relaxed">
            {resume?.summary || profile.bio}
          </p>
        </section>
      )}

      {/* Experience */}
      {resume?.experiences && resume.experiences.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Experience</h2>
          <div className="space-y-6">
            {resume.experiences.map((exp, index) => (
              <div key={index} className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold text-lg">{exp.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-muted-foreground">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {exp.achievements.filter(Boolean).map((achievement, i) => (
                      <li key={i}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume?.education && resume.education.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Education</h2>
          <div className="space-y-4">
            {resume.education.map((edu, index) => (
              <div key={index} className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <span className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.endDate || "Present"}
                  </span>
                </div>
                <p className="text-muted-foreground">{edu.institution}</p>
                {edu.fieldOfStudy && (
                  <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                )}
                {edu.gpa && (
                  <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume?.projects && resume.projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Projects</h2>
          <div className="space-y-4">
            {resume.projects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  {(project.startDate || project.endDate) && (
                    <span className="text-sm text-muted-foreground">
                      {project.startDate} - {project.endDate || "Present"}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-muted rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {resume?.certifications && resume.certifications.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Certifications</h2>
          <div className="space-y-3">
            {resume.certifications.map((cert, index) => (
              <div key={index} className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h3 className="font-semibold">{cert.name}</h3>
                  {cert.date && (
                    <span className="text-sm text-muted-foreground">{cert.date}</span>
                  )}
                </div>
                {cert.issuer && (
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {resume?.languages && resume.languages.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold border-b pb-2">Languages</h2>
          <div className="flex flex-wrap gap-4">
            {resume.languages.map((lang, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{lang.language}</span>
                {lang.level && (
                  <span className="text-muted-foreground"> ({lang.level})</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {resume?.skills && resume.skills.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold border-b pb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted rounded-full text-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfileResume;
