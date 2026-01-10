
import React, { useState } from 'react';
import { Upload, CheckCircle, Layout, FileText, User, Briefcase, Code } from 'lucide-react';
import PortfolioPreview from './PortfolioPreview';

export default function PortfolioBuilder() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonFilename, setJsonFilename] = useState('');
  const [generatedHtmlFile, setGeneratedHtmlFile] = useState('');

  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(false);

  // Fetch portfolios on load or when switching to dashboard
  React.useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchPortfolios();
    }
  }, [currentPage]);

  const fetchPortfolios = async () => {
    setIsLoadingPortfolios(true);
    try {
      const response = await fetch('/api/portfolios');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios', error);
    } finally {
      setIsLoadingPortfolios(false);
    }
  };

  const handleEditPortfolio = async (id: string, _filename: string) => {
    // We treat the filename as the ID for Mongo entries now, or we need to handle the load correctly
    // The current backend get_portfolio_data handles ID passed as filename
    setJsonFilename(`${id}.json`);

    try {
      const response = await fetch(`/api/portfolio/${id}.json`);
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        setCurrentPage('edit');
      } else {
        alert("Failed to load portfolio data");
      }
    } catch (e) {
      alert("Error loading portfolio");
    }
  };

  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    mobile: '',
    portfolio_summary: '',
    experience: [] as { title: string; company: string; dates: string; description: string }[],
    education: [] as { name: string; institution: string; dates: string }[],
    skills: [] as string[],
    projects: [] as { name: string; description: string; tech: string }[]
  });
  const [selectedLayout, setSelectedLayout] = useState('');
  const [showAllLayouts, setShowAllLayouts] = useState(false);

  const ALL_LAYOUTS = ['minimal', 'modern', 'creative', 'professional', 'glass', 'neon'];
  const visibleLayouts = showAllLayouts ? ALL_LAYOUTS : ALL_LAYOUTS.slice(0, 4);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessResume = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('resume', uploadedFile);

    try {
      const response = await fetch('/api/process-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Read body once as text
        try {
          const errorJson = JSON.parse(errorText); // Then try to parse the text
          throw new Error(errorJson.error || errorJson.message || 'Failed to process resume.');
        } catch (e) {
          // If parsing fails, the error is the raw text itself
          throw new Error(`Server returned a non - JSON error(status ${response.status}): \n${errorText} `);
        }
      }

      const result = await response.json();
      setResumeData(result.data);
      setJsonFilename(result.filename);
      setCurrentPage('edit');

    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.message);
    }
  };

  const handleUpdateField = (field: keyof typeof resumeData, value: string | string[]) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldUpdate = (field: 'experience' | 'education' | 'projects', index: number, key: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const handleSaveAndPreview = async () => {
    if (!selectedLayout) {
      alert('Please select a layout');
      return;
    }
    if (!jsonFilename) {
      alert('Something went wrong, no filename to save to.');
      return;
    }

    try {
      // Step 1: Save the JSON data
      const saveResponse = await fetch(`/api/portfolio/${jsonFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save portfolio.');
      }

      // Step 2: Trigger HTML generation
      const generateResponse = await fetch(`/api/generate-html/${jsonFilename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: selectedLayout }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate HTML file.');
      }

      const generateResult = await generateResponse.json();
      setGeneratedHtmlFile(generateResult.generated_file);

      setCurrentPage('preview');
    } catch (error: any) {
      console.error('Error in final step:', error);
      alert(error.message);
    }
  };




  // Dashboard Page
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">My Portfolios</h1>
              <p className="text-gray-400">Manage and edit your generated portfolios</p>
            </div>
            <button
              onClick={() => setCurrentPage('upload')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-xs">+</div>
              Create New
            </button>
          </div>

          {isLoadingPortfolios ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Card (optional convenience) */}
              <div
                onClick={() => setCurrentPage('upload')}
                className="group cursor-pointer bg-white/5 border-2 border-dashed border-purple-500/30 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px] hover:border-purple-400 hover:bg-white/10 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200">Create New</h3>
                <p className="text-sm text-gray-500 mt-2">Upload a resume to start</p>
              </div>

              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="bg-purple-900/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all hover:-translate-y-1">

                  <div className="h-40 bg-gradient-to-br from-purple-900/50 to-black p-6 flex flex-col justify-end">
                    <span className="inline-block px-3 py-1 bg-black/40 rounded-full text-xs text-purple-300 w-fit mb-2">
                      {new Date(portfolio.created_at).toLocaleDateString()}
                    </span>
                    <h3 className="text-xl font-bold text-white truncate">{portfolio.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6">
                      {portfolio.preview_data.title || "No summary available."}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditPortfolio(portfolio.id, "")}
                        className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors border border-purple-500/30"
                      >
                        Edit
                      </button>
                      <a
                        href={`/p/${portfolio.id}.html`} // Assumption: generate-html uses ID logic or we need to regen. 
                        // Actually backend generate-html route takes filename. For simplicity, we might force regen or just Edit. 
                        // Let's stick to Edit for now as Primary action.
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-white/10"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingPortfolios && portfolios.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p>You haven't created any portfolios yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Upload Page
  if (currentPage === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">

            <button
              onClick={() => setCurrentPage('dashboard')}
              className="mb-8 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to Dashboard
            </button>

            <div className="bg-purple-900/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-purple-500/30 text-center mb-8">
              <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Upload Your Resume</h2>
              <p className="text-gray-400">Support for PDF, DOC, DOCX formats</p>
            </div>

            <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <FileText className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <p className="text-lg mb-2">Click to browse or drag and drop</p>
                <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-6 p-4 bg-purple-800/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>{uploadedFile.name}</span>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            )}

            <button
              onClick={handleProcessResume}
              disabled={!uploadedFile}
              className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition-all"
            >
              Process Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit & Layout Selection Page
  if (currentPage === 'edit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setCurrentPage('upload')}
            className="mb-6 text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Upload
          </button>

          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Review & Customize</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Form Section */}
            <div className="space-y-6">
              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-400" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={resumeData.name}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <input
                    type="email"
                    value={resumeData.email}
                    onChange={(e) => handleUpdateField('email', e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                  />
                  <input
                    type="tel"
                    value={resumeData.mobile}
                    onChange={(e) => handleUpdateField('mobile', e.target.value)}
                    placeholder="Phone"
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-4">Summary</h3>
                <textarea
                  value={resumeData.portfolio_summary}
                  onChange={(e) => handleUpdateField('portfolio_summary', e.target.value)}
                  placeholder="Professional summary"
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
                  Experience
                </h3>
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="space-y-3 mb-4 p-4 bg-black/30 rounded-lg">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleArrayFieldUpdate('experience', i, 'title', e.target.value)}
                      placeholder="Job Title"
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayFieldUpdate('experience', i, 'company', e.target.value)}
                      placeholder="Company"
                      className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2 text-purple-400" />
                  Skills
                </h3>
                <input
                  type="text"
                  value={resumeData.skills.join(', ')}
                  onChange={(e) => handleUpdateField('skills', e.target.value.split(', '))}
                  placeholder="JavaScript, React, Node.js..."
                  className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            {/* Layout Selection Section */}
            <div>
              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 sticky top-8">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Layout className="w-5 h-5 mr-2 text-purple-400" />
                  Choose Your Layout
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {visibleLayouts.map((layout) => (
                    <button
                      key={layout}
                      onClick={() => setSelectedLayout(layout)}
                      className={`p - 4 rounded - lg border - 2 transition - all ${selectedLayout === layout
                        ? 'border-purple-400 bg-purple-600/20'
                        : 'border-purple-500/30 hover:border-purple-400/50'
                        } `}
                    >
                      <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-black rounded mb-2 p-2 relative overflow-hidden">
                        {/* Dynamic Preview Placeholder based on layout name */}
                        {layout === 'minimal' && <div className="h-full bg-purple-800/30 rounded"></div>}
                        {layout === 'modern' && <div className="h-full flex gap-1"><div className="w-1/3 bg-purple-800/30 rounded"></div><div className="flex-1 bg-purple-800/30 rounded"></div></div>}
                        {layout === 'creative' && <div className="grid grid-cols-2 gap-1 h-full"><div className="bg-purple-800/30 rounded"></div><div className="bg-purple-800/30 rounded"></div></div>}
                        {layout === 'professional' && <div className="space-y-1"><div className="h-2 bg-purple-800/30 rounded"></div><div className="h-2 bg-purple-800/30 rounded"></div><div className="h-2 bg-purple-800/30 rounded"></div></div>}
                        {layout === 'glass' && (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-[2px] rounded border border-white/20"></div>
                          </div>
                        )}
                        {layout === 'neon' && (
                          <div className="h-full bg-black flex items-center justify-center border border-green-500/50">
                            <div className="text-[8px] text-green-400 font-mono">&gt; HELLO</div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium capitalize">{layout}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAllLayouts(!showAllLayouts)}
                  className="w-full py-2 mb-6 text-sm text-purple-300 hover:text-white transition-colors flex items-center justify-center gap-2 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10"
                >
                  {showAllLayouts ? 'Show Less Styles' : 'Show More Styles'}
                </button>

                {selectedLayout && (
                  <div className="p-4 bg-purple-800/20 rounded-lg mb-6">
                    <CheckCircle className="w-5 h-5 text-green-400 inline mr-2" />
                    <span className="text-sm">Layout selected: <span className="font-semibold capitalize">{selectedLayout}</span></span>
                  </div>
                )}

                <button
                  onClick={handleSaveAndPreview}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-lg font-semibold transition-all"
                >
                  Create Website
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview/Success Page
  if (currentPage === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
        <div className="container mx-auto px-4 py-16">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="mb-8 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Dashboard
          </button>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block p-4 bg-green-600/20 rounded-full mb-6">
              <CheckCircle className="w-20 h-20 text-green-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Portfolio is Ready!</h2>
            <p className="text-xl text-gray-300 mb-8">
              Your portfolio website has been created successfully with the {selectedLayout} layout.
            </p>
            <div className="text-left mb-8">
              <PortfolioPreview data={resumeData} layout={selectedLayout} />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/p/${generatedHtmlFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-purple-900/40 hover:bg-purple-900/60 rounded-xl font-semibold transition-all border border-purple-500/30"
              >
                View Website Link
              </a>
              <a
                href={`/download/${generatedHtmlFile}`}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all"
              >
                Download Website
              </a>
              <button
                onClick={() => {
                  setCurrentPage('dashboard');
                  setUploadedFile(null);
                  setGeneratedHtmlFile('');
                  setJsonFilename('');
                  setResumeData({
                    name: '',
                    email: '',
                    mobile: '',
                    portfolio_summary: '',
                    experience: [],
                    education: [],
                    skills: [],
                    projects: []
                  });
                }}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
