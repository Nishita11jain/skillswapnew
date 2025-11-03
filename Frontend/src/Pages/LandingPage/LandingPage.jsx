import React from "react";

const LandingPage = () => {
  return (
    <div className="hero">
      <div className="container-narrow hero-grid">
        <div>
          <h1 className="hero-title">Learn faster by swapping skills with people like you</h1>
          <p className="hero-subtitle">
            Match with mentors and peers, schedule sessions, chat, and grow together. It’s free.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a className="btn-primary" href="/discover">Start discovering</a>
            <a className="btn-primary" href="/register" style={{ background: "var(--brand-700)" }}>Become a mentor</a>
          </div>
        </div>
        <div className="card-surface" style={{ padding: 24 }}>
          <img src="/assets/images/cover.png" alt="Cover" style={{ width: "100%", borderRadius: 12 }} />
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: 40 }} id="why-skill-swap">
        <h2 className="hero-title" style={{ fontSize: "2rem" }}>Why SkillSwap?</h2>
        <p className="hero-subtitle">
          Learn from experts, share your expertise, and grow in a collaborative community.
        </p>
        <div className="hero-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="card-surface" style={{ padding: 20 }}>
            <h3 style={{ margin: 0 }}>Learn</h3>
            <p className="hero-subtitle">Practical sessions led by mentors and peers.</p>
          </div>
          <div className="card-surface" style={{ padding: 20 }}>
            <h3 style={{ margin: 0 }}>Share</h3>
            <p className="hero-subtitle">Teach your skills and build your profile.</p>
          </div>
          <div className="card-surface" style={{ padding: 20 }}>
            <h3 style={{ margin: 0 }}>Connect</h3>
            <p className="hero-subtitle">Chats, scheduling, and reviews built-in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
