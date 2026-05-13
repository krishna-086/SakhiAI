function MobileLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fffaf7] text-neutral-900">
      <div className="mx-auto w-full max-w-md min-h-screen relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default MobileLayout;