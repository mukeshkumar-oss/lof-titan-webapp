import React, { useEffect, useRef } from 'react';
import { 
  Sliders, 
  Heart, 
  Waves,
  Lock
} from 'lucide-react';

/**
 * Interactive Tinkercad-Style Sensor Controls Deck for LOF TITAN (Light Theme)
 * Sensor ports are dynamically enabled and selectable ONLY when the active program/code uses that sensor.
 */
export function TitanSensorControls({ state, simulatorEngine }) {
  const { ultrasonic, sensors, pulseSensor, activeSensors = {} } = state;

  const isUltraActive = Boolean(activeSensors.ultrasonic);
  const isPulseActive = Boolean(activeSensors.pulse);

  return (
    <div className="flex flex-col space-y-3.5 text-slate-800">
      
      {/* 1. Ultrasonic Distance Slider (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isUltraActive
          ? 'bg-white border-purple-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isUltraActive 
                ? 'bg-purple-50 text-purple-600 border-purple-200 shadow-xs' 
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Waves size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Ultrasonic Distance Sensor</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isUltraActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isUltraActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isUltraActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Range: 2cm – 300cm</p>
            </div>
          </div>
          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
            isUltraActive
              ? 'text-purple-700 bg-purple-50 border-purple-200 shadow-xs'
              : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            {ultrasonic.distanceCm.toFixed(1)} cm
          </span>
        </div>

        <input 
          type="range" 
          min="2" 
          max="300" 
          step="1"
          disabled={!isUltraActive}
          value={ultrasonic.distanceCm}
          onChange={(e) => simulatorEngine.setUltrasonicDistance(e.target.value)}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 ${
            isUltraActive ? 'bg-purple-100' : 'bg-slate-200 cursor-not-allowed opacity-50'
          }`}
        />

        {isUltraActive && (
          <div className="flex items-center justify-between mt-2.5 gap-1.5 text-[10px]">
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(8)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Obstacle (8cm)
            </button>
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(25)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Medium (25cm)
            </button>
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(100)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Clear (100cm)
            </button>
          </div>
        )}
      </div>

      {/* 2. Analog / Digital Sensors S1 - S5 Control Grid (Light Theme) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Sliders size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Sensor Ports S1 – S5 (ADC 0 - 4095)</h4>
              <p className="text-[10px] text-slate-500 font-mono">Selectable when referenced by script or block code</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { pin: 2, label: 'S1', defaultType: 'light' },
            { pin: 1, label: 'S2', defaultType: 'potentiometer' },
            { pin: 3, label: 'S3', defaultType: 'flame' },
            { pin: 4, label: 'S4', defaultType: 'line' },
            { pin: 5, label: 'S5', defaultType: 'motion' },
          ].map((item) => {
            const sData = sensors[item.pin] || { value: 0, type: item.defaultType, digital: 0 };
            const isSensorActive = Boolean(activeSensors[item.pin]);

            return (
              <div 
                key={item.pin} 
                className={`p-2.5 rounded-xl border transition-all duration-300 space-y-1.5 ${
                  isSensorActive
                    ? 'bg-slate-50 border-blue-200 shadow-xs'
                    : 'bg-slate-100/60 border-slate-200 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold font-mono text-xs ${isSensorActive ? 'text-blue-700' : 'text-slate-400'}`}>
                      {item.label}
                    </span>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isSensorActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                        : 'bg-slate-200 text-slate-500 border border-slate-300'
                    }`}>
                      {isSensorActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={8} />}
                      {isSensorActive ? 'Active' : 'Disabled'}
                    </span>

                    {isSensorActive && (
                      <select
                        value={sData.type}
                        onChange={(e) => simulatorEngine.setSensorValue(item.pin, sData.value, e.target.value)}
                        className="text-[10px] bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-0.5 font-sans cursor-pointer shadow-xs hover:border-slate-400"
                      >
                        <option value="light">☀️ Light / LDR</option>
                        <option value="potentiometer">🎛️ Potentiometer</option>
                        <option value="flame">🔥 Flame Sensor</option>
                        <option value="line">🏁 Line Tracker</option>
                        <option value="motion">🚶 PIR Motion</option>
                        <option value="touch">👆 Touch Sensor</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {isSensorActive ? `Digital: ${sData.digital}` : 'Inactive'}
                    </span>
                    <span className={`font-mono font-bold text-xs w-12 text-right ${
                      isSensorActive ? 'text-blue-700 font-black' : 'text-slate-400'
                    }`}>
                      {isSensorActive ? sData.value : '---'}
                    </span>
                  </div>
                </div>

                <input 
                  type="range"
                  min="0"
                  max="4095"
                  step="1"
                  disabled={!isSensorActive}
                  value={sData.value}
                  onChange={(e) => simulatorEngine.setSensorValue(item.pin, e.target.value)}
                  className={`w-full h-1.5 rounded-lg appearance-none accent-blue-600 ${
                    isSensorActive ? 'bg-blue-100 cursor-pointer' : 'bg-slate-200 cursor-not-allowed opacity-40'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pulse & Heart Rate Sensor Simulator (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isPulseActive
          ? 'bg-white border-rose-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isPulseActive
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Heart size={16} className={isPulseActive && pulseSensor.fingerDetected ? 'animate-pulse text-rose-500' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">MAX30100 / MAX30102 Pulse Sensor</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isPulseActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isPulseActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isPulseActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x57) • Optical Heart Rate & SpO2</p>
            </div>
          </div>

          {isPulseActive && (
            <button 
              onClick={() => simulatorEngine.setPulseSensorState({ fingerDetected: !pulseSensor.fingerDetected })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer shadow-xs ${
                pulseSensor.fingerDetected 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {pulseSensor.fingerDetected ? '👆 Finger Placed' : 'No Finger'}
            </button>
          )}
        </div>

        {isPulseActive && pulseSensor.fingerDetected && (
          <div className="space-y-2 mt-2 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Simulated Heart Rate:</span>
              <span className="font-mono font-bold text-rose-600 text-sm">{pulseSensor.bpm} BPM</span>
            </div>
            <input 
              type="range"
              min="50"
              max="160"
              step="1"
              value={pulseSensor.bpm}
              onChange={(e) => simulatorEngine.setPulseSensorState({ bpm: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            {/* Live PPG ECG Heartbeat Waveform Canvas */}
            <PulseECGCanvas bpm={pulseSensor.bpm} />
          </div>
        )}
      </div>

    </div>
  );
}

/**
 * Animated PPG / ECG Heartbeat Waveform Canvas
 */
function PulseECGCanvas({ bpm }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#f43f5e';

      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const t = (x + offset) * 0.08;
        // Periodic ECG spike synthesis
        const wave = Math.sin(t) + 0.3 * Math.sin(2 * t) + (Math.sin(t * 0.5) > 0.8 ? Math.sin(t * 10) * 1.5 : 0);
        const y = canvas.height / 2 + wave * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += (bpm / 60) * 1.5;
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [bpm]);

  return (
    <div className="w-full h-12 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
      <canvas ref={canvasRef} width={300} height={48} className="w-full h-full" />
      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-rose-400/80 font-bold">PPG ECG LIVE</span>
    </div>
  );
}
