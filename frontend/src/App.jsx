import { useEffect, useRef, useState } from 'react';
import LoadingIndicator from './components/LoadingIndicator';
import RiddleDisplay from './components/RiddleDisplay';
import RiddleSubmissionForm from './components/RiddleSubmissionForm';
import BulkQuestionUpload from './components/BulkQuestionUpload';
import { fetchRandomRiddle, submitRiddleVerification } from './services/api';

const HERO_HEADLINE = 'Hunt the truth.';

function App() {
  const [riddle, setRiddle] = useState('');
  const [isLoadingRiddle, setIsLoadingRiddle] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [typedHeadline, setTypedHeadline] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? HERO_HEADLINE : '',
  );
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef(null);
  const lastSoundedResultRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let characterIndex = 0;
    const typewriter = window.setInterval(() => {
      characterIndex += 1;
      setTypedHeadline(HERO_HEADLINE.slice(0, characterIndex));

      if (characterIndex >= HERO_HEADLINE.length) {
        window.clearInterval(typewriter);
      }
    }, 150);

    return () => window.clearInterval(typewriter);
  }, []);

  useEffect(() => {
    if (!verificationResult) {
      lastSoundedResultRef.current = null;
      return;
    }

    if (lastSoundedResultRef.current === verificationResult) {
      return;
    }

    lastSoundedResultRef.current = verificationResult;
    if (!soundEnabled || audioContextRef.current?.state !== 'running') {
      return;
    }

    const context = audioContextRef.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(verificationResult.verdict ? 660 : 220, now);
    if (verificationResult.verdict) {
      oscillator.frequency.setValueAtTime(880, now + 0.12);
    }
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (verificationResult.verdict ? 0.28 : 0.2));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + (verificationResult.verdict ? 0.28 : 0.2));
  }, [verificationResult, soundEnabled]);

  useEffect(
    () => () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch((error) => {
          console.error('Unable to close audio feedback context:', error);
        });
      }
    },
    [],
  );

  const loadRiddle = async () => {
    setIsLoadingRiddle(true);
    setErrorMessage('');
    setVerificationResult(null);

    try {
      const nextRiddle = await fetchRandomRiddle();
      setRiddle(nextRiddle);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to load a riddle right now. Please try again.',
      );
    } finally {
      setIsLoadingRiddle(false);
    }
  };

  useEffect(() => {
    loadRiddle();
  }, []);

  const handleSubmit = async ({ riddle: submittedRiddle, image }) => {
    if (!submittedRiddle || !image) {
      setErrorMessage('Please choose an image before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setVerificationResult(null);

    try {
      const data = await submitRiddleVerification({
        riddle: submittedRiddle,
        image,
      });

      const feedback = data?.feedback || 'Your submission has been reviewed.';
      setVerificationResult({
        verdict: Boolean(data?.verdict),
        feedback,
      });
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong while checking your answer.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartHunt = () => {
    document.getElementById('hunt-panel')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleSoundToggle = async () => {
    try {
      if (soundEnabled) {
        await audioContextRef.current?.suspend();
        setSoundEnabled(false);
        return;
      }

      if (!window.AudioContext) {
        setErrorMessage('Sound feedback is not supported in this browser.');
        return;
      }

      const context = audioContextRef.current ?? new window.AudioContext();
      audioContextRef.current = context;
      await context.resume();
      setErrorMessage('');
      setSoundEnabled(true);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to update sound feedback.');
    }
  };

  return (
    <main className="page-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="brand-block">
            <div className="brand-mark">[SCAVENGER]</div>
            <div className="brand-meta">MISSION CONTROL</div>
          </div>

          <div className="header-actions">
            <div className="status-pill">
              <span className="status-dot" aria-hidden="true" />
              SYSTEM: ONLINE
            </div>
            <button
              type="button"
              className="secondary-button sound-toggle"
              onClick={handleSoundToggle}
              aria-pressed={soundEnabled}
            >
              SOUND: {soundEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsBulkUploadOpen((isOpen) => !isOpen)}
              aria-expanded={isBulkUploadOpen}
              aria-controls="bulk-question-upload"
            >
              {isBulkUploadOpen ? 'CLOSE IMPORT' : 'ADD RIDDLES +'}
            </button>
            <button type="button" className="secondary-button" onClick={loadRiddle}>
              NEW RIDDLE
            </button>
          </div>
        </header>

        <section className="hero-panel panel-surface">
          <div className="hero-copy">
            <div className="section-kicker">CASE_001</div>
            <h1
              className={typedHeadline.length < HERO_HEADLINE.length ? 'is-typing' : ''}
              aria-label={HERO_HEADLINE}
            >
              <span className="hero-title-visual" aria-hidden="true">
                {typedHeadline.slice(0, 9)}
                {typedHeadline.length > 9 && (
                  <span className="hero-title-highlight">{typedHeadline.slice(9, 14)}</span>
                )}
                {typedHeadline.slice(14)}
              </span>
            </h1>
            <p>
              Investigate the clue, locate the target, and upload proof before the trail goes cold.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={handleStartHunt}>
                START HUNT →
              </button>
              <button type="button" className="ghost-button" onClick={loadRiddle}>
                REFRESH CLUE
              </button>
            </div>
          </div>

          <div className="hero-telemetry">
            <div className="telemetry-row">
              <span>OBJECTIVE</span>
              <strong>LOCATE</strong>
            </div>
            <div className="telemetry-row">
              <span>STATUS</span>
              <strong>AWAITING_EVIDENCE</strong>
            </div>
            <div className="telemetry-row">
              <span>CLUE</span>
              <strong>{riddle ? 'READY' : 'LOADING'}</strong>
            </div>
          </div>
        </section>

        {isBulkUploadOpen && (
          <BulkQuestionUpload onClose={() => setIsBulkUploadOpen(false)} />
        )}

        <div id="hunt-panel" className="case-grid">
          {isLoadingRiddle ? (
            <LoadingIndicator message="RETRIEVING CASE FILE..." />
          ) : (
            <RiddleDisplay riddle={riddle} isLoading={false} />
          )}

          {!isLoadingRiddle && (
            <RiddleSubmissionForm
              riddle={riddle}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        {verificationResult && (
          <div
            className={`verification-result ${verificationResult.verdict ? 'success' : 'warning'}`}
            role="status"
            aria-live="polite"
          >
            <div className="verification-label">
              {verificationResult.verdict
                ? 'VERDICT: VERIFIED'
                : 'MISSION FAILED // TRAIL WENT COLD'}
            </div>
            <h3>{verificationResult.verdict ? 'Case closed.' : 'Evidence insufficient.'}</h3>
            <p>{verificationResult.feedback}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
