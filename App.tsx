
import React, { useState, useCallback } from 'react';
import { Step, UTMState, DubResponse } from './types';
import { SOURCES, MEDIUMS, CAMPAIGNS, STEP_CONFIGS } from './constants';
import { constructLongUrl, generateShortLink } from './services/dubService';
import StepIndicator from './components/StepIndicator';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.BASE_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    }
  };

  const handleBack = () => {
    if (currentStep > Step.BASE_URL) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateState = (key: keyof UTMState, value: string) => {
    setUtmState(prev => ({ ...prev, [key]: value }));
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
      setError(err.message || 'An unexpected error occurred.');
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
    setCurrentStep(Step.BASE_URL);
  };

  const renderStep = () => {
    const config = STEP_CONFIGS[currentStep];

    switch (currentStep) {
      case Step.BASE_URL:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Enter Website URL</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. bincom.net/emigr8"
              value={utmState.baseUrl}
              onChange={(e) => updateState('baseUrl', e.target.value)}
            />
            <button
              disabled={!utmState.baseUrl.trim()}
              onClick={handleNext}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        );

      case Step.SOURCE:
        return (
          <div className="grid grid-cols-1 gap-3">
            {SOURCES.map(source => (
              <button
                key={source}
                onClick={() => {
                  updateState('source', source);
                  handleNext();
                }}
                className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                  utmState.source === source
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-100 bg-white hover:border-blue-300 text-gray-700'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        );

      case Step.MEDIUM:
        return (
          <div className="grid grid-cols-1 gap-3">
            {MEDIUMS.map(medium => (
              <button
                key={medium}
                onClick={() => {
                  updateState('medium', medium);
                  handleNext();
                }}
                className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                  utmState.medium === medium
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-100 bg-white hover:border-blue-300 text-gray-700'
                }`}
              >
                {medium}
              </button>
            ))}
          </div>
        );

      case Step.CAMPAIGN:
        return (
          <div className="grid grid-cols-1 gap-3">
            {CAMPAIGNS.map(campaign => (
              <button
                key={campaign}
                onClick={() => {
                  updateState('campaign', campaign);
                  handleNext();
                }}
                className={`text-left px-4 py-4 rounded-xl border-2 transition-all ${
                  utmState.campaign === campaign
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-gray-100 bg-white hover:border-blue-300 text-gray-700'
                }`}
              >
                {campaign}
              </button>
            ))}
          </div>
        );

      case Step.CONTENT:
        return (
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. sidebar-ad, post-123"
              value={utmState.content}
              onChange={(e) => updateState('content', e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case Step.ID:
        return (
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. q1-campaign, black-friday"
              value={utmState.id}
              onChange={(e) => updateState('id', e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case Step.CONFIRMATION:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 divide-y divide-gray-200">
              <div className="py-2 flex justify-between">
                <span className="text-gray-500 text-sm">Base URL</span>
                <span className="text-gray-900 font-medium truncate ml-4">{utmState.baseUrl}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500 text-sm">Source</span>
                <span className="text-gray-900 font-medium">{utmState.source}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500 text-sm">Medium</span>
                <span className="text-gray-900 font-medium">{utmState.medium}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-500 text-sm">Campaign</span>
                <span className="text-gray-900 font-medium">{utmState.campaign}</span>
              </div>
              {utmState.content && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500 text-sm">Content</span>
                  <span className="text-gray-900 font-medium">{utmState.content}</span>
                </div>
              )}
              {utmState.id && (
                <div className="py-2 flex justify-between">
                  <span className="text-gray-500 text-sm">ID</span>
                  <span className="text-gray-900 font-medium">{utmState.id}</span>
                </div>
              )}
            </div>
            <button
              disabled={loading}
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Link...
                </>
              ) : 'Generate Short URL'}
            </button>
          </div>
        );

      case Step.RESULT:
        if (!result) return null;
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800">Link shortened successfully!</h3>
              <div className="p-3 bg-white border border-green-100 rounded-lg select-all text-blue-600 font-mono text-sm break-all">
                {result.shortLink}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result.shortLink);
                  alert('Copied to clipboard!');
                }}
                className="text-sm text-green-700 font-semibold hover:underline"
              >
                Copy to clipboard
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
               <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                 Technical Metadata (Log Format)
               </div>
               <div className="p-4 space-y-2 text-xs font-mono text-gray-600 overflow-x-auto">
                 <div>Timestamp: {result.createdAt}</div>
                 <div>Short URL: {result.shortLink}</div>
                 <div>Long URL: {result.longUrl}</div>
                 <div>Source: {result.metadata.source}</div>
                 <div>Medium: {result.metadata.medium}</div>
                 <div>Campaign: {result.metadata.campaign}</div>
                 {result.metadata.content && <div>Content: {result.metadata.content}</div>}
                 {result.metadata.id && <div>ID: {result.metadata.id}</div>}
               </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 text-blue-600 font-semibold border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Create Another Link
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-blue-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">Bincom Social Influence</h1>
          </div>
          <p className="text-blue-200 text-sm">URL Generator (Test Environment)</p>
        </div>

        <div className="p-8">
          {currentStep !== Step.RESULT && <StepIndicator currentStep={currentStep} />}

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{STEP_CONFIGS[currentStep].title}</h2>
            <p className="text-gray-500 text-sm">{STEP_CONFIGS[currentStep].description}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="transition-all duration-300 transform">
            {renderStep()}
          </div>

          {currentStep !== Step.BASE_URL && currentStep !== Step.RESULT && (
            <button
              onClick={handleBack}
              className="mt-6 flex items-center gap-2 text-gray-500 text-sm font-semibold hover:text-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Go Back
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
           <span>No-Code Prototype v1.0</span>
           <span>Bincom Academy</span>
        </div>
      </div>
    </div>
  );
};

export default App;
