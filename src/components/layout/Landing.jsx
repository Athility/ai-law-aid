import "./Landing.css";

export default function Landing({ exampleQueries, onExampleClick }) {
  return (
    <div className="landing">
      <div className="landing-badge">Free · No sign-up · Indian Law</div>
      <h2 className="landing-title">
        Understand your
        <br />
        <span>legal rights</span>
        <br />
        in plain language
      </h2>
      <p className="landing-sub">
        Describe your problem in English or Hindi — get instant guidance on Indian laws, your rights, and next steps.
      </p>
      <div className="landing-grid">
        {exampleQueries.map((q, i) => (
          <button key={i} className="landing-card" onClick={() => onExampleClick(q.text)}>
            <span className="card-icon">{q.icon}</span>
            <span>{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
