import { useEffect, useState } from 'react';
import LoadingIndicator from './components/LoadingIndicator';
import RiddleDisplay from './components/RiddleDisplay';
import RiddleSubmissionForm from './components/RiddleSubmissionForm';
import { fetchRandomRiddle, submitRiddleVerification } from './services/api';

function App() {
  const [riddle, setRiddle] = useState('');
  const [isLoadingRiddle, setIsLoadingRiddle] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

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

      setVerificationResult({
        verdict: Boolean(data?.verdict),
        feedback: data?.feedback || 'Your submission has been reviewed.',
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
            <button type="button" className="secondary-button" onClick={loadRiddle}>
              NEW RIDDLE
            </button>
          </div>
        </header>

        <section className="hero-panel panel-surface">
          <div className="hero-copy">
            <div className="section-kicker">CASE_001</div>
            <h1>
              Hunt the <span>truth</span>.
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
          <div className={`verification-result ${verificationResult.verdict ? 'success' : 'warning'}`}>
            <div className="verification-label">
              {verificationResult.verdict ? 'VERDICT: VERIFIED' : 'VERDICT: REJECTED'}
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
