import React from 'react';
import AttendancesSection from './components/AttendancesSection';
import WeightSection from './components/WeightSection';

export default function ProgressClient() {
  return (
    <div className="flex flex-col items-center h-full text-center font-sans text-white px-4 py-6 md:px-8 max-w-2xl mx-auto overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <AttendancesSection />
      <WeightSection />
    </div>
  );
}
