import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useCVs } from '../store/CVContext';
import { CVData, Certification } from '../types';
import LZString from 'lz-string';
import { ArrowLeft, Printer, Palette, ExternalLink, Image as ImageIcon, FileText, Download, Mail, Phone, MapPin, Link as LinkIcon, Calendar, Briefcase, GraduationCap, Wrench, Award, LayoutTemplate, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getCV } = useCVs();
  
  const [cv, setCv] = useState<CVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'soft'>('light');
  
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('cv-hub-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'soft') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cv-hub-theme', theme);
  }, [theme]);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(dataParam);
        if (decompressed) {
          setCv(JSON.parse(decompressed));
        } else {
          setError("Failed to load shared CV. Link might be corrupted.");
        }
      } catch (e) {
        setError("Failed to parse shared CV.");
      }
    } else if (id) {
      const found = getCV(id);
      if (found) {
        setCv(found);
      } else {
        setError("CV not found in your local storage.");
      }
    } else {
      setError("No CV data found in URL.");
    }
  }, [id, searchParams, getCV]);

  const handlePrint = () => {
    window.print();
  };

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'soft', 'minimalist', 'material', 'flat', 'glass', 'neumorphism', 'retro', 'typographic'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex] as any);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-8 rounded-xl border border-red-200 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-muted mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative text-foreground pb-20 print:bg-white print:text-black">
      {/* Subtle dotted background */}
      <div className="absolute inset-0 z-0 opacity-40 print:hidden pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
      
      {/* Floating Controls - Hidden in print */}
      <div className="fixed top-4 left-4 right-4 z-50 flex justify-between items-center pointer-events-none print:hidden">
        <button 
          onClick={() => navigate('/')}
          className="pointer-events-auto flex items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-md border border-border rounded-full shadow-sm hover:bg-background transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border rounded-full p-1 shadow-sm">
          <button 
            onClick={cycleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background transition-all max-w-[120px] sm:max-w-none"
            title="Toggle Theme"
          >
            <Palette className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium capitalize truncate hidden sm:inline-block">{theme}</span>
          </button>
          <div className="w-px h-4 bg-border"></div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-background transition-all"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium hidden sm:inline-block">Print</span>
          </button>
        </div>
      </div>

      {/* A4 Document Area */}
      <div className="relative z-10 max-w-4xl mx-auto mt-24 print:mt-0 px-4 sm:px-8">
        <div className="theme-card bg-card print:bg-white print:border-none border border-border shadow-md overflow-hidden animate-in fade-in duration-500 backdrop-blur-md relative">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-primary/80"></div>
          
          {/* Header Section */}
          <header className="p-8 sm:p-12 sm:pb-10 border-b border-border/50 relative">
            <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground print:text-black pb-1">
                  {cv.personalInfo.name}
                </h1>
                <h2 className="text-xl sm:text-2xl mt-1 font-medium text-primary print:text-gray-800">
                  {cv.personalInfo.title}
                </h2>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-muted print:text-gray-600">
                  {cv.personalInfo.email && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <Mail className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.email}
                    </span>
                  )}
                  {cv.personalInfo.phone && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <Phone className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.phone}
                    </span>
                  )}
                  {cv.personalInfo.location && (
                    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      {cv.personalInfo.location}
                    </span>
                  )}
                  {cv.personalInfo.links?.map((link, idx) => (
                    <a key={idx} href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors text-muted">
                      <LinkIcon className="w-4 h-4 text-primary/70 print:hidden" />
                      {link.label || link.url.replace(/^https?:\/\//, '')}
                    </a>
                  ))}
                </div>
              </div>
              {cv.personalInfo.photo && (
                <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-border mt-2 sm:mt-0 relative group">
                  <img src={cv.personalInfo.photo} alt={cv.personalInfo.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl"></div>
                </div>
              )}
            </div>
            
            {cv.summary && (
              <p className="mt-8 text-base leading-relaxed text-muted print:text-black max-w-3xl">
                {cv.summary}
              </p>
            )}
          </header>

          <div className="p-8 sm:p-12 space-y-12">

            {/* Dynamic Sections from the new exhaustive structure */}
            {cv.sections && cv.sections.map((section) => {
              let SectionIcon = Layers;
              if (section.id.toLowerCase().includes('experience')) SectionIcon = Briefcase;
              if (section.id.toLowerCase().includes('education')) SectionIcon = GraduationCap;
              if (section.id.toLowerCase().includes('project')) SectionIcon = LayoutTemplate;
              if (section.id.toLowerCase().includes('cert')) SectionIcon = Award;
              if (section.id.toLowerCase().includes('skill')) SectionIcon = Wrench;

              return section.items.length > 0 && (
                <section key={section.id}>
                  <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                    <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <SectionIcon className="w-5 h-5" />
                    </span>
                    <span className="uppercase text-sm tracking-widest">{section.title}</span>
                    <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                  </h3>
                  <div className="space-y-8">
                    {section.items.map((item) => (
                      <div key={item.id} className="relative pl-4 sm:pl-0">
                        {/* Timeline line - hidden on very small screens if we want, or keep it. Let's make a subtle left border to group items */}
                        <div className="absolute left-0 top-2 bottom-0 w-px bg-border sm:hidden"></div>
                        
                        {(item.title || item.subtitle || item.date) && (
                          <div className="mb-2 relative">
                            <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background sm:hidden"></div>
                            <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                              <h4 className="text-lg font-semibold text-foreground">
                                {item.title} 
                                {item.title && item.subtitle && <span className="mx-2 text-muted/50 hidden sm:inline">|</span>}
                                {item.subtitle && <span className={cn(item.title ? "text-base font-normal text-muted" : "text-lg font-medium text-foreground")}>{item.subtitle}</span>}
                              </h4>
                              {item.date && (
                                <span className="text-sm text-primary font-medium tabular-nums whitespace-nowrap mt-1 sm:mt-0 flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-md w-fit">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {item.date}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {item.htmlContent && (
                          <div 
                            className="cv-html-content text-muted text-sm leading-relaxed print:text-black mt-2" 
                            dangerouslySetInnerHTML={{ __html: item.htmlContent }} 
                          />
                        )}
                        
                        {/* Inline Certificate Preview */}
                        {item.url && item.type && (
                          <div className="mt-4 print:hidden">
                            {item.type.toLowerCase() === 'image' || item.url.match(/\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i) ? (
                              <a href={item.url} target="_blank" rel="noreferrer" className="block w-fit rounded-md overflow-hidden border border-[#E5E7EB]">
                                <img 
                                  src={item.url} 
                                  alt={item.title || 'Certificate'} 
                                  className="w-full max-h-[120px] object-cover hover:scale-105 transition-transform duration-300" 
                                  loading="lazy" 
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-sm font-medium text-muted bg-muted/20">Preview not available. Click to view.</div>');
                                  }}
                                />
                              </a>
                            ) : item.type.toLowerCase() === 'pdf' || item.url.toLowerCase().includes('.pdf') ? (
                              <div className="w-full max-w-3xl border border-border rounded-md overflow-hidden bg-muted/10 relative group">
                                <iframe 
                                  src={item.url} 
                                  className="w-full h-[300px]" 
                                  loading="lazy" 
                                  title={item.title || 'PDF Document'}
                                >
                                  <p className="p-4 text-sm text-muted">Preview not available. <a href={item.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download PDF</a></p>
                                </iframe>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-md shadow-sm text-sm font-medium hover:bg-background">
                                    <ExternalLink className="w-4 h-4" />
                                    Open
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium hover:bg-primary/20 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                                View Attached Document
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Legacy Fallbacks below for older templates without `sections` array */}

            {/* Experience */}
            {(!cv.sections || cv.sections.length === 0) && cv.experience && cv.experience.length > 0 && (
              <section>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <span className="uppercase text-sm tracking-widest">Experience</span>
                  <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-8">
                  {cv.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row justify-between mb-2 sm:items-baseline">
                        <h4 className="text-lg font-medium text-foreground">{exp.position}</h4>
                        <span className="text-sm text-muted tabular-nums whitespace-nowrap hidden sm:block">
                          {exp.date}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between mb-3 text-primary font-medium text-sm print:text-gray-700 sm:hidden">
                        <span>{exp.company}</span>
                        <span className="text-xs">{exp.date}</span>
                      </div>
                      <div className="hidden sm:block text-primary font-medium text-sm mb-3">{exp.company}</div>
                      
                      <ul className="list-disc list-outside ml-4 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-1.5">
                        {exp.details?.map((detail, idx) => (
                          <li key={idx} className="pl-1">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {(!cv.sections || cv.sections.length === 0) && cv.projects && cv.projects.length > 0 && (
              <section>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <LayoutTemplate className="w-5 h-5" />
                  </span>
                  <span className="uppercase text-sm tracking-widest">Projects</span>
                  <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-8">
                  {cv.projects.map(proj => (
                    <div key={proj.id}>
                      <div className="flex flex-col sm:flex-row justify-between mb-2 sm:items-baseline">
                        <h4 className="text-lg font-medium text-foreground">
                          {proj.name} 
                          {proj.role && <span className="text-muted font-normal text-base ml-2">| {proj.role}</span>}
                        </h4>
                        <span className="text-sm text-muted tabular-nums whitespace-nowrap hidden sm:block">
                          {proj.date}
                        </span>
                      </div>
                      
                      {proj.tech && proj.tech.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {proj.tech.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold print:bg-transparent print:border print:border-gray-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <ul className="list-disc list-outside ml-4 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-1.5">
                        {proj.bulletPoints?.map((point, idx) => (
                          <li key={idx} className="pl-1">{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {(!cv.sections || cv.sections.length === 0) && cv.education && cv.education.length > 0 && (
              <section>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </span>
                  <span className="uppercase text-sm tracking-widest">Education</span>
                  <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-6">
                  {cv.education.map(edu => (
                    <div key={edu.id}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                        <h4 className="text-base font-medium text-foreground">{edu.degree}</h4>
                        <span className="text-sm text-muted tabular-nums whitespace-nowrap">
                          {edu.date}
                        </span>
                      </div>
                      <div className="text-primary font-medium text-sm print:text-gray-700">{edu.school}</div>
                      
                      {edu.description && edu.description.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-2 text-muted text-sm leading-relaxed whitespace-pre-line print:text-black space-y-1">
                          {edu.description.map((desc, idx) => (
                            <li key={idx} className="pl-1">{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {(!cv.sections || cv.sections.length === 0) && cv.skills && (cv.skills.languages?.length > 0 || cv.skills.tools?.length > 0) && (
              <section>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Wrench className="w-5 h-5" />
                  </span>
                  <span className="uppercase text-sm tracking-widest">Skills</span>
                  <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="space-y-4">
                  {cv.skills.languages && cv.skills.languages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.languages.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-background border border-border rounded-md text-sm font-medium text-foreground print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cv.skills.tools && cv.skills.tools.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Tools & Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.tools.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-background border border-border rounded-md text-sm font-medium text-foreground print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {cv.skills.other && cv.skills.other.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Other</h4>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.other.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-background border border-border rounded-md text-sm font-medium text-foreground print:bg-transparent print:border-gray-400 print:text-black">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Certifications Base UI */}
            {(!cv.sections || cv.sections.length === 0) && cv.certifications && cv.certifications.length > 0 && (
              <section>
                <h3 className="flex items-center gap-3 text-xl font-bold mb-6 text-foreground tracking-wide print:text-black group">
                  <span className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Award className="w-5 h-5" />
                  </span>
                  <span className="uppercase text-sm tracking-widest">Certifications</span>
                  <div className="flex-1 h-px bg-border/60 ml-4 print:bg-gray-300"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cv.certifications.map(cert => (
                    <CertificationItem key={cert.id} cert={cert} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const CertificationItem: React.FC<{ cert: Certification }> = ({ cert }) => {
  const isImage = cert.type === 'image' || (cert.url && cert.url.match(/\.(jpeg|jpg|gif|png|svg)(\?.*)?$/i));
  const isPdf = cert.type === 'pdf' || (cert.url && cert.url.toLowerCase().includes('.pdf'));

  return (
    <div className="flex flex-col gap-2 p-4 border border-border rounded-xl bg-background shadow-sm print:border-gray-300 print:bg-transparent">
      <div>
        <h4 className="text-sm font-medium text-foreground">{cert.name}</h4>
        <p className="text-xs text-muted mb-1">{cert.issuer}</p>
      </div>
      {cert.url && (
        <div className="mt-2 print:hidden">
          {isImage ? (
            <a href={cert.url} target="_blank" rel="noreferrer" className="block w-fit rounded-md overflow-hidden border border-[#E5E7EB]">
              <img 
                src={cert.url} 
                alt={cert.name} 
                className="w-full max-h-[120px] object-cover hover:scale-105 transition-transform duration-300" 
                loading="lazy" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="p-4 text-sm font-medium text-muted bg-muted/20">Preview not available. Click to view.</div>');
                }}
              />
            </a>
          ) : isPdf ? (
            <div className="w-full border border-border rounded-md overflow-hidden bg-muted/10 relative group">
              <iframe 
                src={cert.url} 
                className="w-full h-[300px]" 
                loading="lazy" 
                title={cert.name}
              >
                <p className="p-4 text-sm text-muted">Preview not available. <a href={cert.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download PDF</a></p>
              </iframe>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={cert.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur border border-border rounded-md shadow-sm text-sm font-medium hover:bg-background">
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>
          ) : (
            <a href={cert.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-1 text-sm text-primary hover:underline">
              <ExternalLink className="w-3 h-3" />
              View Certificate
            </a>
          )}
        </div>
      )}
    </div>
  );
}
