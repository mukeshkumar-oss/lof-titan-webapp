import React, { useState, useEffect, useRef } from 'react';
import { Bluetooth, Usb, Play, Square, RotateCcw, Upload, Terminal, Bot, Code, Cpu, Trash2, ArrowLeft } from 'lucide-react';
import { useDevice } from './bluetooth/useDevice';
import { projects } from './projects';
import { FirmwareFlasherModal } from './components/FirmwareFlasherModal';
import { Carousel } from './components/Carousel';
import { BlocklyIDE } from './components/BlocklyIDE';
import { AIAssistantIDE } from './components/AIAssistantIDE';
import { SerialMonitorModal } from './components/SerialMonitorModal';

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
    <div className="min-h-screen flex flex-col font-sans bg-[#0B0F19] text-white">
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

          {/* Projects Gallery */}
          <section className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="text-primary-start" />
              <h2 className="text-2xl font-heading font-semibold">Project Store</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleProjectSelect(p)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                    selectedProject.id === p.id 
                      ? 'bg-primary-start/20 border-primary-start shadow-glow' 
                      : 'bg-surface/50 border-white/5 hover:border-white/20'
                  }`}
                >
                  <h3 className="font-semibold mb-1 text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
            </>
          )}

          {viewMode === 'project' && (
            <>
              {/* Blockly / Code Editor */}
          <section className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <Code className="text-primary-start" />
                <h2 className="font-heading font-semibold text-lg">{selectedProject.name} Workspace</h2>
              </div>
              <div className="flex gap-2">
                <button disabled={!device.connected} onClick={handleUpload} className="btn-primary flex items-center gap-2 text-sm px-4">
                  <Upload size={16} /> Upload & Run
                </button>
              </div>
            </div>
            
            {selectedProject?.lesson && !showCode ? (() => {
              const isChapters = !!selectedProject.lesson.chapters;
              const currentSlides = isChapters 
                ? selectedProject.lesson.chapters[currentChapter].slides 
                : selectedProject.lesson.slides || [];
              const slide = currentSlides[currentSlide];

              const handleNext = () => {
                if (currentSlide < currentSlides.length - 1) {
                  setCurrentSlide(prev => prev + 1);
                } else if (isChapters && currentChapter < selectedProject.lesson.chapters.length - 1) {
                  setCurrentChapter(prev => prev + 1);
                  setCurrentSlide(0);
                } else {
                  setShowCode(true);
                }
              };

              const handlePrev = () => {
                if (currentSlide > 0) {
                  setCurrentSlide(prev => prev - 1);
                } else if (isChapters && currentChapter > 0) {
                  setCurrentChapter(prev => prev - 1);
                  setCurrentSlide(selectedProject.lesson.chapters[currentChapter - 1].slides.length - 1);
                }
              };

              return (
                <div className="flex-1 overflow-hidden flex bg-surface/30 rounded-b-xl border-t border-white/5">
                  {isChapters && (
                    <div className="w-64 bg-surface/80 border-r border-white/5 p-4 flex flex-col gap-2 overflow-y-auto hidden md:flex shrink-0">
                      <h3 className="font-bold text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-start to-white uppercase tracking-wider text-sm">Table of Contents</h3>
                      {selectedProject.lesson.chapters.map((chap, cIdx) => (
                        <div key={cIdx} className="flex flex-col gap-1 mb-2">
                          <button 
                            onClick={() => { setCurrentChapter(cIdx); setCurrentSlide(0); }}
                            className={`text-left font-semibold px-3 py-2 rounded-lg transition-all ${currentChapter === cIdx ? 'bg-gradient-to-r from-primary-start/20 to-transparent text-primary-start border-l-2 border-primary-start' : 'hover:bg-white/5 text-gray-300 border-l-2 border-transparent'}`}
                          >
                            {chap.title}
                          </button>
                          {currentChapter === cIdx && (
                             <div className="ml-4 flex flex-col gap-1 border-l border-white/10 pl-2 mt-1">
                               {chap.slides.map((s, sIdx) => (
                                 <button 
                                   key={sIdx}
                                   onClick={() => setCurrentSlide(sIdx)}
                                   className={`text-left text-sm px-2 py-1.5 rounded transition-all line-clamp-1 ${currentSlide === sIdx ? 'text-white bg-white/10 font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                                 >
                                   {s.title}
                                 </button>
                               ))}
                             </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
                    <div className="max-w-3xl w-full text-center flex flex-col h-full">
                      <h2 className="text-3xl font-heading font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-white">
                        {isChapters ? selectedProject.lesson.chapters[currentChapter].title : (selectedProject.lesson.title || 'Mission Guide')}
                      </h2>
                      
                      {slide ? (
                        <div className="flex flex-col items-center flex-1 w-full">
                          <div className="bg-surface/80 p-8 rounded-3xl border border-white/10 mb-8 text-left w-full shadow-2xl backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-start to-primary-end opacity-50"></div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-start/20 text-primary-start text-sm">{currentSlide + 1}</span>
                              {slide.title}
                            </h3>
                            
                            {slide.type === 'interactive' ? (
                              <div className="space-y-6">
                                {slide.questions && slide.questions.map((q, qIdx) => (
                                  <div key={qIdx} className="bg-black/30 p-5 rounded-xl border border-white/5">
                                    <p className="text-gray-200 font-medium mb-3">{q}</p>
                                    <textarea 
                                      className="w-full bg-[#0d1117] text-white p-3 rounded-lg border border-white/10 focus:border-primary-start focus:outline-none resize-none"
                                      rows="3"
                                      placeholder="Type your answer here..."
                                    ></textarea>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-lg text-gray-300 mb-6 leading-relaxed">
                                {slide.content.split('\n').map((line, i) => {
                                  if (line.includes('**')) {
                                    const parts = line.split('**');
                                    return <span key={i} className="block mb-3">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-primary-start font-bold">{part}</strong> : part)}</span>;
                                  }
                                  return <span key={i} className="block mb-3">{line}</span>;
                                })}
                              </div>
                            )}

                            {slide.image && (
                              <div className="mt-6 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/50">
                                <img src={slide.image} alt={slide.title} className="w-full h-auto object-contain max-h-[350px]" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between w-full mt-auto pt-4">
                            <button
                              onClick={handlePrev}
                              disabled={!isChapters && currentSlide === 0}
                              className={`px-6 py-3 rounded-full font-bold text-md transition-all text-white shadow-lg ${(!isChapters && currentSlide === 0) || (isChapters && currentChapter === 0 && currentSlide === 0) ? 'bg-surface border border-white/5 opacity-30 cursor-not-allowed' : 'bg-surface border border-white/20 hover:bg-white/10'}`}
                            >
                              ← Previous
                            </button>
                            
                            <div className="flex gap-1.5">
                              {currentSlides.map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-primary-start w-6' : 'bg-white/20'}`} />
                              ))}
                            </div>

                            {(!isChapters && currentSlide === currentSlides.length - 1) || (isChapters && currentChapter === selectedProject.lesson.chapters.length - 1 && currentSlide === currentSlides.length - 1) ? (
                              <button 
                                onClick={() => setShowCode(true)} 
                                className="px-8 py-3 rounded-full font-bold text-md bg-gradient-to-r from-green-400 to-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] text-white transition-all transform hover:-translate-y-1"
                              >
                                Start Coding!
                              </button>
                            ) : (
                              <button
                                onClick={handleNext}
                                className="px-6 py-3 rounded-full font-bold text-md bg-gradient-to-r from-primary-start to-primary-end hover:shadow-[0_0_15px_rgba(0,229,255,0.6)] text-white transition-all transform hover:-translate-y-1"
                              >
                                Next →
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })() /* Immediately invoked function to allow variable declarations */ : (
              <div className="flex-1 p-4 flex gap-4">
                {/* Python Code Area */}
                <textarea 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#0d1117] text-[#e6edf3] font-mono p-4 rounded-xl border border-white/5 focus:outline-none focus:border-primary-start/50 resize-none"
                  spellCheck="false"
                />
              </div>
            )}
          </section>
            </>
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
