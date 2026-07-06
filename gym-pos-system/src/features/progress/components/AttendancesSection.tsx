import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import { useToast } from '../../../context/ToastContext';

export default function AttendancesSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendedDays, setAttendedDays] = useState<number[]>([]);
  const [hasAttendedToday, setHasAttendedToday] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // JS getDay() starts on Sunday (0)

  const fetchAttendances = async () => {
    try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-12
      const monthStr = month.toString().padStart(2, '0');

      // First day of current month
      const startDate = `${year}-${monthStr}-01 00:00:00`;
      
      // Last day of current month
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${monthStr}-${lastDay} 23:59:59`;

      const records = await pb.collection('asistencias').getFullList({
        filter: `usuario = "${userId}" && fecha_asistencia >= "${startDate}" && fecha_asistencia <= "${endDate}"`,
      });

      const days = records.map(r => new Date(r.fecha_asistencia).getDate());
      setAttendedDays(days);

      // Check if attended today
      const today = new Date();
      if (year === today.getFullYear() && month === (today.getMonth() + 1)) {
        setHasAttendedToday(days.includes(today.getDate()));
      } else {
        setHasAttendedToday(false);
      }

    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust offset because our grid might start on Monday, but let's stick to Sunday as first day
  // If we want weekDays header to start on Monday: ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  // JS getDay(): 0=Sun, 1=Mon...6=Sat. 
  // If week starts on Monday, the offset is: (firstDayOfMonth + 6) % 7
  const firstDayOffset = (firstDayOfMonth + 6) % 7; 
  const displayWeekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const getDaysArray = () => {
    let arr = [];
    for(let i = 0; i < firstDayOffset; i++) {
      arr.push({ day: null, attended: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({
        day: i,
        attended: attendedDays.includes(i)
      });
    }
    return arr;
  };

  const days = getDaysArray();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    // Don't go to future months
    if (currentDate.getFullYear() < today.getFullYear() || 
       (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() < today.getMonth())) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleRegisterAttendance = () => {
    if (hasAttendedToday) {
      toast.error('Ya registraste tu asistencia el día de hoy');
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeRegistration = async () => {
    const userId = pb.authStore.model?.id;
    if (!userId) return;

    setIsSubmitting(true);
    try {
      await pb.collection('asistencias').create({
        usuario: userId,
        fecha_asistencia: new Date().toISOString()
      });
      toast.success('Asistencia registrada con éxito');
      setIsConfirmOpen(false);
      // If we are looking at current month, refetch to show dot immediately
      const today = new Date();
      if (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth()) {
        fetchAttendances();
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al registrar la asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans mt-2">
      <h3 className="text-white font-bold text-lg text-left px-1">Asistencias</h3>
      
      <button 
        onClick={handleRegisterAttendance}
        disabled={hasAttendedToday}
        className={`w-full font-bold py-4 px-6 rounded-2xl transition-colors shadow-sm text-center text-sm md:text-base border border-white/10
          ${hasAttendedToday 
            ? 'bg-white/5 text-white/40 cursor-not-allowed border-transparent' 
            : 'bg-white/5 hover:bg-white/10 text-white active:scale-95'}
        `}
      >
        {hasAttendedToday ? 'Asistencia de hoy registrada' : 'Registrar Asistencia'}
      </button>

      <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] mt-2">
        
        {/* Month Selector */}
        <div className="flex items-center justify-between w-full max-w-[200px] mb-6">
          <button 
            onClick={handlePrevMonth}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <span className="text-white font-extrabold text-lg">{monthNames[currentDate.getMonth()]}</span>
          <button 
            onClick={handleNextMonth}
            className={`transition-colors p-1 ${
              (currentDate.getFullYear() === new Date().getFullYear() && currentDate.getMonth() === new Date().getMonth()) 
                ? 'text-white/20 cursor-not-allowed' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Dots Grid with WeekDays */}
        <div className="w-full max-w-sm">
          {/* Header de días de la semana */}
          <div className="grid grid-cols-7 gap-x-2 gap-y-2 md:gap-x-4 md:gap-y-4 w-full justify-items-center mb-3">
            {displayWeekDays.map((day, i) => (
              <span key={i} className="text-white/50 text-xs md:text-sm font-bold">{day}</span>
            ))}
          </div>
          
          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-x-2 gap-y-3 md:gap-x-4 md:gap-y-4 w-full justify-items-center">
            {days.map((d, index) => (
              <div 
                key={index}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-colors duration-300 ${
                  d.day === null 
                    ? 'bg-transparent' // Espacio vacío
                    : d.attended 
                      ? 'bg-[#FFC107] shadow-[0_0_8px_rgba(255,193,7,0.4)]' 
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Registrar Asistencia"
        message="¿Estás en el gimnasio y deseas registrar tu asistencia de hoy?"
        confirmText={isSubmitting ? "Registrando..." : "Sí, registrar"}
        onConfirm={executeRegistration}
        onCancel={() => !isSubmitting && setIsConfirmOpen(false)}
      />
    </div>
  );
}
