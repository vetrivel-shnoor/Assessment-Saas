import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 selection:bg-emerald-200 transition-colors duration-500">
      <Navbar />
      <main className="max-w-[90rem] mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-24">
        {/* Content removed as requested */}
      </main>
    </div>
  );
};

export default LandingPage;
