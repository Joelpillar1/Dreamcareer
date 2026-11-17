import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ChevronDown, 
  Plus, 
  X,
  ExternalLink 
} from 'lucide-react';
import CornerPlusMarkers from './CornerPlusMarkers';
import { WHOP_PLANS } from '../config/whop';
import { completeSubscription, saveOnboarding } from '../utils/auth';
import { COUNTRIES } from '../utils/locations';

const REFERRAL_SOURCES = [
  { id: 'tiktok', label: 'TikTok', tag: 'Trending' },
  { id: 'instagram', label: 'Instagram', tag: 'Social' },
  { id: 'threads', label: 'Threads', tag: 'Community' },
  { id: 'twitter', label: 'X / Twitter', tag: 'Tech Community' },
  { id: 'linkedin', label: 'LinkedIn', tag: 'Professional' },
  { id: 'youtube', label: 'YouTube', tag: 'Video & Reviews' },
  { id: 'friend', label: 'Friend or Colleague', tag: 'Referral' },
  { id: 'google', label: 'Google Search', tag: 'Organic' },
  { id: 'other', label: 'Other / Online Forum', tag: 'Community' }
];

const POPULAR_DISCIPLINES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Engineer',
  'Full-Stack Developer',
  'AI / Machine Learning Engineer',
  'DevOps & Cloud Infrastructure',
  'Mobile Developer (iOS & Android)',
  'Product Manager',
  'UI/UX & Product Design',
  'Data Scientist & Analytics',
  'Engineering Manager',
  'QA & Test Engineer'
];

const ALL_COUNTRIES_LIST = [
  { name: 'Worldwide / Anywhere', flag: '🌐' },
  ...COUNTRIES.map(([name, flag]) => ({ name, flag })).sort((a, b) => a.name.localeCompare(b.name))
];

const SENIORITY_LEVELS = [
  { id: 'entry', label: 'Entry-Level / Junior (0-2 yrs)' },
  { id: 'mid', label: 'Mid-Level (2-5 yrs)' },
  { id: 'senior', label: 'Senior (5+ yrs)' },
  { id: 'lead', label: 'Lead / Staff / Principal' }
];

const WORKPLACE_TYPES = [
  { id: 'Remote', label: '100% Remote', desc: 'Work from anywhere within region', badge: 'Most Desired' },
  { id: 'Hybrid', label: 'Hybrid', desc: 'Mix of office and home flexibility' },
  { id: 'On-site', label: 'In-Office / On-site', desc: 'Dedicated company headquarters' }
];

export default function OnboardingFlow({
  currentUser,
  onComplete, // (onboardingData, plan) => void
  onExit
}) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [referralSource, setReferralSource] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['Software Engineer']);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [seniority, setSeniority] = useState('senior');
  const [workplace, setWorkplace] = useState('Remote');
  const [region, setRegion] = useState('United States');
  const [selectedPlanId, setSelectedPlanId] = useState('lifetime');

  // Scanner Animation State for Step 4
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Connecting to direct company ATS endpoints...');
  const [matchedJobsCount, setMatchedJobsCount] = useState(0);

  // Whop Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Add custom typed role
  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!selectedRoles.includes(trimmed)) {
      setSelectedRoles(prev => [...prev, trimmed]);
    }
    setCustomRoleInput('');
  };

  // Remove role
  const handleRemoveRole = (roleToRemove) => {
    setSelectedRoles(prev => prev.filter(r => r !== roleToRemove));
  };

  // Toggle role selection
  const toggleRole = (roleName) => {
    setSelectedRoles(prev =>
      prev.includes(roleName)
        ? (prev.length > 1 ? prev.filter(r => r !== roleName) : prev)
        : [...prev, roleName]
    );
  };

  // Run dynamic scanning animation on Step 5 (deliberate & thorough)
  useEffect(() => {
    if (step === 5) {
      setScanProgress(8);
      setScanStatus('Initializing multi-engine crawler on official career domains...');

      const t1 = setTimeout(() => {
        setScanProgress(26);
        setScanStatus(`Querying Greenhouse & Ashby career endpoints for ${selectedRoles[0] || 'target roles'}...`);
      }, 1200);

      const t2 = setTimeout(() => {
        setScanProgress(52);
        setScanStatus('Indexing direct openings from Stripe, OpenAI, Supabase, Linear, Vercel...');
      }, 2400);

      const t3 = setTimeout(() => {
        setScanProgress(74);
        setScanStatus(`Cross-referencing active roles with ${region} & your seniority level...`);
      }, 3700);

      const t4 = setTimeout(() => {
        setScanProgress(90);
        setScanStatus('Validating direct ATS routing & active hiring team contacts...');
      }, 4900);

      const t5 = setTimeout(() => {
        setScanProgress(100);
        setMatchedJobsCount(148);
        setScanStatus('Scan complete! Found 148 verified direct openings ready for you.');
      }, 6000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }
  }, [step, selectedRoles, region]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenWhopCheckout = (planId) => {
    setSelectedPlanId(planId);
    const plan = WHOP_PLANS[planId];

    // Save onboarding data in background
    const onboardingData = {
      referralSource,
      selectedRoles,
      seniority,
      workplace,
      region,
      plan: planId
    };
    saveOnboarding(onboardingData);

    // Open Whop checkout modal with instant test-drive + real link support
    setIsCheckoutModalOpen(true);
  };

  const handleCompletePayment = (planId) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const plan = WHOP_PLANS[planId || selectedPlanId];
      const updatedUser = completeSubscription(plan.id, {
        email: currentUser?.email || '',
        name: currentUser?.name || currentUser?.email?.split('@')[0] || ''
      });

      const onboardingData = {
        referralSource,
        selectedRoles,
        seniority,
        workplace,
        region,
        plan: plan.id
      };
      saveOnboarding(onboardingData);

      setIsProcessingPayment(false);
      setIsCheckoutModalOpen(false);

      if (onComplete) {
        onComplete(onboardingData, plan);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit'
    }}>
      {/* Top Header & Progress Stepper */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px'
      }}>
        <div style={{
          maxWidth: '840px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/Careerhut.png"
              alt="Careerhut"
              style={{ height: '24px', width: 'auto', display: 'block' }}
            />
          </div>

          {/* Stepper info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#64748b' }}>
              Step <span style={{ color: '#0f172a', fontWeight: 700 }}>{step}</span> of {totalSteps}
            </div>

            {onExit && (
              <button
                onClick={onExit}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Exit Onboarding"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div style={{
          maxWidth: '840px',
          margin: '10px auto 0',
          height: '4px',
          backgroundColor: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            background: 'linear-gradient(90deg, #780115, #F7B638)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: '840px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 20px 80px'
      }}>

        {/* ================= STEP 1: REFERRAL SOURCE ================= */}
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Where did you hear about us?
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
                We're growing organically across the tech and builder ecosystem. Help us know what reached you!
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '32px'
            }}>
              {REFERRAL_SOURCES.map((source) => {
                const isSelected = referralSource === source.id;
                return (
                  <div
                    key={source.id}
                    onClick={() => setReferralSource(source.id)}
                    style={{
                      position: 'relative',
                      padding: '16px 18px',
                      backgroundColor: '#ffffff',
                      border: `1px ${isSelected ? 'solid #780115' : 'dashed #cbd5e1'}`,
                      borderRadius: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 4px 14px rgba(120, 1, 21, 0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <CornerPlusMarkers color={isSelected ? '#780115' : '#94a3b8'} bg="#ffffff" size="10px" />
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                        {source.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {source.tag}
                      </div>
                    </div>

                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `1.5px solid ${isSelected ? '#780115' : '#cbd5e1'}`,
                      backgroundColor: isSelected ? '#780115' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isSelected && <Check size={12} color="#ffffff" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNext}
                disabled={!referralSource}
                className={referralSource ? 'btn-stitch-primary' : ''}
                style={!referralSource ? {
                  padding: '11px 26px',
                  backgroundColor: '#e2e8f0',
                  color: '#94a3b8',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                } : {}}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TARGET ROLES & SENIORITY ================= */}
        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                What's your desired job title?
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
                Type your desired job titles or select from popular disciplines to tailor your direct company career feed.
              </p>
            </div>

            {/* Role Options */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px'
              }}>
                Select Disciplines (Choose one or more)
              </div>

              {/* Typing Input with Add Button */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRole();
                    }
                  }}
                  placeholder="Type a job title (e.g. Software Engineer, Product Manager)..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.94rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#780115';
                    e.target.style.boxShadow = '0 0 0 3px rgba(120, 1, 21, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomRole}
                  className="btn-stitch-primary"
                  style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px' }}>
                Example: software developer, accountant, project manager, graphic designer. Press enter or click Add.
              </div>

              {/* Active Selected Tags */}
              {selectedRoles.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '8px'
                  }}>
                    Your Selected Titles ({selectedRoles.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedRoles.map((role) => (
                      <span
                        key={role}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: '#fff1f2',
                          border: '1.5px solid #780115',
                          borderRadius: '6px',
                          color: '#780115',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          boxShadow: '0 1px 3px rgba(120, 1, 21, 0.08)'
                        }}
                      >
                        <span>{role}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#780115'
                          }}
                          title={`Remove ${role}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              <div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px'
                }}>
                  Popular Suggestions (Click to toggle)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {POPULAR_DISCIPLINES.map((d) => {
                    const isSelected = selectedRoles.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleRole(d)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '6px',
                          border: `1px ${isSelected ? 'solid #780115' : 'dashed #cbd5e1'}`,
                          backgroundColor: isSelected ? '#780115' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#334155',
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected ? <Check size={13} color="#ffffff" /> : <Plus size={13} color="#64748b" />}
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seniority Selector */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px'
              }}>
                Target Experience Level
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '10px'
              }}>
                {SENIORITY_LEVELS.map((level) => {
                  const isSelected = seniority === level.id;
                  return (
                    <div
                      key={level.id}
                      onClick={() => setSeniority(level.id)}
                      style={{
                        position: 'relative',
                        padding: '12px 14px',
                        backgroundColor: isSelected ? '#ffffff' : '#ffffff',
                        border: `1px ${isSelected ? 'solid #780115' : 'dashed #cbd5e1'}`,
                        borderRadius: 0,
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isSelected ? '0 4px 12px rgba(120, 1, 21, 0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CornerPlusMarkers color={isSelected ? '#780115' : '#94a3b8'} bg="#ffffff" size="10px" />
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSelected ? '#780115' : '#0f172a' }}>
                        {level.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleBack}
                className="btn-stitch-secondary"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={selectedRoles.length === 0}
                className={selectedRoles.length > 0 ? 'btn-stitch-primary' : ''}
                style={selectedRoles.length === 0 ? {
                  padding: '11px 26px',
                  backgroundColor: '#e2e8f0',
                  color: '#94a3b8',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                } : {}}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: WORKPLACE & LOCATION ================= */}
        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Where would you like to work?
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
                Filter across 100% verified workplace types and global geographic regions.
              </p>
            </div>

            {/* Workplace Arrangement */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '12px'
              }}>
                Workplace Type
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px'
              }}>
                {WORKPLACE_TYPES.map((wp) => {
                  const isSelected = workplace === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => setWorkplace(wp.id)}
                      style={{
                        position: 'relative',
                        padding: '16px 18px',
                        backgroundColor: '#ffffff',
                        border: `1px ${isSelected ? 'solid #780115' : 'dashed #cbd5e1'}`,
                        borderRadius: 0,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 4px 14px rgba(120, 1, 21, 0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CornerPlusMarkers color={isSelected ? '#780115' : '#94a3b8'} bg="#ffffff" size="10px" />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.96rem', fontWeight: 700, color: isSelected ? '#780115' : '#0f172a' }}>
                          {wp.label}
                        </span>
                        {wp.badge && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                            {wp.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {wp.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Region / Country Dropdown */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px'
              }}>
                Target Region / Country
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 44px 14px 16px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#780115';
                    e.target.style.boxShadow = '0 0 0 3px rgba(120, 1, 21, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {ALL_COUNTRIES_LIST.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>

                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ChevronDown size={18} />
                </div>
              </div>

              <div style={{
                marginTop: '10px',
                fontSize: '0.78rem',
                color: '#64748b'
              }}>
                <span>Active location filter: <strong>{region}</strong>. Showing direct company openings for this region.</span>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleBack}
                className="btn-stitch-secondary"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="btn-stitch-primary"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: THE INDUSTRY REALITY CHECK & PLATFORM TRUTHS ================= */}
        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {/* Header / Intro */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 3.8vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#0f172a',
                lineHeight: 1.18,
                marginBottom: '8px'
              }}>
                The Hidden Loop of Modern Job Hunting
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
                Why applying across third-party boards feels like a void — and why the source always wins.
              </p>
            </div>

            {/* 3 Core Truth Pillars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {/* Pillar 1: The Aggregator Trap */}
              <div style={{
                position: 'relative',
                padding: '18px 16px',
                backgroundColor: '#ffffff',
                border: '1px dashed #fecdd3',
                borderRadius: 0
              }}>
                <CornerPlusMarkers color="#f43f5e" bg="#ffffff" size="10px" />
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#9f1239',
                  marginBottom: '8px'
                }}>
                  TRUTH 01 • THE AGGREGATOR TRAP
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Boards monetize clicks, not hires
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                  1-click apply floods recruiters with 500+ spam applications. Quality resumes get buried under bot volume.
                </p>
              </div>

              {/* Pillar 2: The ATS Backend Reality */}
              <div style={{
                position: 'relative',
                padding: '18px 16px',
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: 0
              }}>
                <CornerPlusMarkers color="#780115" bg="#ffffff" size="10px" />
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  TRUTH 02 • THE ATS QUEUE
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Recruiters live in Ashby & Greenhouse
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                  Candidates who apply on company career portals land directly in the hiring team's primary inbound queue.
                </p>
              </div>

              {/* Pillar 3: The 48-Hour Head Start */}
              <div style={{
                position: 'relative',
                padding: '18px 16px',
                backgroundColor: '#ffffff',
                border: '1px dashed #a7f3d0',
                borderRadius: 0
              }}>
                <CornerPlusMarkers color="#10b981" bg="#ffffff" size="10px" />
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#065f46',
                  marginBottom: '8px'
                }}>
                  TRUTH 03 • THE HEAD START
                </div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Screened before aggregators scrape
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                  Companies publish on their own sites 24–72 hours earlier. Direct applicants get reviewed first.
                </p>
              </div>
            </div>

            {/* Section: The Popular Platforms Breakdown */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#0f172a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px'
              }}>
                Popular Platforms vs. Reality
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px'
              }}>
                {/* LinkedIn */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>LinkedIn</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Easy Apply Loop</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    500+ bot applications in under an hour; promoted ads drown organic roles.
                  </div>
                </div>

                {/* Indeed */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Indeed</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Ad Bidding</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Ranks by employer ad budget; 40%+ are stale or automated reposts.
                  </div>
                </div>

                {/* Glassdoor */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Glassdoor</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Delayed Scrapes</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    24–48h ingestion lag behind mandatory review paywalls.
                  </div>
                </div>

                {/* ZipRecruiter */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>ZipRecruiter</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Blast Firehose</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Mass-syndicates profiles across scrapers, triggering auto-reject filters.
                  </div>
                </div>

                {/* Monster & Others */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Monster / Others</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Agency Reposts</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Dominated by third-party headhunters claiming recruiter markups.
                  </div>
                </div>

                {/* Google Jobs */}
                <div style={{ padding: '14px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Google Jobs</div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#fff1f2', padding: '1px 6px', borderRadius: '4px' }}>Scraper Loop</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                    Indexes scrapers that scraped other boards; frequent dead links.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleBack}
                className="btn-stitch-secondary"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                className="btn-stitch-primary"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: THE DIRECT ADVANTAGE & MATCHING ENGINE ================= */}
        {step === 5 && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            {/* Header / Intro */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 3.8vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#0f172a',
                lineHeight: 1.15,
                marginBottom: '8px'
              }}>
                Why Applying at the Source<br />Flips the Odds in Your Favor
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '560px', margin: '0 auto', lineHeight: 1.5 }}>
                Bypass the 500-applicant aggregator backlog and land directly on the hiring manager's desk.
              </p>
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
              marginBottom: '24px'
            }}>
              {/* Traditional Job Boards */}
              <div style={{
                position: 'relative',
                padding: '20px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 0
              }}>
                <CornerPlusMarkers color="#f43f5e" bg="#fff1f2" size="10px" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#9f1239' }}>
                    Third-Party Job Boards
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9f1239', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecdd3' }}>
                    Saturated
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>✕</span>
                    <span>500+ spam applicants per role via 1-click apply</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>✕</span>
                    <span>24–72 hour delay before listings are scraped</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#e11d48', fontWeight: 800 }}>✕</span>
                    <span>High ghost job rate; stale or already filled roles</span>
                  </div>
                </div>
              </div>

              {/* Careerhut Direct */}
              <div style={{
                position: 'relative',
                padding: '20px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 0
              }}>
                <CornerPlusMarkers color="#10b981" bg="#ecfdf5" size="10px" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>
                    Careerhut Direct Source
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#065f46', backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                    Priority Inbound
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>Priority inbound queue inside employer's ATS (Ashby, Greenhouse)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>Day-zero speed: apply before aggregators scrape the posting</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>
                    <span>100% verified active openings directly from company career sites</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Scanning Simulator */}
            <div style={{
              position: 'relative',
              padding: '18px 20px',
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: 0,
              marginBottom: '28px'
            }}>
              <CornerPlusMarkers color="#94a3b8" bg="#ffffff" size="10px" />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: scanProgress === 100 ? '#10b981' : '#f59e0b',
                    animation: scanProgress < 100 ? 'pulse 1s infinite' : 'none'
                  }} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                    Indexing: <strong>{selectedRoles.join(', ')}</strong> in <strong>{region}</strong>
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: '#780115' }}>
                  {scanProgress}%
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: '6px',
                backgroundColor: '#f1f5f9',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${scanProgress}%`,
                  background: 'linear-gradient(90deg, #780115, #10b981)',
                  transition: 'width 0.8s ease'
                }} />
              </div>

              <div style={{
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#475569'
              }}>
                <span>{scanStatus}</span>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleBack}
                className="btn-stitch-secondary"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={scanProgress < 100}
                className={scanProgress === 100 ? 'btn-stitch-primary' : ''}
                style={scanProgress < 100 ? {
                  padding: '11px 26px',
                  backgroundColor: '#e2e8f0',
                  color: '#94a3b8',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                } : {}}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 6: PRICING & WHOP CHECKOUT ================= */}
        {step === 6 && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem, 3.8vw, 2.4rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                lineHeight: 1.15,
                marginBottom: '10px'
              }}>
                From saturated boards<br />to getting hired directly
              </h1>
              <p style={{ fontSize: '0.96rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
                Join candidates skipping the recruiter queue. Choose your pass<br />to unlock the full direct verified dashboard.
              </p>
            </div>

            {/* Single Lifetime Founder Pass Card ($9.99 for First 50 People) */}
            <div style={{
              maxWidth: '480px',
              margin: '0 auto 28px',
              position: 'relative',
              backgroundColor: '#ffffff',
              border: '2px solid #780115',
              borderRadius: 0,
              padding: '30px 26px',
              boxShadow: '0 12px 35px -5px rgba(120, 1, 21, 0.15)',
              textAlign: 'left'
            }}>
              {/* Top Banner Tag */}
              <div style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#780115',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 16px',
                borderRadius: '999px',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                EARLY FOUNDER PASS • FIRST 50 PEOPLE ONLY
              </div>

              <CornerPlusMarkers color="#780115" bg="#ffffff" size="10px" />

              {/* Title & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Lifetime Access
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: '#ecfdf5',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0'
                }}>
                  Pay Once • Keep Forever
                </span>
              </div>

              {/* Pricing Display */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '18px' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#780115', lineHeight: 1 }}>$9.99</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ lifetime</span>
                <span style={{ fontSize: '0.84rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '6px' }}>Regular $29</span>
              </div>

              {/* Feature Checklist - Clean & Concise (3 bullets) */}
              <ul style={{
                paddingLeft: '0',
                listStyle: 'none',
                margin: '0 0 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.84rem',
                color: '#1e293b'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} color="#10b981" strokeWidth={2.8} />
                  <span>Direct company career portals & ATS links</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} color="#10b981" strokeWidth={2.8} />
                  <span>Reachable hiring contacts (where available)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={15} color="#10b981" strokeWidth={2.8} />
                  <span>Lifetime access & future updates — no monthly fees</span>
                </li>
              </ul>

              {/* Progress Bar for the 50 spots at the bottom of the card */}
              <div style={{
                borderTop: '1px dashed #e2e8f0',
                paddingTop: '16px',
                marginTop: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    Founder Spots: <span style={{ color: '#780115', fontWeight: 800 }}>12 / 50 Claimed</span>
                  </div>
                  <span className="badge-gradient-shimmer">
                    38 spots left
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div style={{
                  height: '8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    height: '100%',
                    width: '24%',
                    background: 'linear-gradient(90deg, #780115 0%, #ea580c 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  color: '#64748b',
                  lineHeight: 1.4
                }}>
                  Increases to $29 once the first 50 spots are filled.
                </div>
              </div>
            </div>

            {/* Primary Checkout Action */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => handleOpenWhopCheckout('lifetime')}
                className="btn-stitch-primary"
                style={{
                  padding: '13px 40px',
                  fontSize: '1rem',
                  gap: '8px'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>

              <div style={{
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '0.76rem',
                color: '#64748b'
              }}>
                <span>One-time payment</span>
                <span>•</span>
                <span>Powered by Whop Payments</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= WHOP CHECKOUT MODAL ================= */}
      {isCheckoutModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: 0,
            padding: '32px 28px',
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)'
          }}>
            <CornerPlusMarkers color="#94a3b8" bg="#ffffff" />

            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              aria-label="Close checkout"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={18} />
            </button>

            {/* Whop Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c2410c',
                marginBottom: '12px'
              }}>
                <span>Secure Whop Checkout</span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Claim Lifetime Founder Pass
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                You're claiming the <strong>Lifetime Founder Pass</strong> ($9.99 one-time payment)
              </p>
            </div>

            {/* Plan Details Card */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fafaf9',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {WHOP_PLANS[selectedPlanId]?.name}
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#780115' }}>
                  {WHOP_PLANS[selectedPlanId]?.price}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Instant access to 100+ company career pages, direct ATS apply links & real-time alerts.
              </div>
            </div>

            {/* Whop External Link & Instant Activation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Button to open external Whop checkout page */}
              <a
                href={WHOP_PLANS[selectedPlanId]?.whopCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    handleCompletePayment(selectedPlanId);
                  }, 2000);
                }}
                className="btn-stitch-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(180deg, #ea580c 0%, #c2410c 100%)',
                  borderColor: '#9a3412',
                  boxShadow: '0 4px 14px rgba(194, 65, 12, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                }}
              >
                <span>Pay via Whop Portal</span>
                <ExternalLink size={16} />
              </a>

              {/* Instant Test Activation button for immediate preview without real charge */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => handleCompletePayment(selectedPlanId)}
                className="btn-stitch-primary"
                style={{
                  width: '100%',
                  padding: '12px'
                }}
              >
                {isProcessingPayment ? (
                  <span>Activating subscription...</span>
                ) : (
                  <span>Instant Confirm & Launch Dashboard</span>
                )}
              </button>
            </div>

            <div style={{
              marginTop: '16px',
              fontSize: '0.74rem',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              You can configure your production Whop URLs in <code>src/config/whop.js</code>.<br />
              Clicking "Instant Confirm" instantly activates your subscription for evaluation.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
