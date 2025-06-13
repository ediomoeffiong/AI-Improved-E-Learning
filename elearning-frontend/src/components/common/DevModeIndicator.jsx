const DevModeIndicator = () => {
  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold z-50 shadow-lg">
      DEV MODE
    </div>
  );
};

export default DevModeIndicator;
