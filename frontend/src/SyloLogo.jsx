export default function SyloLogo() {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      {/* Outer slow-spinning geometric frame */}
      <div className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/30 rounded-xl animate-[spin_8s_linear_infinite]"></div>
      
      {/* Inner counter-rotating accent frame */}
      <div className="absolute inset-1 bg-emerald-900/20 border border-emerald-400/40 rounded-lg animate-[spin_6s_linear_infinite_reverse]"></div>
      
      {/* Stable glowing core */}
      <div className="absolute inset-1.5 bg-black border border-emerald-400/80 rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] z-10">
        <span className="text-emerald-400 font-bold text-sm tracking-tighter">S</span>
      </div>
    </div>
  );
}