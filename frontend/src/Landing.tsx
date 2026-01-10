import { Upload, Layout, Sparkles, FileText, ArrowRight, UserCircle2 } from 'lucide-react';
import GradientBlinds from './GradientBlinds';

interface LandingProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

export default function Landing({ onLoginClick, onRegisterClick }: LandingProps) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Navigation Header */}
            <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <span className="font-bold text-xl tracking-tight">PortX</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onLoginClick}
                        className="px-6 py-2 rounded-full font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                        Log In
                    </button>
                    <button
                        onClick={onRegisterClick}
                        className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                    <GradientBlinds
                        gradientColors={['#FF9FFC', '#5227FF']}
                        angle={1}
                        noise={0}
                        blindCount={36}
                        blindMinWidth={50}
                        spotlightRadius={0.5}
                        spotlightSoftness={1}
                        spotlightOpacity={1}
                        mouseDampening={0.3}
                        distortAmount={27}
                        shineDirection="left"
                        mixBlendMode="lighten"
                    />
                </div>

                <div className="text-center space-y-8 max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full mb-4 animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-200">AI-Powered Portfolio Builder</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x">
                            Build Your Legacy
                        </span>
                        <br />
                        <span className="text-white mt-2 block">In Minutes</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Transform your resume into a stunning, professional portfolio website.
                        No coding required. Just upload and shine.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
                        <button
                            onClick={onRegisterClick}
                            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10">Get Started Free</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <button
                            onClick={onLoginClick}
                            className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-full text-xl font-semibold transition-all hover:bg-white/10 hover:border-purple-500/50 flex items-center justify-center gap-2"
                        >
                            <UserCircle2 className="w-5 h-5 text-purple-400" />
                            <span>Member Login</span>
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10">
                    <div className="group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                            <Upload className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Upload Resume</h3>
                        <p className="text-gray-400 leading-relaxed">Simply upload your PDF or DOCX resume. Our AI extracts your details instantly.</p>
                    </div>

                    <div className="group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1 delay-100">
                        <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                            <FileText className="w-7 h-7 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">AI Enhancement</h3>
                        <p className="text-gray-400 leading-relaxed">Our advanced AI polishes your content and structures it for maximum impact.</p>
                    </div>

                    <div className="group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1 delay-200">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <Layout className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">Premium Layouts</h3>
                        <p className="text-gray-400 leading-relaxed">Choose from our collection of stunning, responsive designs tailored for professionals.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
