function RiddleDisplay({ riddle, isLoading = false }) {
  return (
    <article className="riddle-card panel-surface">
      <div className="badge-row">
        <span className="section-badge">MISSION_001</span>
        <span className="status-tag">ACTIVE</span>
      </div>

      {isLoading ? (
        <div className="placeholder-box">Fetching case file...</div>
      ) : (
        <>
          <p className="eyebrow-text">OBJECTIVE</p>
          <h2 className="riddle-question">{riddle}</h2>
        </>
      )}
    </article>
  );
}

export default RiddleDisplay;
