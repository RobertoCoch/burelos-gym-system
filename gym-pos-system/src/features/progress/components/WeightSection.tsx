import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeightModal from '../modals/WeightModal';
import pb from '../../../lib/pocketbase';

export default function WeightSection() {
  const currentYearActual = new Date().getFullYear();
  const [currentYear, setCurrentYear] = useState(currentYearActual.toString());
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'peso' | 'imc'>('peso');

  const fetchWeights = async () => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;

      const records = await pb.collection('progreso_fisico').getFullList({
        filter: `usuario = "${userId}" && created >= "${currentYear}-01-01 00:00:00" && created <= "${currentYear}-12-31 23:59:59"`,
        sort: 'created'
      });

      // Map records to 12 months
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const mappedData = months.map((month, index) => {
        // Find all records for this month
        const monthRecords = records.filter(r => new Date(r.created).getMonth() === index);
        // Get the latest one if it exists
        const latestRecord = monthRecords.length > 0 ? monthRecords[monthRecords.length - 1] : null;
        const weight = latestRecord ? latestRecord.peso : null;
        const height = latestRecord ? latestRecord.estatura : null;
        
        let bmi = null;
        if (weight && height) {
          bmi = weight / (height * height);
        }
        
        // Check if this month is the current actual month and year
        const isActive = new Date().getMonth() === index && currentYear === currentYearActual.toString();

        return { month, weight, bmi, height, active: isActive };
      });

      setWeightData(mappedData);
    } catch (error) {
      console.error('Error fetching weight progress:', error);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, [currentYear]);

  const handlePrevYear = () => {
    setCurrentYear((parseInt(currentYear) - 1).toString());
  };

  const handleNextYear = () => {
    if (parseInt(currentYear) < currentYearActual) {
      setCurrentYear((parseInt(currentYear) + 1).toString());
    }
  };

  // Helper to determine bar height
  const getBarHeight = (value: number, type: 'peso' | 'imc') => {
    if (type === 'peso') return `${(value / 120) * 100}px`; // Scale max 120kg for height
    if (type === 'imc') return `${(value / 45) * 100}px`; // Scale max 45 BMI for height
    return '8px';
  };

  const getBmiColorClass = (bmi: number | null) => {
    if (!bmi) return 'bg-white/5';
    if (bmi < 18.5) return 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]'; // Desnutrición
    if (bmi >= 18.5 && bmi <= 24.9) return 'bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.4)]'; // Normal
    if (bmi >= 25 && bmi <= 29.9) return 'bg-[#FFC107] shadow-[0_0_10px_rgba(255,193,7,0.4)]'; // Sobrepeso
    if (bmi >= 30) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'; // Obesidad (Grados I, II, III)
    return 'bg-white/5';
  };

  const hasRegisteredThisMonth = currentYear === currentYearActual.toString() && weightData[new Date().getMonth()]?.weight !== null;

  return (
    <div className="w-full flex flex-col gap-4 font-sans mt-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-white font-bold text-lg text-left">Medidas / IMC</h3>
        
        {/* Toggle Peso/IMC */}
        <div className="flex bg-[#1A1F2E] rounded-xl p-1 border border-white/5">
          <button 
            onClick={() => setViewMode('peso')}
            className={`px-3 py-1 text-xs md:text-sm font-bold rounded-lg transition-colors ${viewMode === 'peso' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            Peso
          </button>
          <button 
            onClick={() => setViewMode('imc')}
            className={`px-3 py-1 text-xs md:text-sm font-bold rounded-lg transition-colors ${viewMode === 'imc' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            IMC
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => setIsWeightModalOpen(true)}
        disabled={hasRegisteredThisMonth}
        className={`w-full font-bold py-4 px-6 rounded-2xl transition-colors shadow-sm text-center text-sm md:text-base border border-white/10
          ${hasRegisteredThisMonth 
            ? 'bg-white/5 text-white/40 cursor-not-allowed border-transparent' 
            : 'bg-white/5 hover:bg-white/10 text-white active:scale-95'}
        `}
      >
        {hasRegisteredThisMonth ? 'Ya tienes un registro este mes' : 'Registrar Medidas'}
      </button>

      <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] mt-2">
        
        {/* Year Selector */}
        <div className="flex items-center justify-between w-full max-w-[200px] mb-8">
          <button 
            onClick={handlePrevYear}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <span className="text-white font-extrabold text-lg">{currentYear}</span>
          <button 
            onClick={handleNextYear}
            className={`transition-colors p-1 ${parseInt(currentYear) < currentYearActual ? 'text-white/60 hover:text-white' : 'text-white/20 cursor-not-allowed'}`}
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Bar Chart (12 months) */}
        <div className="flex items-end justify-between w-full h-32 mb-2 px-1">
          {weightData.map((data, index) => {
            const displayValue = viewMode === 'peso' ? data.weight : data.bmi;
            const formattedValue = displayValue ? displayValue.toFixed(1) : '';
            const barColorClass = displayValue ? getBmiColorClass(data.bmi) : 'bg-white/5';
            
            return (
              <div key={index} className="flex flex-col items-center justify-end h-full w-[22px] md:w-[28px] gap-1 relative group">
                <span className={`text-[9px] md:text-xs font-bold absolute -top-5 ${data.active ? 'text-white' : 'text-white/80'}`}>
                  {formattedValue}
                </span>
                <div 
                  className={`w-full rounded-full transition-all duration-500 ease-in-out ${barColorClass}`}
                  style={{ height: displayValue ? getBarHeight(displayValue, viewMode) : '8px' }}
                />
                <span className={`text-[9px] md:text-[11px] font-semibold mt-1 ${data.active ? 'text-white' : 'text-white/50'}`}>
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <WeightModal 
        isOpen={isWeightModalOpen} 
        onClose={() => setIsWeightModalOpen(false)} 
        onSaved={fetchWeights}
      />
    </div>
  );
}
