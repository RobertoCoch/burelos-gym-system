import { Dumbbell, Package } from 'lucide-react';
import { useState } from 'react';
import MembershipPaymentModal from './MembershipPaymentModal';
import ProductPaymentModal from './ProductPaymentModal';

export default function PaymentView() {
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Mock de datos de historial de pagos
  const paymentHistory = [
    { id: 1, type: 'Mensualidad - Basica', name: 'Roberto Contreras', price: 300, date: '5/28/2026 13:10' },
    { id: 2, type: 'Mensualidad - Pro', name: 'Jairo Cabrera', price: 300, date: '5/28/2026 13:10' },
    { id: 3, type: 'Scoop Pre', name: 'Roberto Contreras', price: 50, date: '5/28/2026 13:10' },
    { id: 4, type: 'Proteina', name: 'Roberto Contreras', price: 400, date: '5/28/2026 13:10' },
    { id: 5, type: 'Agua Embotellada', name: 'Maria Lopez', price: 20, date: '5/28/2026 12:45' },
    { id: 6, type: 'Mensualidad - Basica', name: 'Juan Perez', price: 300, date: '5/28/2026 11:30' },
    { id: 7, type: 'Mensualidad - Pro', name: 'Ana Garcia', price: 300, date: '5/28/2026 10:15' },
    { id: 8, type: 'Scoop Pre', name: 'Luis Gomez', price: 50, date: '5/27/2026 18:20' },
    { id: 9, type: 'Mensualidad - Basica', name: 'Carlos Diaz', price: 300, date: '5/27/2026 17:05' },
  ];

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto font-sans text-white" style={{ paddingBottom: '100px' }}>
      
      {/* Header */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          Sección de<br/>
          <span className="text-[#FFC107] drop-shadow-[0_0_15px_rgba(255,193,7,0.4)]">Pagos</span>
        </h1>
      </div>

      {/* Agregar pago Section */}
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <h2 className="text-lg font-bold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Agregar pago +</h2>
        
        <div className="grid grid-cols-2 lg:flex lg:flex-row lg:justify-start lg:gap-4" style={{ gap: '16px' }}>
          <button 
            onClick={() => setIsMembershipModalOpen(true)}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group py-8 px-4 lg:py-6 lg:px-6 lg:w-40 lg:h-36">
            <p className="text-base font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-3">Membresia</p>
            <Dumbbell size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all active:scale-95 group py-8 px-4 lg:py-6 lg:px-6 lg:w-40 lg:h-36">
            <p className="text-base font-bold text-white group-hover:text-[#FFC107] transition-colors mb-4 lg:mb-3">Productos</p>
            <Package size={48} className="text-white group-hover:text-[#FFC107] transition-colors drop-shadow-md lg:w-10 lg:h-10" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Historial Section */}
      <div className="flex-1 flex flex-col" style={{ padding: '0 24px' }}>
        <h2 className="text-lg font-bold tracking-tight text-white/90" style={{ marginBottom: '16px' }}>Historial</h2>
        
        {/* Scrollable list content */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-colors" style={{ padding: '16px' }}>
              <div className="flex flex-col">
                <span className="text-[#FFC107] font-bold text-sm md:text-base drop-shadow-[0_0_8px_rgba(255,193,7,0.3)]">{payment.type}</span>
                <span className="text-gray-300 font-medium text-xs md:text-sm">{payment.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white font-extrabold text-lg">{payment.price}$</span>
                <span className="text-gray-400 text-xs font-medium">{payment.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MembershipPaymentModal 
        isOpen={isMembershipModalOpen} 
        onClose={() => setIsMembershipModalOpen(false)} 
      />
      <ProductPaymentModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
      />
    </div>
  );
}
