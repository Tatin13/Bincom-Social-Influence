
import React, { useState } from 'react';
import { Step, UTMState, DubResponse } from './types';
import { SOURCES, MEDIUMS, CAMPAIGNS, STEP_CONFIGS } from './constants';
import { constructLongUrl, generateShortLink } from './services/dubService';
import { getSuggestions } from './services/aiService';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BASE_URL);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [utmState, setUtmState] = useState<UTMState>({
    baseUrl: '',
    source: '',
    medium: '',
    campaign: '',
    content: '',
    id: '',
  });
  const [result, setResult] = useState<DubResponse | null>(null);

  const handleNext = () => {
    if (currentStep < Step.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
      setSuggestions([]); // Clear suggestions for new step
    }
  };

  const handleBack = () => {
    if (currentStep > Step.BASE_URL) {
      setCurrentStep(currentStep - 1);
      setSuggestions([]);
    }
  };

  const updateState = (key: keyof UTMState, value: string) => {
    setUtmState(prev => ({ ...prev, [key]: value }));
  };

  const fetchAiSuggestions = async (type: 'content' | 'id') => {
    setAiLoading(true);
    const results = await getSuggestions(utmState, type);
    setSuggestions(results);
    setAiLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const longUrl = constructLongUrl(utmState);
      const res = await generateShortLink(longUrl, utmState);
      setResult(res);
      setCurrentStep(Step.RESULT);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during link generation.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUtmState({
      baseUrl: '',
      source: '',
      medium: '',
      campaign: '',
      content: '',
      id: '',
    });
    setResult(null);
    setSuggestions([]);
    setCurrentStep(Step.BASE_URL);
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.BASE_URL:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Destination Website</label>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                placeholder="bincom.net/academy"
                value={utmState.baseUrl}
                onChange={(e) => updateState('baseUrl', e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <button
              disabled={!utmState.baseUrl.trim()}
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
            >
              Set Destination
            </button>
          </div>
        );

      case Step.SOURCE:
      case Step.MEDIUM:
      case Step.CAMPAIGN:
        const options = currentStep === Step.SOURCE ? SOURCES : currentStep === Step.MEDIUM ? MEDIUMS : CAMPAIGNS;
        const key = currentStep === Step.SOURCE ? 'source' : currentStep === Step.MEDIUM ? 'medium' : 'campaign';
        return (
          <div className="grid grid-cols-1 gap-3">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  updateState(key as keyof UTMState, opt);
                  handleNext();
                }}
                className={`text-left px-5 py-4 rounded-xl border-2 transition-all flex justify-between items-center group ${
                  utmState[key as keyof UTMState] === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-100 bg-white hover:border-blue-200 text-gray-600'
                }`}
              >
                <span>{opt}</span>
                <svg className={`w-5 h-5 transition-transform ${utmState[key as keyof UTMState] === opt ? 'text-blue-600' : 'text-gray-200 group-hover:text-blue-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>
        );

      case Step.CONTENT:
      case Step.ID:
        const isContent = currentStep === Step.CONTENT;
        const paramKey = isContent ? 'content' : 'id';
        return (
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manual Input</label>
                <button 
                  onClick={() => fetchAiSuggestions(isContent ? 'content' : 'id')}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {aiLoading ? 'Analyzing...' : 'Smart Suggest'}
                </button>
              </div>
              <input
                type="text"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={isContent ? "e.g. hero-banner-cta" : "e.g. spring-sale-2024"}
                value={utmState[paramKey]}
                onChange={(e) => updateState(paramKey, e.target.value)}
              />
            </div>

            {suggestions.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">AI Suggestions</label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateState(paramKey, s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        utmState[paramKey] === s 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Continue
            </button>
          </div>
        );

      case Step.CONFIRMATION:
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              {[
                { label: 'Destination', value: utmState.baseUrl, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                { label: 'Source', value: utmState.source },
                { label: 'Medium', value: utmState.medium },
                { label: 'Campaign', value: utmState.campaign },
                { label: 'Content', value: utmState.content || 'None', hide: !utmState.content },
                { label: 'ID', value: utmState.id || 'None', hide: !utmState.id }
              ].map((item, i) => !item.hide && (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-700 truncate max-w-[200px] text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Generate & Shorten'}
            </button>
          </div>
        );

      case Step.RESULT:
        if (!result) return null;
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-5">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-200">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Success!</h3>
              <div className="group relative">
                <div className="p-4 bg-white border-2 border-emerald-200 rounded-2xl select-all text-blue-600 font-mono text-base break-all cursor-pointer hover:border-blue-400 transition-colors"
                     onClick={() => {
                       navigator.clipboard.writeText(result.shortLink);
                       alert('Short link copied to clipboard!');
                     }}>
                  {result.shortLink}
                </div>
                <div className="mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Click to copy</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-slate-800 px-5 py-3 text-[10px] font-black text-white uppercase tracking-[0.2em] flex justify-between">
                 <span>System Logs</span>
                 <span className="text-blue-400">Live API</span>
               </div>
               <div className="p-5 space-y-2 text-[10px] font-mono text-slate-500 overflow-x-auto">
                 <div className="flex gap-4"><span>[TIMESTAMP]</span> <span>{result.createdAt}</span></div>
                 <div className="flex gap-4"><span>[SHORT_URL]</span> <span className="text-blue-500 font-bold">{result.shortLink}</span></div>
                 <div className="flex gap-4"><span>[LONG_URL]</span> <span className="truncate">{result.longUrl}</span></div>
                 <div className="flex gap-4"><span>[SOURCE]</span> <span>{result.metadata.source}</span></div>
               </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-4 text-slate-500 font-bold border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm uppercase tracking-widest"
            >
              Start New Link
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 flex items-center justify-center bg-[#f0f4f8]">
      <div className="max-w-xl w-full glass-morphism rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 relative">
        {/* Subtle decorative background blur */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>

        {/* Header */}
        <div className="bg-[#0f172a] p-10 text-white relative">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase leading-none">Bincom Social</h1>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.3em] uppercase opacity-80">Link Infrastructure</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-soft"></span>
            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Test Environment v1.2</span>
          </div>
        </div>

        <div className="p-10">
          {currentStep !== Step.RESULT && <StepIndicator currentStep={currentStep} />}

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight tracking-tight">{STEP_CONFIGS[currentStep].title}</h2>
            <p className="text-slate-400 text-sm font-medium">{STEP_CONFIGS[currentStep].description}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl text-sm font-medium flex gap-3 items-center">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="transition-all duration-500 ease-out">
            {renderStep()}
          </div>

          {currentStep !== Step.BASE_URL && currentStep !== Step.RESULT && (
            <button
              onClick={handleBack}
              className="mt-8 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Go Back
            </button>
          )}
        </div>
        
        <div className="bg-slate-50/80 px-10 py-5 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
           <span>Authorized Personnel Only</span>
           <span>&copy; Bincom Academy 2024</span>
        </div>
      </div>
    </div>
  );
};

export default App;
