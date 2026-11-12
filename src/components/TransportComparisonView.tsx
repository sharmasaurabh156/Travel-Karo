import React, { useState, useEffect } from 'react';
import { Destination, TransportComparisonResult, TransportOption } from '../types';
import { api } from '../lib/api';
import { 
  Train, 
  Plane, 
  Bus, 
  Car, 
  Clock, 
  ArrowRight, 
  Users, 
  Sparkles, 
  Fuel, 
  Receipt, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  TrendingDown, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface TransportComparisonViewProps {
  destinations: Destination[];
  initialDestination?: Destination;
  onSelectOptionForTrip?: (dest: Destination, transport: TransportOption, travellers: number) => void;
}

const INDIAN_CITIES = [
  'Bengaluru',
  'New Delhi',
  'Mumbai',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh'
];

export const TransportComparisonView: React.FC<TransportComparisonViewProps> = ({ 
  destinations, 
  initialDestination, 
  onSelectOptionForTrip 
}) => {
  const [sourceCity, setSourceCity] = useState('Bengaluru');
  const [selectedDestId, setSelectedDestId] = useState(initialDestination?.id || destinations[0]?.id || 'dest-goa');
  const [travellers, setTravellers] = useState(4);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [budgetPref, setBudgetPref] = useState<'low' | 'medium' | 'high'>('medium');
  const [comparison, setComparison] = useState<TransportComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModeFilter, setActiveModeFilter] = useState<'all' | 'train' | 'flight' | 'bus' | 'car'>('all');
  const [showScoreModal, setShowScoreModal] = useState(false);

  const selectedDestination = destinations.find(d => d.id === selectedDestId) || destinations[0];

  const handleCompute = async () => {
    if (!selectedDestination) return;
    setIsLoading(true);
    try {
      const res = await api.compareTransport({
        sourceCity,
        destinationId: selectedDestination.id,
        travellers,
        travelDate,
        userBudgetPreference: budgetPref
      });
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCompute();
  }, [selectedDestId, travellers, budgetPref, sourceCity]);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'train': return Train;
      case 'flight': return Plane;
      case 'bus': return Bus;
      case 'car': return Car;
      default: return Train;
    }
  };

  const filteredOptions = comparison?.options.filter(opt => {
    if (activeModeFilter === 'all') return true;
    return opt.mode === activeModeFilter;
  }) || [];

  return (
    <div id="transport-comparison-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Multi-Modal Intelligent Transit Engine</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
            Compare Routes, Fares & Times
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal">
            Real algorithmic comparisons for Trains, Flights, AC Sleeper Buses, and Car/Highway travel across India with live fuel & toll metrics.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-8">
          <Car className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Input Form Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Starting City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              From (Starting City)
            </label>
            <select
              value={sourceCity}
              onChange={(e) => setSourceCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            >
              {INDIAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              To (Destination)
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
              ))}
            </select>
          </div>

          {/* Number of Travellers */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Travellers
            </label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5">
              <button
                type="button"
                onClick={() => setTravellers(Math.max(1, travellers - 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shadow-xs"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-slate-900 text-sm">
                {travellers} {travellers === 1 ? 'Person' : 'People'}
              </span>
              <button
                type="button"
                onClick={() => setTravellers(Math.min(12, travellers + 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Highlights 3-Card Summary: Cheapest vs Fastest vs Recommended */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* CHEAPEST OPTION CARD */}
          <div className="bg-emerald-50/70 border-2 border-emerald-200/80 rounded-3xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Cheapest Option</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {comparison.cheapestOption.mode}
              </span>
            </div>
            
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900">
              ₹{comparison.cheapestOption.perPersonCost.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-600"> / person</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Total: ₹{comparison.cheapestOption.totalCost.toLocaleString('en-IN')} for {travellers} people
            </p>
            
            <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center font-medium">
                <Clock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                {comparison.cheapestOption.durationFormatted}
              </span>
              <span className="font-semibold text-emerald-900 truncate max-w-[150px]">
                {comparison.cheapestOption.name}
              </span>
            </div>
          </div>

          {/* FASTEST OPTION CARD */}
          <div className="bg-blue-50/70 border-2 border-blue-200/80 rounded-3xl p-5 relative overflow-hidden shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="inline-flex items-center space-x-1.5 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Fastest Option</span>
              </div>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                {comparison.fastestOption.mode}
              </span>
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900">
              {comparison.fastestOption.durationFormatted}
            </h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              ₹{comparison.fastestOption.perPersonCost.toLocaleString('en-IN')}/person (₹{comparison.fastestOption.totalCost.toLocaleString('en-IN')} total)
            </p>

            <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-700">
              <span className="font-medium">Direct connection</span>
              <span className="font-semibold text-blue-900 truncate max-w-[150px]">
                {comparison.fastestOption.name}
              </span>
            </div>
          </div>

          {/* RECOMMENDED OPTION CARD */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white border-2 border-teal-400/40 rounded-3xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="inline-flex items-center space-x-1.5 bg-[#6df5e1] text-[#006b5f] text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended for You</span>
              </div>
              <button 
                onClick={() => setShowScoreModal(true)}
                className="text-[11px] text-teal-300 hover:text-white underline flex items-center"
              >
                <span>Score {comparison.recommendedOption.scoreBreakdown.totalScore}/100</span>
                <HelpCircle className="w-3 h-3 ml-1" />
              </button>
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-white">
              {comparison.recommendedOption.option.mode.toUpperCase()}
              <span className="text-sm font-normal text-teal-200 ml-2">
                ₹{comparison.recommendedOption.option.perPersonCost.toLocaleString('en-IN')}/person
              </span>
            </h3>

            <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {comparison.recommendedOption.reason}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-teal-300 font-semibold">
              <span>{comparison.recommendedOption.option.durationFormatted} travel</span>
              <span className="text-white">{comparison.recommendedOption.option.providerName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {[
          { id: 'all', label: 'All Modes' },
          { id: 'train', label: 'Trains (IRCTC)' },
          { id: 'flight', label: 'Flights' },
          { id: 'car', label: 'Car / Road Trip' },
          { id: 'bus', label: 'AC Buses' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveModeFilter(filter.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeModeFilter === filter.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Comparison Options List */}
      <div className="space-y-4">
        {filteredOptions.map((option) => {
          const Icon = getModeIcon(option.mode);
          return (
            <div
              key={option.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
                option.isRecommended 
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md' 
                  : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Mode icon & details */}
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    option.mode === 'flight' ? 'bg-blue-100 text-blue-700' :
                    option.mode === 'train' ? 'bg-amber-100 text-amber-700' :
                    option.mode === 'car' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-base sm:text-lg text-slate-900">
                        {option.name}
                      </h4>
                      {option.isRecommended && (
                        <span className="bg-teal-100 text-teal-800 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                          Saathi Choice
                        </span>
                      )}
                      {option.isCheapest && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                          Lowest Fare
                        </span>
                      )}
                      {option.isFastest && (
                        <span className="bg-blue-100 text-blue-800 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                          Fastest
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {option.identifier} • Provider: <strong className="text-slate-700">{option.providerName}</strong>
                    </p>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl inline-block border border-slate-100">
                      {option.details}
                    </p>
                  </div>
                </div>

                {/* Center: Timing & Duration */}
                <div className="flex items-center justify-between sm:justify-center space-x-6 sm:space-x-8 px-2 py-3 bg-slate-50 rounded-2xl lg:bg-transparent lg:py-0">
                  <div className="text-left sm:text-center">
                    <p className="text-xs text-slate-400 font-medium">Departure</p>
                    <p className="font-bold text-sm text-slate-900">{option.departure}</p>
                    <p className="text-[11px] text-slate-500">{sourceCity}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {option.durationFormatted}
                    </span>
                    <div className="w-16 sm:w-24 h-0.5 bg-slate-300 my-1 relative">
                      <div className="w-2 h-2 rounded-full bg-slate-600 absolute right-0 top-1/2 transform -translate-y-1/2"></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{option.stops}</span>
                  </div>

                  <div className="text-right sm:text-center">
                    <p className="text-xs text-slate-400 font-medium">Arrival</p>
                    <p className="font-bold text-sm text-slate-900">{option.arrival}</p>
                    <p className="text-[11px] text-slate-500">{selectedDestination.name}</p>
                  </div>
                </div>

                {/* Right: Pricing & CTA */}
                <div className="flex items-center justify-between lg:flex-col lg:items-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                  <div className="lg:text-right">
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-slate-900">
                      ₹{option.perPersonCost.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500"> / person</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Total ₹{option.totalCost.toLocaleString('en-IN')} ({travellers} pax)
                    </p>
                  </div>

                  {onSelectOptionForTrip && (
                    <button
                      onClick={() => onSelectOptionForTrip(selectedDestination, option, travellers)}
                      className="mt-2 bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <span>Choose for Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Score Explanation Modal */}
      {showScoreModal && comparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-2">
              Smart Recommendation Engine
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              We compute multi-variable transit efficiency scores using a balanced formula:
            </p>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Cost Efficiency (40% weight):</span>
                <span className="font-bold text-slate-900">{comparison.recommendedOption.scoreBreakdown.costScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Travel Time (30% weight):</span>
                <span className="font-bold text-slate-900">{comparison.recommendedOption.scoreBreakdown.timeScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Convenience & Stops (20% weight):</span>
                <span className="font-bold text-slate-900">{comparison.recommendedOption.scoreBreakdown.convenienceScore} / 100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">User Preference (10% weight):</span>
                <span className="font-bold text-slate-900">{comparison.recommendedOption.scoreBreakdown.preferenceScore} / 100</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-teal-800 text-sm">
                <span>Weighted Total Score:</span>
                <span>{comparison.recommendedOption.scoreBreakdown.totalScore} / 100</span>
              </div>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
