import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Search, X, MapPin, Sparkles, Flame, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        setIsLoading(true);
        try {
          const res = await api.searchGlobal(query.trim());
          setResults(res.results || []);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickSearches = ['Goa', 'Varanasi', 'Manali', 'Ayodhya', 'Holi', 'Pushkar', 'Spiritual', 'Beaches'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destination, state, festival, or attraction..."
            className="w-full bg-transparent border-none outline-none font-['Plus_Jakarta_Sans'] text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin mr-2" />}
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-200/70 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length === 0 ? (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-semibold transition-colors flex items-center"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 ml-1.5 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1.5">
              {results.map((item, idx) => (
                <div
                  key={`${item.type}-${item.id || idx}`}
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-teal-50/70 cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                        {item.type === 'festival' ? <Flame className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 group-hover:text-teal-900">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'destination' ? 'bg-teal-100 text-teal-800' :
                          item.type === 'festival' ? 'bg-orange-100 text-orange-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-slate-400 group-hover:text-teal-700 pl-2">
                    {item.price && (
                      <span className="text-xs font-bold text-slate-700 mr-2">
                        from ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching destinations or festivals found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "Goa", "Varanasi", "Manali", or "Pushkar"</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
