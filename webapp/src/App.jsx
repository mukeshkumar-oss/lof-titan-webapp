import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, Usb, Play, Square, RotateCcw, Upload, Terminal, Bot, Code, Cpu, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useDevice } from './bluetooth/useDevice';
import { projects } from './projects';
import { FirmwareFlasherModal } from './components/FirmwareFlasherModal';
import { Carousel } from './components/Carousel';
import { BlocklyIDE } from './components/BlocklyIDE';
import { AIAssistantIDE } from './components/AIAssistantIDE';
import { SerialMonitorModal } from './components/SerialMonitorModal';
import { ProjectStoreDetail } from './components/ProjectStoreDetail';
import Galaxy from './components/Galaxy';

const carouselItems = [
  {
    title: "Axes 3 DIY Kit",
    description: "Advanced multi-axis robotics system engineered for precision motion, intelligent telemetry, and autonomous mission control.",
    image: "/assets/banners/banner_axes3.png",
    badge: "DIY Robotics Kit",
    buttonText: "Explore Now"
  },
  {
    title: "Aqua Nova DIY Kit",
    description: "Build a fully functional sensing rover that detects motion and water to navigate unpredictable terrain and aquatic environments.",
    image: "/assets/banners/banner_aquanova_diy.png",
    badge: "DIY Sensing Kit",
    buttonText: "Explore Now"
  },
  {
    title: "Invisible Line Patrol DIY Kit",
    description: "UV light-following 4-bar linkage walking robot engineered for autonomous line detection and kinetic robotic locomotion.",
    image: "/assets/banners/banner_invisible_diy.png",
    badge: "DIY Walking Robot",
    buttonText: "Explore Now"
  },
  {
    title: "Heat Seek Rover DIY Kit",
    description: "Intelligent surrounding scanner with autonomous obstacle avoidance and integrated flame sensing technology for real-time fire detection.",
    image: "/assets/banners/banner_heatseek_diy.png",
    badge: "DIY Flame Rover",
    buttonText: "Explore Now"
  },
  {
    title: "Heart Beat DJ Bot DIY Kit",
    description: "Interactive musical bot that detects a person's heartbeat pulse and dynamically generates rhythmic tunes and music beats.",
    image: "/assets/banners/banner_heartbeat_diy.png",
    badge: "DIY Music Bot",
    buttonText: "Explore Now"
  }
];

function App() {
  const device = useDevice();
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const [code, setCode] = useState(projects[0].code);
  const [showCode, setShowCode] = useState(!projects[0].lesson);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [viewMode, setViewMode] = useState('dashboard');
  const [showFlasherModal, setShowFlasherModal] = useState(false);
  const [showSerialMonitor, setShowSerialMonitor] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showBlockCode, setShowBlockCode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef(null);

  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [device.consoleOutput, autoScroll]);

  const handleProjectSelect = (p) => {
    setSelectedProject(p);
    setCode(p.code);
    setShowCode(!p.lesson);
    setCurrentSlide(0);
    setCurrentChapter(0);
    setViewMode('project');
  };

  const handleUpload = async () => {
    setUploadProgress(0);
    try {
      await device.uploadProgram("main.py", code, setUploadProgress);
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + error.message);
    }
    setTimeout(() => setUploadProgress(null), 1000);
  };

  const handleOpenFlasher = async () => {
    if (device.connected) {
      await device.disconnect();
    }
    setShowFlasherModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#060911] text-white relative overflow-x-hidden">
      {/* Dynamic Interactive WebGL Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.2}
          glowIntensity={0.45}
          saturation={0.8}
          hueShift={200}
          speed={0.25}
          starSpeed={0.12}
          rotationSpeed={0.02}
          repulsionStrength={1.0}
          twinkleIntensity={0.25}
          transparent={true}
        />
      </div>

      {/* Navbar */}
      <nav className="glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between rounded-full sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <img src="/logo.webp" alt="Lab of Future" className="h-10 w-auto object-contain" />
          <h1 className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-white">
            LOF TITAN Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
              {device.deviceName || 'Device Status'}
            </span>
            <span className={`text-sm font-bold ${device.status === 'CONNECTED_IDLE' ? 'text-green-400' : 'text-primary-start'}`}>
              {device.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Dedicated Isolated Flash Firmware Button */}
            <button 
              onClick={() => setShowBlockCode(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300"
              title="Open Block Code Workspace"
            >
              <Code size={18} className="text-blue-400" />
              <span className="hidden xl:inline">Block Code</span>
            </button>
            <button 
              onClick={() => setShowSerialMonitor(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300"
              title="Open Serial Monitor"
            >
              <Terminal size={18} className="text-green-400" />
              <span className="hidden xl:inline">Serial Monitor</span>
            </button>
            <button 
              onClick={() => setShowAIAssistant(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300"
              title="Open AI Assistant"
            >
              <Bot size={18} className="text-orange-400" />
              <span className="hidden xl:inline">AI Assistant</span>
            </button>

            <button 
              onClick={handleOpenFlasher}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              title="Open Dedicated Firmware Flasher"
            >
              <Cpu size={18} className="text-purple-400" />
              <span>Flash Firmware</span>
            </button>

            {device.connected ? (
              <button 
                onClick={device.disconnect}
                className="flex items-center gap-2 px-5 py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-red-500/20 text-red-400 transition-all duration-300"
              >
                Disconnect
              </button>
            ) : (
              <>
                <button 
                  onClick={device.connectSerial}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-glow text-white"
                  title="Connect via USB Serial COM Port"
                >
                  <Usb size={18} />
                  Connect COM Port
                </button>

                <button 
                  onClick={device.connectBLE}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-primary-start to-primary-end hover:shadow-glow text-white"
                  title="Connect via Bluetooth LE"
                >
                  <Bluetooth size={18} />
                  Connect BLE
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full">
        
        {/* Left Column: Projects & Editor */}
        <div className="col-span-12 lg:col-span-12 flex flex-col gap-6">
          
          {viewMode === 'dashboard' && (
            <>
              <Carousel items={carouselItems} />

              {/* Play Store Style Projects Gallery */}
              <section className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                      <Cpu size={22} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-extrabold text-white">Project Store & DIY Robotics Kits</h2>
                      <p className="text-xs text-slate-400">Select a DIY model kit to start building, learning components, and flashing firmware</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                    {projects.length} Official Kits Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedProject(p);
                        setCode(p.code);
                        setViewMode('project');
                      }}
                      className="group rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {/* Top Thumbnail Showcase */}
                      <div className="w-full h-48 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center relative">
                        <img 
                          src={p.thumbnail || p.heroImage || '/assets/invisible-line/invisible_line_main.png'} 
                          alt={p.name}
                          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.target.src = '/assets/banners/banner_invisible_diy.png'; }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                            {p.badge || 'DIY Kit'}
                          </span>
                        </div>
                      </div>

                      {/* Info & Metadata */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <span>★</span>
                            <span>{p.rating || 4.9}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">{p.duration || '45 Mins'}</span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-purple-300">
                            {p.difficulty || 'Intermediate'}
                          </span>
                        </div>

                        <h3 className="font-heading font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors">
                          {p.name}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
                        <span>Explore Kit & Mission</span>
                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                          <ChevronRight size={15} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Dedicated Play Store Project Detail View */}
          {viewMode === 'project' && (
            <ProjectStoreDetail
              project={selectedProject}
              onBack={() => setViewMode('dashboard')}
              onUploadCode={async (codeToUpload) => {
                const src = codeToUpload || selectedProject.code;
                setCode(src);
                setUploadProgress(0);
                try {
                  await device.uploadProgram("main.py", src, setUploadProgress);
                } catch (error) {
                  console.error(error);
                  alert("Upload to TITAN failed: " + error.message);
                }
                setTimeout(() => setUploadProgress(null), 1000);
              }}
              onOpenBlockCode={() => setShowBlockCode(true)}
              onOpenSerialMonitor={() => setShowSerialMonitor(true)}
              device={device}
            />
          )}

        </div>

        </main>

      {/* Modals */}
      
      {/* Serial Monitor Modal */}
      {showSerialMonitor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
          <div className="relative w-full max-w-4xl h-[80vh] flex flex-col animate-fade-in-up glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/30 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowSerialMonitor(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Terminal className="text-green-400" />
                <h2 className="font-heading font-semibold text-lg hidden sm:block">Serial Monitor</h2>
                
                {/* Control Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => device.sendCommand('RUN')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors" title="Run User Code">
                    <Play size={14} /> Run
                  </button>
                  <button onClick={() => device.sendCommand('STOP')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors" title="Stop Execution">
                    <Square size={14} className="fill-current" /> Stop
                  </button>
                  <button onClick={() => device.sendCommand('RESET')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-colors" title="Soft Reset">
                    <RotateCcw size={14} /> Reset
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 flex items-center gap-2 text-sm" title="Auto-scroll" onClick={() => setAutoScroll(!autoScroll)}>
                  <div className={`w-2 h-2 rounded-full ${autoScroll ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span className="hidden sm:inline">Scroll</span>
                </button>
                <button onClick={device.clearConsole} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Clear Console">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-black p-4 font-mono text-sm overflow-y-auto relative" ref={consoleRef}>
              {!device.consoleOutput || device.consoleOutput.length === 0 ? (
                <div className="text-gray-600 italic">Waiting for data...</div>
              ) : (
                <pre className="text-green-400 whitespace-pre-wrap break-all">{device.consoleOutput}</pre>
              )}
            </div>
            {/* Input area */}
            <form 
              className="p-2 bg-surface/80 border-t border-white/10 shrink-0 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.elements.cmd;
                if(input.value) {
                  device.writeToSerial(input.value + '\r\n');
                  input.value = '';
                }
              }}
            >
              <input
                name="cmd"
                type="text"
                placeholder="Send to device..."
                className="flex-1 bg-[#0d1117] text-white p-2 rounded-lg border border-white/5 focus:outline-none focus:border-green-500/50 font-mono text-sm"
              />
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
          <div className="relative w-full max-w-4xl h-[80vh] flex flex-col animate-fade-in-up glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/30 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAIAssistant(false)} className="text-gray-400 hover:text-white mr-2"><Square size={16} className="fill-current"/></button>
                <Bot className="text-orange-400" />
                <h2 className="font-heading font-semibold">AI Assistant</h2>
              </div>
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <Bot size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">How can I help you?</h3>
              <p className="text-gray-400 max-w-md">I can explain code, suggest optimizations, or help you debug your hardware logic.</p>
            </div>
            <div className="p-4 border-t border-white/10 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-[#0d1117] text-white pl-4 pr-12 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-orange-500/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg text-orange-400 transition-colors">
                  <Play size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Block Code IDE (Lunar Light Theme) */}
      <BlocklyIDE 
        isOpen={showBlockCode} 
        onClose={() => setShowBlockCode(false)} 
        device={device} 
        onUploadCode={async (generatedCode) => {
          setCode(generatedCode);
          setUploadProgress(0);
          try {
            await device.uploadProgram("main.py", generatedCode, setUploadProgress);
          } catch (error) {
            console.error(error);
            alert("Upload to TITAN failed: " + error.message);
          }
          setTimeout(() => setUploadProgress(null), 1000);
        }}
      />

      {/* AI Assistant Studio Modal */}
      <AIAssistantIDE 
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        device={device}
        onUploadCode={async (generatedCode) => {
          setCode(generatedCode);
          setUploadProgress(0);
          try {
            await device.uploadProgram("main.py", generatedCode, setUploadProgress);
          } catch (error) {
            console.error(error);
            alert("Upload to TITAN failed: " + error.message);
          }
          setTimeout(() => setUploadProgress(null), 1000);
        }}
      />

      {/* Standalone Serial Monitor Modal */}
      <SerialMonitorModal
        isOpen={showSerialMonitor}
        onClose={() => setShowSerialMonitor(false)}
        device={device}
      />

      {/* Dedicated Isolated Firmware Flasher Modal */}
      <FirmwareFlasherModal 
        isOpen={showFlasherModal} 
        onClose={() => setShowFlasherModal(false)} 
        onDisconnectCurrent={device.disconnect} 
      />

      {/* Upload Progress Modal */}
      {uploadProgress !== null && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Uploading Code to LOF TITAN</h2>
            <div className="h-3 w-full bg-black rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-mono text-cyan-400 font-bold">{uploadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
