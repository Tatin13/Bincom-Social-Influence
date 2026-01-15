
import React, { useState } from 'react';
import { Step, UTMState, DubResponse, FlowType, AdditionalParam } from './types';
import { SOURCES, MEDIUMS, CAMPAIGNS, STEP_CONFIGS } from './constants';
import { constructLongUrl, generateShortLink } from './services/dubService';
import { getSuggestions } from './services/aiService';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.FLOW_SELECTION);
  const [flowType, setFlowType] = useState<FlowType>('social');
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
    additionalParams: [{ key: '', value: '' }]
  });
  const [result, setResult] = useState<DubResponse | null>(null);

  const isSocialFlow = flowType === 'social';

  const handleNext = () => {
    if (currentStep === Step.FLOW_SELECTION) {
      setCurrentStep(Step.BASE_URL);
    } else if (currentStep === Step.BASE_URL) {
      setCurrentStep(isSocialFlow ? Step.SOURCE : Step.ADDITIONAL_PARAMS);
    } else if (currentStep === Step.ID) {
      setCurrentStep(Step.ADDITIONAL_PARAMS);
    } else if (currentStep < Step.CONFIRMATION) {
      setCurrentStep(currentStep + 1);
      setSuggestions([]);
    }
  };

  const handleBack = () => {
    if (currentStep === Step.BASE_URL) {
      setCurrentStep(Step.FLOW_SELECTION);
    } else if (currentStep === Step.SOURCE) {
      setCurrentStep(Step.BASE_URL);
    } else if (currentStep === Step.ADDITIONAL_PARAMS) {
      setCurrentStep(isSocialFlow ? Step.ID : Step.BASE_URL);
    } else if (currentStep > Step.FLOW_SELECTION) {
      setCurrentStep(currentStep - 1);
    }
    setSuggestions([]);
  };

  const updateState = (key: keyof UTMState, value: any) => {
    setUtmState(prev => ({ ...prev, [key]: value }));
  };

  const addParam = () => {
    updateState('additionalParams', [...utmState.additionalParams, { key: '', value: '' }]);
  };

  const removeParam = (index: number) => {
    const newList = [...utmState.additionalParams];
    newList.splice(index, 1);
    updateState('additionalParams', newList);
  };

  const updateParam = (index: number, field: keyof AdditionalParam, value: string) => {
    const newList = [...utmState.additionalParams];
    newList[index] = { ...newList[index], [field]: value };
    updateState('additionalParams', newList);
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
      const longUrl = constructLongUrl(utmState, isSocialFlow);
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
      additionalParams: [{ key: '', value: '' }]
    });
    setResult(null);
    setSuggestions([]);
    setCurrentStep(Step.FLOW_SELECTION);
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.FLOW_SELECTION:
        return (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setFlowType('social'); handleNext(); }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-blue-100 rounded-3xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left shadow-sm group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Social Influence Campaign</h3>
                <p className="text-xs text-slate-500">Full tracking flow (Source, Medium, Campaign, Content, ID).</p>
              </div>
            </button>
            <button
              onClick={() => { setFlowType('other'); handleNext(); }}
              className="flex items-center gap-4 p-6 bg-white border-2 border-emerald-100 rounded-3xl hover:border-emerald-600 hover:bg-emerald-50 transition-all text-left shadow-sm group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Other Campaigns</h3>
                <p className="text-xs text-slate-500">Custom parameter flow. Skips all standard UTM fields.</p>
              </div>
            </button>
          </div>
        );

      case Step.BASE_URL:
        return (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                placeholder="e.g. bincom.net/academy"
                value={utmState.baseUrl}
                onChange={(e) => updateState('baseUrl', e.target.value)}
              />
            </div>
            <button
              disabled={!utmState.baseUrl.trim()}
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => { updateState(key as keyof UTMState, opt); handleNext(); }}
                  className={`text-left px-5 py-3 rounded-xl border-2 transition-all group flex justify-between items-center ${utmState[key as keyof UTMState] === opt ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-gray-100 bg-white hover:border-blue-200 text-gray-600'}`}
                >
                  <span>{opt}</span>
                  <div className={`w-2 h-2 rounded-full ${utmState[key as keyof UTMState] === opt ? 'bg-blue-600' : 'bg-transparent'}`} />
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Or type custom value</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 123, offline-event"
                  value={utmState[key as keyof UTMState]}
                  onChange={(e) => updateState(key as keyof UTMState, e.target.value)}
                />
                <button
                  onClick={handleNext}
                  className="px-6 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
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
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Value</label>
                <button 
                  onClick={() => fetchAiSuggestions(isContent ? 'content' : 'id')}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  <svg className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {aiLoading ? 'Thinking...' : 'Smart Suggest'}
                </button>
              </div>
              <input
                type="text"
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                placeholder={isContent ? "e.g. hero-btn" : "e.g. promo-2025"}
                value={utmState[paramKey]}
                onChange={(e) => updateState(paramKey, e.target.value)}
              />
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                {suggestions.map(s => (
                  <button key={s} onClick={() => updateState(paramKey, s)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${utmState[paramKey] === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-slate-500 hover:border-blue-300'}`}>{s}</button>
                ))}
              </div>
            )}
            <button onClick={handleNext} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg">Continue</button>
          </div>
        );

      case Step.ADDITIONAL_PARAMS:
        return (
          <div className="space-y-6">
            <div className="max-h-[350px] overflow-y-auto pr-3 custom-scrollbar space-y-4">
              {utmState.additionalParams.map((param, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Param Row {index + 1}</span>
                    <button 
                      onClick={() => removeParam(index)}
                      className="text-rose-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Key (e.g. entry.123)"
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        value={param.key}
                        onChange={(e) => updateParam(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Value"
                        className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                        value={param.value}
                        onChange={(e) => updateParam(index, 'value', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={addParam}
                className="w-full py-3.5 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 font-bold text-xs uppercase hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                Add Another Parameter Pair
              </button>
              <button
                onClick={handleNext}
                className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold hover:bg-black shadow-lg transition-all"
              >
                Continue to Review
              </button>
            </div>
          </div>
        );

      case Step.CONFIRMATION:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col gap-1 pb-4 border-b border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Destination</span>
                <span className="text-sm font-semibold text-blue-600 truncate">{utmState.baseUrl}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {isSocialFlow && (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Source</span>
                      <span className="text-xs font-bold text-slate-700">{utmState.source}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medium</span>
                      <span className="text-xs font-bold text-slate-700">{utmState.medium}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campaign</span>
                      <span className="text-xs font-bold text-slate-700">{utmState.campaign}</span>
                    </div>
                  </>
                )}
                {utmState.additionalParams.filter(p => p.key && p.value).map((p, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{p.key}</span>
                    <span className="text-xs font-bold text-slate-700">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  Generate & Shorten
                </>
              )}
            </button>
          </div>
        );

      case Step.RESULT:
        if (!result) return null;
        return (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] text-center space-y-5">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-200">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Link Active</h3>
              <div 
                className="p-5 bg-white border-2 border-emerald-200 rounded-3xl select-all text-blue-600 font-mono text-base break-all cursor-pointer shadow-inner group relative"
                onClick={() => { navigator.clipboard.writeText(result.shortLink); alert('Copied to clipboard!'); }}
              >
                {result.shortLink}
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl" />
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Click link to copy</p>
            </div>
            <button 
              onClick={resetForm} 
              className="w-full py-4 text-slate-500 font-bold border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all uppercase text-xs tracking-[0.2em]"
            >
              Start New Project
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 flex items-center justify-center bg-[#f0f4f8]">
      <div className="max-w-xl w-full glass-morphism rounded-[3rem] shadow-2xl overflow-hidden border border-white/50 relative">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-100 rounded-full blur-[100px] -z-10 opacity-60"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-100 rounded-full blur-[100px] -z-10 opacity-60"></div>

        {/* Header */}
        <div className="bg-[#0f172a] p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-16 translate-x-16 border border-white/5"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-blue-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-blue-900/40">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">BincomURLGen</h1>
              <span className="text-[10px] font-bold text-blue-400 tracking-[0.4em] uppercase opacity-70">Internal Infrastructure</span>
            </div>
          </div>
        </div>

        <div className="p-10">
          {currentStep !== Step.FLOW_SELECTION && currentStep !== Step.RESULT && (
            <div className="mb-8"><StepIndicator currentStep={currentStep} /></div>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1 leading-tight tracking-tight">{STEP_CONFIGS[currentStep].title}</h2>
            <p className="text-slate-400 text-sm font-medium">{STEP_CONFIGS[currentStep].description}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-bold rounded-r-xl flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}

          <div className="min-h-[250px] transition-all duration-300">
            {renderStep()}
          </div>

          {currentStep !== Step.FLOW_SELECTION && currentStep !== Step.RESULT && (
            <button 
              onClick={handleBack} 
              className="mt-10 flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Go Back
            </button>
          )}
        </div>
        
        <div className="bg-slate-50 px-10 py-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
           <span>Authorized Project</span>
           <span>&copy; Bincom Academy</span>
        </div>
      </div>
    </div>
  );
};

export default App;
