import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Camera, User, Heart, Sparkles, Check, GraduationCap, Zap, BookOpen, BarChart3, Calendar, Bell, FileText, Trophy, Target, Flame, Users, Plus, Minus, SkipForward } from 'lucide-react';
import MotherDefault from '../image/Mother-Default.png';
import FatherDefault from '../image/Father-Default.png';
import { supabase } from '../lib/supabase';

// Shared UI

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-1.5 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i < current
            ? 'w-6 bg-gradient-to-r from-rose-400 to-purple-500'
            : i === current
            ? 'w-6 bg-gradient-to-r from-purple-400 to-indigo-500 animate-pulse'
            : 'w-1.5 bg-gray-300'
        }`}
      />
    ))}
  </div>
);

const NavButtons = ({ onBack, onNext, nextLabel, nextDisabled, hideBack, showSkip, onSkip, skipLabel }) => (
  <div className="flex items-center justify-between mt-8">
    <div className="flex items-center gap-2">
      {!hideBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      ) : <div />}
    </div>
    <div className="flex items-center gap-2">
      {showSkip && (
        <button
          onClick={onSkip}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/40 transition-all font-medium text-sm"
        >
          {skipLabel || 'Skip'}
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 ${
          nextDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none hover:scale-100'
            : 'bg-gradient-to-r from-rose-500 to-purple-500 text-white hover:from-rose-600 hover:to-purple-600 shadow-glass-lg hover:shadow-glass-xl'
        }`}
      >
        {nextLabel || 'Continue'}
        {!nextLabel && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

// Celebration Preview

const CelebrationPreview = ({ parentPhoto, parentType, parentName, childName }) => {
  const defaultImage = parentType === 'father' ? FatherDefault : MotherDefault;
  const displayName = parentName || (parentType === 'father' ? 'Father' : 'Mother');
  const child = childName || 'your child';

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-1 shadow-2xl max-w-xs mx-auto">
      <div className="bg-gradient-to-br from-purple-900/90 via-pink-900/80 to-rose-900/90 rounded-xl p-4 text-center relative overflow-hidden">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFD700', '#DDA0DD', '#85C1E9', '#82E0AA'][i % 6],
              left: `${8 + (i * 9)}%`,
              top: `${10 + ((i * 17) % 70)}%`,
              opacity: 0.7,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        <div className="relative mx-auto mb-2 w-16 h-16">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 shadow-lg">
            <img src={parentPhoto || defaultImage} alt={displayName} className="w-full h-full object-cover" />
          </div>
          <span className="absolute -bottom-1 -right-1 text-lg">&#x1F496;</span>
        </div>

        <div className="bg-white/95 rounded-lg px-3 py-2 relative mt-2 shadow-lg">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45" />
          <p className="text-xs font-bold text-gray-800 relative z-10">
            {displayName} is SO proud of you, {child}! &#x1F970;&#x1F31F;
          </p>
        </div>

        <div className="mt-2 flex items-center justify-center">
          <div className="bg-yellow-400/90 text-yellow-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
            &#x1F3C6; Star Student
          </div>
        </div>
        <p className="text-white/50 text-[9px] mt-1.5 italic">&mdash; with love, {displayName} &#x1F495;</p>
      </div>
    </div>
  );
};

// Main Component

const STEP_NAMES = [
  'welcome',
  'parentType',
  'nameAndKids',
  'kidsInfo',
  'badges',
  'trackingMode',
  'features',
  'quote',
];

const Onboarding = ({
  session,
  setParentType,
  parentType,
  parentPhoto,
  handleParentPhotoUpload,
  accountName,
  setNewProfileName,
  setNewProfileClass,
  setNewProfilePic,
  setNewParentName,
  addProfile,
  newProfileName: _newProfileName,
  newProfileClass: _newProfileClass,
  newParentName: _newParentName,
  handleProfilePicUpload: _handleProfilePicUpload,
  onComplete,
  isTestMode = false,
}) => {
  const [step, setStep] = useState(0);

  // Parent info
  const [localParentType, setLocalParentType] = useState(parentType || 'mother');
  const [localAccountName, setLocalAccountName] = useState(accountName || '');
  const [numKids, setNumKids] = useState(1);

  // Kids info array
  const [kids, setKids] = useState([{ name: '', classGrade: '', parentNickname: '', pic: null }]);
  const [currentKidIndex, setCurrentKidIndex] = useState(0);

  // Celebration / badges
  const [localParentPhoto, setLocalParentPhoto] = useState(parentPhoto || null);

  // Tracking
  const [localTrackingMode, setLocalTrackingMode] = useState('smart');

  // Flow state
  const [creatingProfiles, setCreatingProfiles] = useState(false);
  const [completed, setCompleted] = useState(false);

  const parentPhotoRef = useRef(null);
  const childPicRefs = useRef([]);

  const totalSteps = STEP_NAMES.length;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const goBack = () => {
    if (STEP_NAMES[step] === 'kidsInfo' && currentKidIndex > 0) {
      setCurrentKidIndex((i) => i - 1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleNumKidsChange = (n) => {
    const clamped = Math.max(1, Math.min(5, n));
    setNumKids(clamped);
    setKids((prev) => {
      if (clamped > prev.length) {
        return [...prev, ...Array.from({ length: clamped - prev.length }, () => ({ name: '', classGrade: '', parentNickname: '', pic: null }))];
      }
      return prev.slice(0, clamped);
    });
  };

  const updateKid = (index, field, value) => {
    setKids((prev) => prev.map((k, i) => (i === index ? { ...k, [field]: value } : k)));
  };

  const onParentPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalParentPhoto(reader.result);
      handleParentPhotoUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const onChildPicSelect = (kidIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateKid(kidIndex, 'pic', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const filledKids = kids.filter((k) => k.name.trim());
  const firstKidName = filledKids[0]?.name || 'your child';

  // Create all profiles
  const handleFinish = async () => {
    if (isTestMode) {
      onComplete?.();
      return;
    }

    setCreatingProfiles(true);

    if (localAccountName.trim()) {
      localStorage.setItem('accountName', localAccountName.trim());
    }

    setParentType(localParentType);

    const kidsToCreate = kids.filter((k) => k.name.trim());
    for (let i = 0; i < kidsToCreate.length; i++) {
      const kid = kidsToCreate[i];
      setNewProfileName(kid.name.trim());
      setNewProfileClass(kid.classGrade.trim());
      setNewParentName(kid.parentNickname.trim() || (localParentType === 'father' ? 'Father' : 'Mother'));
      if (kid.pic) {
        setNewProfilePic(kid.pic);
      } else {
        setNewProfilePic(null);
      }

      await new Promise((r) => setTimeout(r, 100));
      await addProfile();
    }

    if (localTrackingMode === 'comprehensive' && session?.user?.id) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(kidsToCreate.length);

        if (data?.length) {
          const ids = data.map((p) => p.id);
          await supabase
            .from('profiles')
            .update({ chapter_tracking_mode: 'comprehensive' })
            .in('id', ids);
        }
      } catch (err) {
        console.error('Error setting tracking mode:', err);
      }
    }

    setCreatingProfiles(false);
    setCompleted(true);
  };

  // 0 Welcome
  const renderWelcome = () => (
    <div className="text-center py-6">
      <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform">
        <GraduationCap className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-black bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
        Welcome to Study Tracker!
      </h1>
      <p className="text-gray-500 text-lg mb-2">Let's set things up in just a few quick steps</p>
      <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-400">
        <span className="flex items-center gap-1">&#x1F4DA; Track studies</span>
        <span>&bull;</span>
        <span className="flex items-center gap-1">&#x1F3C6; Earn badges</span>
        <span>&bull;</span>
        <span className="flex items-center gap-1">&#x1F389; Celebrate wins</span>
      </div>
      <NavButtons onNext={goNext} nextLabel="Let's Go! &#x1F680;" hideBack />
    </div>
  );

  // 1 Parent type
  const renderParentType = () => (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Heart className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Who's setting this up?</h2>
      <p className="text-gray-500 mb-8">This helps personalise celebration messages</p>

      <div className="flex gap-4 justify-center mb-4">
        {[
          { type: 'mother', img: MotherDefault, accent: 'rose', label: 'Mother' },
          { type: 'father', img: FatherDefault, accent: 'indigo', label: 'Father' },
        ].map(({ type, img, accent, label }) => (
          <button
            key={type}
            onClick={() => setLocalParentType(type)}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all transform hover:scale-105 w-36 ${
              localParentType === type
                ? `border-${accent}-400 bg-${accent}-50 shadow-lg scale-105`
                : `border-gray-200 bg-white hover:border-${accent}-300`
            }`}
          >
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 border-${accent}-200 shadow`}>
              <img src={img} alt={label} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-700">{label}</span>
            {localParentType === type && (
              <div className={`bg-${accent}-500 text-white w-6 h-6 rounded-full flex items-center justify-center`}>
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        ))}
      </div>

      <NavButtons onBack={goBack} onNext={goNext} />
    </div>
  );

  // 2 Name + How many kids
  const renderNameAndKids = () => (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <User className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">About You</h2>
      <p className="text-gray-500 mb-6 text-sm">Your name and how many children you'd like to track</p>

      <div className="max-w-xs mx-auto space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">Your Name</label>
          <input
            type="text"
            placeholder={localParentType === 'father' ? 'e.g., Arun' : 'e.g., Priya'}
            value={localAccountName}
            onChange={(e) => setLocalAccountName(e.target.value)}
            className="w-full p-3.5 text-center text-lg glass-white border-2 border-white/40 rounded-2xl focus:border-purple-400 focus:outline-none shadow-sm font-medium"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 text-left">How many kids?</label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleNumKidsChange(numKids - 1)}
              disabled={numKids <= 1}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                numKids <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-purple-300 text-purple-500 hover:bg-purple-50'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-3xl font-black text-gray-800 w-8 text-center">{numKids}</span>
            </div>
            <button
              onClick={() => handleNumKidsChange(numKids + 1)}
              disabled={numKids >= 5}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                numKids >= 5 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-purple-300 text-purple-500 hover:bg-purple-50'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">You can always add more later from settings</p>
        </div>
      </div>

      <NavButtons onBack={goBack} onNext={() => { setCurrentKidIndex(0); goNext(); }} nextDisabled={!localAccountName.trim()} />
    </div>
  );

  // 3 Kids info (loops through each kid)
  const renderKidsInfo = () => {
    const kid = kids[currentKidIndex] || {};
    const isLast = currentKidIndex >= numKids - 1;
    const kidNum = currentKidIndex + 1;

    const handleKidNext = () => {
      if (isLast) {
        goNext();
      } else {
        setCurrentKidIndex((i) => i + 1);
      }
    };

    const handleSkipRemaining = () => {
      goNext();
    };

    return (
      <div className="text-center py-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {numKids > 1 && (
          <div className="flex items-center justify-center gap-2 mb-2">
            {Array.from({ length: numKids }, (_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < currentKidIndex
                    ? 'bg-emerald-400'
                    : i === currentKidIndex
                    ? 'bg-emerald-500 scale-125'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {numKids > 1 ? `Child ${kidNum} of ${numKids}` : "Your Child's Details"}
        </h2>
        <p className="text-gray-400 text-xs mb-4">
          {numKids > 1 ? "Fill in what you can \u2014 you can always update later" : "Create a profile for your child"}
        </p>

        <div className="max-w-sm mx-auto space-y-3">
          {/* Profile pic */}
          <div className="flex justify-center mb-1">
            <input
              type="file"
              ref={(el) => { childPicRefs.current[currentKidIndex] = el; }}
              accept="image/*"
              className="hidden"
              onChange={(e) => onChildPicSelect(currentKidIndex, e)}
            />
            <button
              onClick={() => childPicRefs.current[currentKidIndex]?.click()}
              className="relative group"
            >
              <div className={`rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                kid.pic ? 'border-emerald-400' : 'border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400'
              }`} style={{ width: '4.5rem', height: '4.5rem' }}>
                {kid.pic ? (
                  <img src={kid.pic} alt="Child" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="w-5 h-5 text-gray-400 mx-auto" />
                    <span className="text-[9px] text-gray-400">Photo</span>
                  </div>
                )}
              </div>
              {kid.pic && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          </div>

          <input
            type="text"
            placeholder="Child's name *"
            value={kid.name}
            onChange={(e) => updateKid(currentKidIndex, 'name', e.target.value)}
            className="w-full p-3 glass-white border-2 border-white/40 rounded-xl focus:border-emerald-400 focus:outline-none shadow-sm font-medium"
            autoFocus
          />
          <input
            type="text"
            placeholder="Class / Grade (e.g., Grade 5)"
            value={kid.classGrade}
            onChange={(e) => updateKid(currentKidIndex, 'classGrade', e.target.value)}
            className="w-full p-3 glass-white border-2 border-white/40 rounded-xl focus:border-emerald-400 focus:outline-none shadow-sm font-medium"
          />
          <input
            type="text"
            placeholder={`What does ${kid.name || 'your child'} call you? (e.g., Mamma, Appa)`}
            value={kid.parentNickname}
            onChange={(e) => updateKid(currentKidIndex, 'parentNickname', e.target.value)}
            className="w-full p-3 glass-white border-2 border-white/40 rounded-xl focus:border-emerald-400 focus:outline-none shadow-sm font-medium"
          />
          <p className="text-[11px] text-gray-400">
            Shows in celebrations &mdash; &ldquo;<strong>{kid.parentNickname || 'Mamma'}</strong> is SO proud of you!&rdquo;
          </p>
        </div>

        <NavButtons
          onBack={goBack}
          onNext={handleKidNext}
          nextLabel={isLast ? 'Continue' : 'Next Child \u2192'}
          nextDisabled={!kid.name?.trim()}
          showSkip={numKids > 1 && !isLast}
          onSkip={handleSkipRemaining}
          skipLabel="Skip rest"
        />

        {numKids > 1 && (
          <p className="text-[10px] text-gray-400 mt-2">
            &#x1F4A1; You can set up remaining kids later from the profile settings
          </p>
        )}
      </div>
    );
  };

  // 4 Badges and Celebration Photo
  const renderBadges = () => (
    <div className="text-center py-3">
      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
        <Trophy className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Badges & Celebrations</h2>
      <p className="text-gray-500 mb-4 text-sm">
        Your kids earn badges for study milestones. When they do, they see a special celebration with your photo and a personal message!
      </p>

      {/* Badge examples */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[
          { emoji: '\u26A1', label: 'Keep Going', bg: 'bg-blue-100 border-blue-200 text-blue-700' },
          { emoji: '\u{1F3C6}', label: 'Star Student', bg: 'bg-yellow-100 border-yellow-200 text-yellow-700' },
          { emoji: '\u{1F525}', label: 'Study Rockstar', bg: 'bg-purple-100 border-purple-200 text-purple-700' },
        ].map((b, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border ${b.bg} text-[10px] font-bold`}>
            <span className="text-lg">{b.emoji}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>

      {/* Parent photo upload */}
      <div className="mb-4">
        <input type="file" ref={parentPhotoRef} accept="image/*" className="hidden" onChange={onParentPhotoSelect} />
        <button
          onClick={() => parentPhotoRef.current?.click()}
          className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-dashed border-orange-300 hover:border-orange-400 text-orange-600 font-medium text-sm transition-all hover:shadow-md"
        >
          <Camera className="w-4 h-4" />
          {localParentPhoto ? 'Change Your Photo' : 'Upload Your Photo'}
        </button>
        {!localParentPhoto && (
          <p className="text-[10px] text-gray-400 mt-1">Optional &mdash; a default image will be used if skipped</p>
        )}
      </div>

      {/* Celebration Preview */}
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">&#x2728; How {firstKidName} will see it</p>
      <CelebrationPreview
        parentPhoto={localParentPhoto}
        parentType={localParentType}
        parentName={localAccountName || (localParentType === 'father' ? 'Father' : 'Mother')}
        childName={firstKidName}
      />

      <NavButtons onBack={goBack} onNext={goNext} />
    </div>
  );

  // 5 Tracking Mode
  const renderTrackingMode = () => (
    <div className="text-center py-3">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
        <BarChart3 className="w-7 h-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">How should we track chapters?</h2>
      <p className="text-gray-500 mb-5 text-sm">Pick the style that fits best</p>

      <div className="space-y-3 max-w-md mx-auto text-left">
        {/* Simple */}
        <button
          onClick={() => setLocalTrackingMode('smart')}
          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
            localTrackingMode === 'smart'
              ? 'border-emerald-400 bg-emerald-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-emerald-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              localTrackingMode === 'smart' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Simple Tracking</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">RECOMMENDED</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Best for younger students (Grades 1\u20136)</p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>&#x2705; Simple checkbox to mark chapters done</li>
                <li>&#x23F1;&#xFE0F; Study time auto-calculated from tasks</li>
                <li>&#x1F4CA; Activity tracked automatically</li>
                <li>&#x26A1; Quick and effortless to use</li>
              </ul>
            </div>
            {localTrackingMode === 'smart' && (
              <div className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </button>

        {/* Comprehensive */}
        <button
          onClick={() => setLocalTrackingMode('comprehensive')}
          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
            localTrackingMode === 'comprehensive'
              ? 'border-indigo-400 bg-indigo-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-indigo-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              localTrackingMode === 'comprehensive' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Comprehensive Tracking</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Best for older students (Grade 7+) or exam prep</p>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li>&#x1F4CB; 5-stage status flow per chapter</li>
                <li>&#x1F501; Revision tracking (planned vs done)</li>
                <li>&#x1F4D6; Study mode per chapter (Full / Key Topics / Custom)</li>
                <li>&#x1F4CA; Detailed exam prep breakdown</li>
              </ul>
            </div>
            {localTrackingMode === 'comprehensive' && (
              <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3">You can change this anytime per child in profile settings</p>

      <NavButtons onBack={goBack} onNext={goNext} />
    </div>
  );

  // 6 Feature Rundown
  const FEATURES = [
    { icon: <Target className="w-5 h-5" />, title: 'Daily Tasks', desc: 'Plan study activities with subjects, chapters, and durations. Mark complete as you go.', color: 'from-rose-400 to-pink-500' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Subjects & Chapters', desc: `Track every chapter across all subjects. ${localTrackingMode === 'comprehensive' ? '5-stage status flow with revision tracking.' : 'Simple checkbox completion with auto-tracked stats.'}`, color: 'from-blue-400 to-indigo-500' },
    { icon: <Calendar className="w-5 h-5" />, title: 'Exam Planner', desc: 'Create exams with multiple subjects, dates, chapters, and key points.', color: 'from-amber-400 to-orange-500' },
    { icon: <Trophy className="w-5 h-5" />, title: 'Badges & Points', desc: 'Earn badges for milestones \u2014 study streaks, task completion, weekly hours.', color: 'from-yellow-400 to-amber-500' },
    { icon: <Flame className="w-5 h-5" />, title: 'Celebrations', desc: `A fun celebration with your photo when ${firstKidName} earns a badge!`, color: 'from-purple-400 to-pink-500' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Dashboard', desc: 'Study hours, completion rates, subject breakdown, and weekly trends.', color: 'from-emerald-400 to-teal-500' },
    { icon: <Bell className="w-5 h-5" />, title: 'Reminders', desc: 'One-time or recurring reminders for tuition, homework, and study sessions.', color: 'from-cyan-400 to-blue-500' },
    { icon: <FileText className="w-5 h-5" />, title: 'School Documents', desc: 'Store timetables, circulars, and other school files for quick access.', color: 'from-gray-400 to-slate-500' },
  ];

  const renderFeatures = () => (
    <div className="py-2">
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Here's What You Get</h2>
        <p className="text-gray-500 text-sm">All the tools to stay on top of things</p>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/60 border border-white/50 hover:bg-white/80 transition-all">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
              {f.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-800">{f.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <NavButtons
        onBack={goBack}
        onNext={handleFinish}
        nextLabel={isTestMode ? 'Finish Preview \u2728' : "Let's Begin! \u{1F389}"}
        nextDisabled={creatingProfiles}
      />
    </div>
  );

  // 7 Inspirational Quote / Done
  const kidsCreated = kids.filter((k) => k.name.trim());
  const kidsNames = kidsCreated.map((k) => k.name.trim());
  const kidsText = kidsNames.length === 1
    ? `${kidsNames[0]}'s profile has been created`
    : kidsNames.length === 2
    ? `${kidsNames[0]} and ${kidsNames[1]}'s profiles have been created`
    : `${kidsNames.slice(0, -1).join(', ')} and ${kidsNames[kidsNames.length - 1]}'s profiles have been created`;

  const renderQuote = () => (
    <div className="text-center py-5">
      <div className="relative mx-auto w-20 h-20 mb-5">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
          <Check className="w-10 h-10 text-white" />
        </div>
        <span className="absolute -top-2 -right-2 text-2xl animate-pulse">&#x1F389;</span>
        <span className="absolute -bottom-2 -left-2 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>&#x2728;</span>
      </div>

      <h2 className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
        You're All Set!
      </h2>
      <p className="text-gray-500 text-sm mb-1">{kidsText}</p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-[11px] text-gray-500 mb-5">
        {localTrackingMode === 'comprehensive' ? <BookOpen className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
        {localTrackingMode === 'comprehensive' ? 'Comprehensive' : 'Simple'} tracking
      </div>

      {/* Inspirational quote */}
      <div className="relative mx-auto max-w-sm mb-6">
        <div className="bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 rounded-2xl p-5 border border-white/60 shadow-sm">
          <span className="text-3xl leading-none text-purple-300 block mb-1">&ldquo;</span>
          <p className="text-sm text-gray-600 leading-relaxed italic -mt-3">
            You don't need to be a perfect parent to be a great one. Simply showing up, staying involved, and cheering them on is the most powerful thing you can do for their growth.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-purple-300" />
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">You've got this &#x1F4AA;</span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-purple-300" />
          </div>
        </div>
      </div>

      <button
        onClick={() => onComplete?.()}
        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 text-lg"
      >
        Go to Study Tracker &#x1F680;
      </button>
    </div>
  );

  // Render
  const renderStep = () => {
    if (completed) return renderQuote();
    switch (STEP_NAMES[step]) {
      case 'welcome': return renderWelcome();
      case 'parentType': return renderParentType();
      case 'nameAndKids': return renderNameAndKids();
      case 'kidsInfo': return renderKidsInfo();
      case 'badges': return renderBadges();
      case 'trackingMode': return renderTrackingMode();
      case 'features': return renderFeatures();
      default: return renderWelcome();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl shadow-glass-xl border border-white/40 p-8 w-full max-w-lg relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-200/30 to-emerald-200/30 rounded-full blur-3xl" />

        <div className="relative z-10">
          {!completed && step > 0 && (
            <StepIndicator current={step} total={totalSteps} />
          )}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
