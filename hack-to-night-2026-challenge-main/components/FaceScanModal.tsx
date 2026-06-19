import React, { useState, useEffect, useRef } from 'react'

type FaceScanModalProps = {
  onScanSuccess: () => void;
  onCancel: () => void;
}

export default function FaceScanModal({ onScanSuccess, onCancel }: FaceScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanStatus, setScanStatus] = useState<'scanning' | 'success'>('scanning')

  useEffect(() => {
    // Start scan sequence
    const timer = setTimeout(() => {
      setScanStatus('success')
      setTimeout(() => {
        onScanSuccess()
      }, 1000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onScanSuccess])

  // Camera initialization
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error("Camera access denied or unavailable", err);
      });
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#17171a] rounded-3xl p-10 shadow-2xl border border-white/5 relative overflow-hidden text-center max-w-lg w-full mx-4">
        
        <button onClick={onCancel} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold !text-white tracking-tight mb-2">Biometric Verification</h2>
          <p className="text-[#8a8a8a] text-sm">Please position your face in the frame to authorize this transfer.</p>
        </div>

        {/* Scanner Container */}
        <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-[#ff5a1f]/20 shadow-[0_0_50px_rgba(255,90,31,0.2)] mb-8">
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          
          {/* Fallback avatar if no camera */}
          {!videoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f11]">
              <img src="https://i.pravatar.cc/300?u=dilara" className="w-full h-full object-cover opacity-50 blur-sm" alt="fallback" />
            </div>
          )}

          {/* Scanning Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,90,31,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,90,31,0.2)_1px,transparent_1px)] bg-[size:20px_20px] mix-blend-screen opacity-50"></div>
          
          {/* Scanning Laser Line Animation */}
          {scanStatus === 'scanning' && (
            <div className="absolute top-0 left-0 w-full h-2 bg-[#ff5a1f] shadow-[0_0_20px_#ff5a1f] animate-scan mix-blend-screen" style={{ animation: 'scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}></div>
          )}
          
          {/* Success Overlay */}
          {scanStatus === 'success' && (
            <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_#22c55e]">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            </div>
          )}
        </div>

        {/* Status Text */}
        <div className="h-10">
          {scanStatus === 'scanning' && (
            <p className="text-[#ff5a1f] font-mono tracking-widest uppercase text-sm animate-pulse flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analyzing Biometrics...
            </p>
          )}
          {scanStatus === 'success' && (
            <p className="text-green-500 font-mono tracking-widest uppercase text-sm animate-in slide-in-from-bottom-2 fade-in">
              Identity Verified
            </p>
          )}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scan {
            0% { top: -10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
          }
        `}} />
      </div>
    </div>
  )
}
