import { Canvas } from '@react-three/fiber';
import FBOParticleSphere from './FBOParticleSphere';
import SplashCursor from './SplashCursor';

export default function LoadingParticleScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden">
      {/* Interactive Fluid Background */}
      <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={768}
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={1}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={10}
      />

      {/* 3D Canvas Context */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} gl={{ alpha: true }}>
          <FBOParticleSphere />
        </Canvas>
      </div>

      {/* Text Overlay */}
      <div className="z-10 text-center pointer-events-none mt-[40vh]">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse">
          Parsing Resume
        </h2>
        <p className="text-gray-300 text-lg flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
          Extracting and structuring your professional journey...
        </p>
      </div>
    </div>
  );
}
