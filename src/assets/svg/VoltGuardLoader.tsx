const VoltGuardLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative h-32 w-32 overflow-hidden">
        <img
          src="/voltguard.png"
          alt="VoltGuard"
          className="absolute inset-0 h-full w-full object-contain opacity-20"
        />

        <div className="logo-build absolute inset-0 overflow-hidden">
          <img
            src="/voltguard.png"
            alt="VoltGuard loading"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="absolute inset-0 animate-ping rounded-full border border-blue-400 opacity-20" />
      </div>
    </div>
  );
};

export default VoltGuardLoader;