import React from 'react';

interface ResumeData {
  name: string;
  email: string;
  mobile?: string;
  portfolio_summary?: string;
  skills: string[];
  education: { name?: string; institution?: string; dates?: string }[];
  experience: { title?: string; company?: string; dates?: string; description?: string }[];
  projects?: { name?: string; description?: string; tech?: string }[];
}

interface PortfolioPreviewProps {
  data: ResumeData;
  layout: string;
}

const PortfolioPreview: React.FC<PortfolioPreviewProps> = ({ data, layout }) => {
  // Using a single, polished layout for all selections for now.
  // The 'layout' prop is kept for future expansion.
  return (
    <div className="p-8 bg-gray-800/50 text-white rounded-lg shadow-lg backdrop-blur-sm border border-purple-500/30">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-300">{data.name || 'Your Name'}</h1>
        <p className="text-lg text-gray-300">{data.email || 'your.email@example.com'} | {data.mobile || 'Your Phone'}</p>
      </header>
      
      {data.portfolio_summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4">Summary</h2>
          <p className="text-gray-300">{data.portfolio_summary}</p>
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="bg-purple-600/50 text-white px-3 py-1 rounded-full text-sm">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {data.experience && data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4">Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4 bg-black/20 p-4 rounded-lg">
              <h3 className="text-xl font-bold text-purple-300">{exp.title} at {exp.company}</h3>
              {exp.dates && <p className="text-sm text-gray-400">{exp.dates}</p>}
              {exp.description && <p className="text-gray-300 mt-2">{exp.description}</p>}
            </div>
          ))}
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4">Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-xl font-bold">{edu.name}</h3>
              {(edu.institution || edu.dates) && <p className="text-sm text-gray-400">{edu.institution} | {edu.dates}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default PortfolioPreview;
