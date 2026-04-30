import React, { useRef, useState } from 'react';
import { useCVs } from '../store/CVContext';
import { Link } from 'react-router-dom';
import { Download, Upload, Trash2, Eye, Link as LinkIcon, Plus, FileJson } from 'lucide-react';
import LZString from 'lz-string';
import { CVData } from '../types';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { cvs, deleteCV, importCV } = useCVs();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importCV(content);
      if (success) {
        setError(null);
      } else {
        setError('Invalid CV JSON format.');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const exportJSON = (cv: CVData) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cv, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${cv.cvName || 'cv'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const copyShareLink = (cv: CVData) => {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(cv));
    const url = `${window.location.origin}/cv?data=${compressed}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(cv.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const generateTemplate = () => {
    const template: CVData = {
      id: Date.now().toString(),
      cvName: 'Software Engineer Template',
      lastUpdated: new Date().toISOString(),
      personalInfo: {
        name: 'Jane Doe',
        title: 'Senior Frontend Engineer',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        links: [{ label: 'GitHub', url: 'https://github.com' }]
      },
      summary: 'Passionate frontend developer with 5+ years of experience building scalable web applications.',
      experience: [
        {
          id: 'exp1',
          company: 'Tech Corp',
          position: 'Frontend Engineer',
          date: '2021-01 - Present',
          details: ['Led the revamp of the main dashboard using React and Tailwind CSS.', 'Improved rendering performance by 30%.']
        }
      ],
      projects: [
        {
          id: 'proj1',
          name: 'Dashboard App',
          tech: ['React', 'TypeScript', 'Tailwind'],
          bulletPoints: ['Built a minimal dashboard for monitoring analytics.', 'Integrated real-time sockets.']
        }
      ],
      education: [
        {
          id: 'edu1',
          school: 'State University',
          degree: 'B.S. Computer Science',
          date: '2016 - 2020',
          description: ['Graduated with honors.']
        }
      ],
      skills: {
        languages: ['TypeScript', 'JavaScript', 'HTML/CSS'],
        tools: ['React', 'Node.js', 'Tailwind CSS']
      },
      certifications: []
    };
    importCV(JSON.stringify(template));
  };


  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.json')) {
      setError('Please drop a valid JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importCV(content);
      if (success) {
        setError(null);
      } else {
        setError('Invalid CV JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className={cn("space-y-8 animate-in fade-in duration-500 rounded-xl transition-all", isDragging && "ring-2 ring-primary ring-offset-4 ring-offset-background")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Resumes</h1>
          <p className="text-muted mt-1">Manage, view, and share your CVs</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:border-primary/50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Import JSON</span>
          </button>
          
          <button 
            onClick={generateTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Template</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl pointer-events-none">
          <FileJson className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No resumes found</h3>
          <p className="text-muted mt-2 max-w-sm mx-auto">
            Drop your CV JSON file here, click Import JSON, or generate a template to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map(cv => (
            <div key={cv.id} className="group relative bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30">
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-foreground truncate" title={cv.cvName}>{cv.cvName}</h3>
                <p className="text-muted text-sm mt-1">{cv.personalInfo.title}</p>
                <div className="mt-4 text-xs text-muted">
                  Updated: {new Date(cv.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <Link 
                  to={`/cv/${cv.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyShareLink(cv)}
                    className="p-2 text-muted hover:text-foreground rounded-md hover:bg-background transition-colors"
                    title="Copy Share Link"
                  >
                    {copiedId === cv.id ? (
                      <span className="text-xs text-green-600 font-medium">Copied!</span>
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => exportJSON(cv)}
                    className="p-2 text-muted hover:text-foreground rounded-md hover:bg-background transition-colors"
                    title="Export JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteCV(cv.id)}
                    className="p-2 text-red-600/70 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete CV"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
