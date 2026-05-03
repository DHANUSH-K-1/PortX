
import React, { useState } from 'react';
import { Upload, CheckCircle, Layout, FileText, User, Briefcase, Code, Loader2, Plus, Trash2, Camera, ImageIcon } from 'lucide-react';
import PortfolioPreview from './PortfolioPreview';

export default function PortfolioBuilder() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jsonFilename, setJsonFilename] = useState('');
  const [generatedHtmlFile, setGeneratedHtmlFile] = useState('');
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const playDeleteSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create 200ms of noise for the "crumple/swoosh"
      const bufferSize = audioCtx.sampleRate * 0.2; 
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
      
      // Highpass filter for that crisp iOS 'paper' sound
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1200;
      
      // Sharp, quick envelope
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      
      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      noiseSource.start();
    } catch (e) {
      console.warn("AudioContext not supported", e);
    }
  };

  const confirmDeletePortfolio = async () => {
    if (!portfolioToDelete) return;
    const { id } = portfolioToDelete;
    
    setIsDeleting(id);
    setPortfolioToDelete(null);
    playDeleteSound();

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch(`/api/portfolio/${id}.json/delete`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPortfolios(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Failed to delete portfolio");
      }
    } catch (e) {
      alert("Error deleting portfolio");
    } finally {
      setIsDeleting(null);
    }
  };

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
    profile_photo: '',
    portfolio_summary: '',
    experience: [] as { title: string; company: string; dates: string; description: string }[],
    education: [] as { name: string; institution: string; dates: string }[],
    skills: [] as (string | { name: string; level: number })[],
    projects: [] as { name: string; description: string; tech: string; link?: string }[]
  });
  const [selectedLayout, setSelectedLayout] = useState('');
  const [showAllLayouts, setShowAllLayouts] = useState(false);
  const [editStep, setEditStep] = useState<1 | 2>(1);
  const [showAdvancedSkills, setShowAdvancedSkills] = useState(false);

  const ALL_LAYOUTS = [
    // Developer
    { id: 'developer', name: 'Software Engineer', category: 'Developer' },
    { id: 'terminal', name: 'Hacker Terminal', category: 'Developer' },
    { id: 'cyberpunk', name: 'Cyberpunk', category: 'Developer' },
    { id: 'dark', name: 'Dark Mode', category: 'Developer' },
    { id: 'modern', name: 'Modern', category: 'Developer' },
    { id: '3d', name: '3D Interactive', category: 'Developer' },
    { id: 'space', name: 'Galaxy', category: 'Developer' },
    
    // Creative
    { id: 'creative', name: 'Creative Agency', category: 'Creative' },
    { id: 'designer', name: 'UI/UX Designer', category: 'Creative' },
    { id: 'glass', name: 'Glassmorphism', category: 'Creative' },
    { id: 'glass2', name: 'Glassmorphism 2.0', category: 'Creative' },
    { id: 'playful', name: 'Playful UI', category: 'Creative' },
    { id: 'brand', name: 'Brand Story', category: 'Creative' },
    { id: 'story_v2', name: 'Visual Storyteller', category: 'Creative' },
    
    // Professional
    { id: 'professional', name: 'Corporate Executive', category: 'Professional' },
    { id: 'resume', name: 'Digital Resume', category: 'Professional' },
    { id: 'cards', name: 'Bento Grid', category: 'Professional' },
    { id: 'minimal', name: 'Ultra Minimal', category: 'Professional' },
    { id: 'impact', name: 'High Impact', category: 'Professional' },
    { id: 'dashboard', name: 'Dashboard Portfolio', category: 'Professional' },
    { id: 'portfolio', name: 'Portfolio Standard', category: 'Professional' },
    { id: 'portfolio_1', name: 'Portfolio Template 1', category: 'Professional' },
    { id: 'portfolio_2', name: 'Portfolio Template 2', category: 'Professional' },
    { id: 'portfolio_standalone', name: 'Portfolio Standalone', category: 'Professional' },
    
    // Media
    { id: 'photographer', name: 'Lens Master', category: 'Media' },
    { id: 'magazine', name: 'Editorial', category: 'Media' },
    { id: 'nature', name: 'Organic', category: 'Media' },
    { id: 'neon', name: 'Neon Lights', category: 'Media' }
  ];

  const categories = ['All', 'Developer', 'Creative', 'Professional', 'Media'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLayouts = ALL_LAYOUTS.filter(layout => {
    const matchesCategory = selectedCategory === 'All' || layout.category === selectedCategory;
    const matchesSearch = layout.name.toLowerCase().includes(searchQuery.toLowerCase()) || layout.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleLayouts = showAllLayouts ? filteredLayouts : filteredLayouts.slice(0, 4);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await fetch('/api/upload-photo', { method: 'POST', body: formData });
      if (!response.ok) {
        const err = await response.json();
        alert(err.error || 'Photo upload failed');
        return;
      }
      const result = await response.json();
      handleUpdateField('profile_photo', result.url);
    } catch (err) {
      alert('Photo upload error. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      // Reset input so same file can be re-picked
      e.target.value = '';
    }
  };

  const handleProcessResume = async () => {
    if (!uploadedFile) return;

    setIsProcessingResume(true);
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
    } finally {
      setIsProcessingResume(false);
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

  const addArrayItem = (field: 'experience' | 'education' | 'projects') => {
    const newItem = field === 'experience'
      ? { title: '', company: '', dates: '', description: '' }
      : field === 'education'
        ? { name: '', institution: '', dates: '' }
        : { name: '', description: '', tech: '', link: '' };

    setResumeData(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const removeArrayItem = (field: 'experience' | 'education' | 'projects', index: number) => {
    setResumeData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
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
                <div key={portfolio.id} className={`bg-purple-900/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all hover:-translate-y-1 ${isDeleting === portfolio.id ? 'sand-wash-out' : ''}`}>

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
                      <button
                        onClick={(e) => { e.stopPropagation(); setPortfolioToDelete({ id: portfolio.id, name: portfolio.name }); }}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/30 group-hover:border-red-500/50"
                        title="Delete Portfolio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

          {/* Delete Confirmation Modal */}
          {portfolioToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-purple-950/80 border border-purple-500/40 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/20 animate-fade-in-up">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Trash2 className="w-6 h-6 text-red-500" />
                  Delete Portfolio?
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-purple-300">{portfolioToDelete.name}</span>? This action cannot be undone and the portfolio will be permanently removed.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setPortfolioToDelete(null)}
                    className="px-5 py-2.5 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePortfolio}
                    className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
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
              disabled={!uploadedFile || isProcessingResume}
              className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              {isProcessingResume ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Resume'
              )}
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

          {/* Stepper Header */}
          <div className="max-w-3xl mx-auto mb-12 flex items-center justify-center space-x-12 relative">
            <div className={`flex flex-col items-center z-10 ${editStep === 1 ? 'text-purple-400' : 'text-purple-500/50 cursor-pointer'}`} onClick={() => setEditStep(1)}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 transition-all duration-300 ${editStep === 1 ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110' : 'bg-purple-900/40 text-purple-400 border border-purple-500/30'}`}>1</div>
              <span className="text-sm font-semibold tracking-wider uppercase">Content</span>
            </div>
            {/* Connecting line */}
            <div className="absolute top-6 left-[50%] -translate-x-[50%] -translate-y-1/2 w-32 md:w-48 h-1 bg-purple-900/40 -z-0">
              <div className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${editStep === 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className={`flex flex-col items-center z-10 ${editStep === 2 ? 'text-purple-400 cursor-pointer' : 'text-purple-500/50 cursor-pointer'}`} onClick={() => { if (resumeData.name || true) setEditStep(2) }}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 transition-all duration-300 ${editStep === 2 ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110' : 'bg-purple-900/40 text-purple-400 border border-purple-500/30'}`}>2</div>
              <span className="text-sm font-semibold tracking-wider uppercase">Design</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Form Section */}
            {editStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
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
                    {/* Profile Photo Upload */}
                    <div className="flex items-center gap-4 p-3 bg-black/30 border border-purple-500/20 rounded-lg">
                      {/* Live preview */}
                      <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40 bg-black/50 flex items-center justify-center">
                        {resumeData.profile_photo ? (
                          <img src={resumeData.profile_photo} alt="Profile preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-purple-500/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-300 mb-1">Profile Photo</p>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-colors">
                          {isUploadingPhoto ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          ) : (
                            <><Camera className="w-4 h-4" /> {resumeData.profile_photo ? 'Change Photo' : 'Upload Photo'}</>
                          )}
                          <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                        </label>
                        {resumeData.profile_photo && (
                          <button onClick={() => handleUpdateField('profile_photo', '')} className="ml-2 text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                        )}
                        <p className="text-xs text-purple-500/60 mt-1">PNG, JPG, WEBP up to any size</p>
                      </div>
                    </div>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-purple-400" />
                      Experience
                    </h3>
                    <button
                      onClick={() => addArrayItem('experience')}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group">
                      <button
                        onClick={() => removeArrayItem('experience', i)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-400" />
                      Education
                    </h3>
                    <button
                      onClick={() => addArrayItem('education')}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group">
                      <button
                        onClick={() => removeArrayItem('education', i)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={edu.name}
                        onChange={(e) => handleArrayFieldUpdate('education', i, 'name', e.target.value)}
                        placeholder="Degree/Certificate"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleArrayFieldUpdate('education', i, 'institution', e.target.value)}
                        placeholder="Institution"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Code className="w-5 h-5 mr-2 text-purple-400" />
                      Projects
                    </h3>
                    <button
                      onClick={() => addArrayItem('projects')}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group">
                      <button
                        onClick={() => removeArrayItem('projects', i)}
                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleArrayFieldUpdate('projects', i, 'name', e.target.value)}
                        placeholder="Project Name"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                      <textarea
                        value={proj.description}
                        onChange={(e) => handleArrayFieldUpdate('projects', i, 'description', e.target.value)}
                        placeholder="Project Description"
                        rows={2}
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => handleArrayFieldUpdate('projects', i, 'tech', e.target.value)}
                        placeholder="Technologies (e.g. React, Node.js)"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => handleArrayFieldUpdate('projects', i, 'link', e.target.value)}
                        placeholder="Project Link (Optional)"
                        className="w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h3 className="text-xl font-semibold flex items-center">
                      <Layout className="w-5 h-5 mr-2 text-purple-400" />
                      Skills
                    </h3>
                    <label className="flex items-center space-x-2 text-sm text-purple-300 cursor-pointer hover:text-purple-200 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={showAdvancedSkills}
                        onChange={(e) => setShowAdvancedSkills(e.target.checked)}
                        className="rounded border-purple-500/30 text-purple-600 bg-black/50 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent"
                      />
                      <span>Adjust skill levels (optional)</span>
                    </label>
                  </div>
                  
                  <input
                    type="text"
                    value={resumeData.skills.map(s => typeof s === 'string' ? s : s.name).join(', ')}
                    onChange={(e) => {
                      const names = e.target.value.split(',').map(s => s.trimStart());
                      const newSkills = names.map(name => {
                         const existing = resumeData.skills.find(s => (typeof s === 'string' ? s : s.name).trim() === name.trim());
                         return existing || name;
                      });
                      handleUpdateField('skills', newSkills.filter(n => typeof n === 'string' ? n !== '' : n.name !== ''));
                    }}
                    placeholder="JavaScript, React, Node.js..."
                    className={`w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors ${showAdvancedSkills ? 'mb-4' : ''}`}
                  />

                  {showAdvancedSkills && resumeData.skills.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-purple-500/30 mt-4">
                      {resumeData.skills.map((skill, idx) => {
                        const name = typeof skill === 'string' ? skill : skill.name;
                        const level = typeof skill === 'string' ? 80 : skill.level;
                        return (
                          <div key={idx} className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                            <span className="w-1/3 truncate text-sm font-medium text-gray-200">{name}</span>
                            <div className="flex-1 flex items-center gap-3">
                              <input 
                                type="range" 
                                min="10" 
                                max="100" 
                                step="5"
                                value={level}
                                onChange={(e) => {
                                  const newLevel = parseInt(e.target.value);
                                  const updatedSkills = [...resumeData.skills];
                                  updatedSkills[idx] = { name, level: newLevel };
                                  handleUpdateField('skills', updatedSkills);
                                }}
                                className="w-full h-1.5 bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-purple-400"
                              />
                              <span className="text-xs font-semibold text-purple-300 w-10 text-right">{level}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Next Button */}
                <div className="pt-8 flex justify-end">
                  <button
                    onClick={() => setEditStep(2)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  >
                    Next: Choose Design →
                  </button>
                </div>
              </div>
            )}

            {/* Layout Selection Section */}
            {editStep === 2 && (
              <div className="animate-fade-in-up">
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 min-h-[600px] flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-8 flex items-center justify-center">
                    <Layout className="w-8 h-8 mr-3 text-purple-400" />
                    Choose Your Layout
                  </h3>

                  {/* Search & Filter Toolbar */}
                  <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-purple-500/20">
                    <div className="w-full xl:w-1/3 relative">
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-11 bg-black/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 transition-colors text-sm"
                      />
                      <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide snap-x">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border snap-center ${selectedCategory === cat ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-purple-900/30 text-gray-300 border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-800/40'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 flex-1">
                    {visibleLayouts.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setSelectedLayout(layout.id)}
                        className={`p-4 rounded-xl border-2 transition-all group text-left flex flex-col ${selectedLayout === layout.id
                          ? 'border-purple-400 bg-purple-600/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]'
                          : 'border-purple-500/20 bg-black/20 hover:border-purple-400/50 hover:bg-purple-900/20 hover:-translate-y-1'
                          }`}
                      >
                        <div className="w-full aspect-video bg-gradient-to-br from-purple-900/50 to-black rounded-lg mb-4 relative overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-400/50 transition-all">
                          {/* Dynamic Thumbnail Preview */}
                          <img 
                            src={`/thumbnails/${layout.id}.jpg`} 
                            alt={`${layout.name} Preview`}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzYjA3NjQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2Q4YjRmZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5QcmV2aWV3IHVucmVhZHk8L3RleHQ+PC9zdmc+';
                            }}
                          />

                          {/* Select Overlay */}
                          <div className={`absolute inset-0 bg-purple-600/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${selectedLayout === layout.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                            <span className="text-white font-semibold flex items-center justify-center gap-2">Select Template</span>
                          </div>
                        </div>
                        <div className="w-full">
                          <h4 className="text-base font-bold text-white mb-1 truncate w-full">{layout.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded border bg-purple-500/10 text-purple-300 border-purple-500/20 whitespace-nowrap">{layout.category}</span>
                        </div>
                      </button>
                    ))}

                    {visibleLayouts.length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-black/20 rounded-xl border border-dashed border-purple-500/30">
                        <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <h4 className="text-lg font-medium text-gray-400">No templates found</h4>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or category filters.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowAllLayouts(!showAllLayouts)}
                    className="w-full max-w-sm mx-auto block py-3 mb-8 text-sm text-purple-300 hover:text-white transition-colors flex items-center justify-center gap-2 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10"
                  >
                    {showAllLayouts ? 'Show Less Styles' : 'Show More Styles'}
                  </button>

                  {selectedLayout && (
                    <div className="p-4 bg-purple-800/20 rounded-lg mb-8 max-w-md mx-auto text-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                      <CheckCircle className="w-5 h-5 text-green-400 inline mr-2" />
                      <span className="text-sm tracking-wide">Layout selected: <span className="font-semibold capitalize text-green-300">{selectedLayout}</span></span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-8 border-t border-purple-500/30">
                    <button
                      onClick={() => setEditStep(1)}
                      className="w-full sm:w-auto px-8 py-4 bg-purple-900/40 hover:bg-purple-900/60 rounded-xl text-lg font-semibold transition-all border border-purple-500/30"
                    >
                      ← Back to Content
                    </button>
                    <button
                      onClick={handleSaveAndPreview}
                      className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    >
                      Create Website
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    profile_photo: '',
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
