
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Leaf,
  LoaderCircle,
  MapPin,
  Mic,
  Send,
  Sparkles,
  Wind,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:8000";

export default function App() {
  const [duration, setDuration] = useState(20);
  const [experience, setExperience] = useState("curious");
  const [stage, setStage] = useState("setup");
  const [sessionId, setSessionId] = useState("");
  const [activity, setActivity] = useState(null);
  const [observations, setObservations] = useState([]);
  const [note, setNote] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [debrief, setDebrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.detail || `Request failed (${response.status})`);
    }

    return data;
  }

  async function startMission() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ duration, experience }),
      });

      setSessionId(data.session_id);
      setActivity(data.activity);
      setObservations([]);
      setDebrief(null);
      setStage("mission");
    } catch (err) {
      setError(
        `${err.message}. Make sure your FastAPI backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }

  
  function startVoiceNote() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice notes aren't supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    setVoiceError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };
     
    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        setNote((previous) => {
          const existing = previous.trim();
          const spoken = finalTranscript.trim();
          return existing ? `${existing} ${spoken}` : spoken;
        });
      }
    };

    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow it in your browser settings."
          : `Voice recognition failed: ${event.error}. Try again.`
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }


  async function saveObservation(event) {
    event.preventDefault();

    if (!note.trim()) return;

    setLoading(true);
    setError("");

    try {
      await apiRequest(`/api/sessions/${sessionId}/observations`, {
        method: "POST",
        body: JSON.stringify({ content: note.trim() }),
      });

      setObservations((previous) => [...previous, note.trim()]);
      setNote("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function requestDebrief(event) {
    event.preventDefault();

    if (!hypothesis.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/api/sessions/${sessionId}/debrief`, {
        method: "POST",
        body: JSON.stringify({ hypothesis: hypothesis.trim() }),
      });

      setDebrief(data);
      setStage("debrief");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStage("setup");
    setSessionId("");
    setActivity(null);
    setObservations([]);
    setNote("");
    setHypothesis("");
    setDebrief(null);
    setError("");
  }

  return (
    <main className="app-shell">
      <nav className="navbar">
        <button className="brand" onClick={reset} aria-label="Perspectivity home">
          <span className="brand-mark"><Leaf size={21} /></span>
          <span>perspectivity<span className="brand-dot">.</span></span>
        </button>
        <span className="nav-note"><span className="status-dot" /> A little more observant</span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> A DIFFERENT KIND OF AI EXPERIENCE</div>
          <h1>Go outside.<br /> <em>See differently.</em></h1>
          <p>
            The world is full of things you walk past every day.
            Get a mission, put your phone away, and discover what you have been missing.
          </p>
        </div>

        <div className="hero-art" aria-label="Illustration of a leaf and its surroundings">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <Leaf className="art-leaf leaf-one" strokeWidth={1} />
          <Leaf className="art-leaf leaf-two" strokeWidth={1} />
          <div className="art-caption"><MapPin size={13} /> THE WORLD, RECONSIDERED</div>
          <span className="art-number">01 / ∞</span>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR FIELD JOURNAL</span>
            <h2>
              {stage === "setup" && "Choose your adventure."}
              {stage === "mission" && "Your mission awaits."}
              {stage === "debrief" && "What did you discover?"}
            </h2>
          </div>
          {stage !== "setup" && (
            <button className="text-button" onClick={reset}>
              <ArrowLeft size={15} /> Start over
            </button>
          )}
        </div>

        <div className="step-track">
          {[
            ["setup", "01", "Prepare"],
            ["mission", "02", "Explore"],
            ["debrief", "03", "Reflect"],
          ].map(([key, number, label], index) => {
            const active = stage === key;
            const completed =
              (stage === "mission" && index === 0) ||
              (stage === "debrief" && index < 2);

            return (
              <div className={`step ${active ? "active" : ""} ${completed ? "completed" : ""}`} key={key}>
                <span className="step-number">
                  {completed ? <Check size={14} /> : number}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="error-message" role="alert">
            <strong>Something went wrong.</strong> {error}
          </div>
        )}

        {stage === "setup" && (
          
          <div className="setup-grid">
            <div className="panel setup-panel">
              <span className="eyebrow">01 — SET YOUR PACE</span>
              <h3>How much time do you have?</h3>
              <p className="muted">
                A small pocket of time can reveal a whole new world.
              </p>

              <div className="duration-options">
                {[10, 20, 30, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    className={`duration-option ${duration === minutes ? "selected" : ""}`}
                    onClick={() => setDuration(minutes)}
                  >
                    <strong>{minutes}</strong>
                    <span>min</span>
                  </button>
                ))}
              </div>

              <div className="field-label">YOUR EXPERIENCE LEVEL</div>
              <div className="experience-options">
                {[
                  ["curious", "The Curious One", "Show me something new."],
                  ["explorer", "The Explorer", "I like finding patterns."],
                  ["researcher", "The Investigator", "Challenge my assumptions."],
                ].map(([value, title, description]) => (
                  <button
                    key={value}
                    className={`experience-option ${experience === value ? "selected" : ""}`}
                    onClick={() => setExperience(value)}
                  >
                    <span className="option-radio">
                      {experience === value && <span />}
                    </span>
                    <span className="experience-copy">
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    {experience === value && <Check size={17} />}
                  </button>
                ))}
              </div>

              <button
                className="primary-button full-button"
                onClick={startMission}
                disabled={loading}
              >
                {loading ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Compass size={18} />
                )}
                {loading ? "Finding your mission..." : "Find my mission"}
                {!loading && <ArrowRight size={17} />}
              </button>

              <p className="privacy-note">
                AI-designed for you. No photos. No special equipment.
              </p>

               <div className="fieldwork-note">
              <div className="fieldwork-note-icon">
                <Leaf size={19} />
              </div>
              <div>
                <strong>A little time. A different perspective.</strong>
                <p>
                  Observe the world, question what you see, and leave
                  with a new way of thinking.
                </p>
              </div>
            </div>
            </div>
                    
            <div className="setup-sidebar">
              <aside className="manifesto-panel">
                <div className="manifesto-icon"><Wind size={24} /></div>
                <span className="eyebrow">A SMALL REMINDER</span>
                <h3>Your phone is a tool.<br /><em>Not the experience.</em></h3>
                <p>
                  Your mission is meant to be experienced in the real world.
                  Read it first. Put your phone away. Come back when you're ready to reflect.
                </p>
                <div className="manifesto-rule" />
                <div className="manifesto-bottom">
                  <span>LOOK CLOSER</span>
                  <span>THINK DEEPER</span>
                </div>
              </aside>

              <aside className="noticing-panel">
                <div className="noticing-heading">
                  <span className="noticing-icon"><Sparkles size={17} /></span>
                  <span className="eyebrow">A PRACTICE IN CURIOSITY</span>
                </div>

                <h3>The art of noticing.</h3>
                <p className="noticing-intro">
                  Before you investigate, look at the familiar in an unfamiliar way.
                </p>

                <div className="noticing-prompt">
                  <span>01</span>
                  <div>
                    <strong>Find the unexpected</strong>
                    <p>What seems out of place in your surroundings?</p>
                  </div>
                </div>

                <div className="noticing-prompt">
                  <span>02</span>
                  <div>
                    <strong>Spot a pattern</strong>
                    <p>What repeats where you wouldn't expect it?</p>
                  </div>
                </div>

                <div className="noticing-prompt">
                  <span>03</span>
                  <div>
                    <strong>Question the obvious</strong>
                    <p>What explanation are you accepting without evidence?</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>

        )}

        {stage === "mission" && activity && (
          <div className="mission-layout">
            <article className="panel mission-card">
              <div className="mission-topline">
                <span className="mission-tag"><Compass size={14} /> FIELD MISSION</span>
                <span className="duration-tag">{duration} MIN</span>
              </div>
              <h3>{activity.title}</h3>
              <p className="role-line">TODAY, YOU ARE <strong>{activity.role}</strong></p>

              <div className="question-block">
                <span className="eyebrow">YOUR GUIDING QUESTION</span>
                <p>{activity.question}</p>
              </div>

              <div className="mission-copy">
                <span className="eyebrow">THE MISSION</span>
                <p>{activity.mission}</p>
              </div>

              <div className="rules-block">
                <span className="eyebrow">FIELD RULES</span>
                {activity.rules.map((rule, index) => (
                  <div className="rule-row" key={index}>
                    <Check size={16} /><span>{rule}</span>
                  </div>
                ))}
              </div>

              <div className="phone-away">
                <div className="phone-away-icon"><Leaf size={20} /></div>
                <div>
                  <strong>Now, put your phone away.</strong>
                  <p>Explore first. Record what you noticed when you return.</p>
                </div>
              </div>
            </article>

            <aside className="panel journal-card">
              <span className="eyebrow">02 — YOUR FIELD NOTES</span>
              <h3>What did you notice?</h3>
              <p className="muted">
                Take your time outdoors. When you're ready, record details you observed directly.
              </p>

              <div className="observation-counter">
                <span>OBSERVATIONS</span>
                <strong>{observations.length}<small> / {activity.observations_required}</small></strong>
              </div>

              <div className="observation-list">
                {observations.map((observation, index) => (
                  <div className="observation-item" key={`${index}-${observation}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{observation}</p>
                    <Check size={15} />
                  </div>
                ))}
              </div>

              <form onSubmit={saveObservation}>
                <label className="field-label" htmlFor="observation">FIELD NOTE</label>
                <textarea
                  id="observation"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="I noticed that..."
                  maxLength={1000}
                  rows={4}
                />
                <div className="voice-note-controls">
                  <button
                    type="button"
                    className={`voice-button ${isListening ? "listening" : ""}`}
                    onClick={startVoiceNote}
                    disabled={loading || isListening}
                  >
                    <Mic size={16} />
                    {isListening ? "Listening..." : "Speak your observation"}
                  </button>

                  {isListening && (
                    <span className="voice-status">Listening — speak naturally.</span>
                  )}

                  {voiceError && (
                    <span className="voice-error">{voiceError}</span>
                  )}
                </div>

                <button className="secondary-button full-button" type="submit" disabled={loading || !note.trim() || observations.length >= activity.observations_required}>
                  {loading ? <LoaderCircle className="spin" size={17} /> : <Send size={16} />}
                  Save observation
                </button>
              </form>

              <div className="hypothesis-divider"><span>WHEN YOU'RE DONE OBSERVING</span></div>
              <form onSubmit={requestDebrief}>
                <label className="field-label" htmlFor="hypothesis">YOUR HYPOTHESIS</label>
                <textarea
                  id="hypothesis"
                  value={hypothesis}
                  onChange={(event) => setHypothesis(event.target.value)}
                  placeholder="I think this pattern exists because..."
                  maxLength={1000}
                  rows={3}
                />
                <button className="primary-button full-button" type="submit" disabled={loading || observations.length === 0 || !hypothesis.trim()}>
                  {loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={17} />}
                  Reflect with AI <ArrowRight size={16} />
                </button>
                {observations.length === 0 && (
                  <p className="form-hint">Save at least one observation to unlock your debrief.</p>
                )}
              </form>
            </aside>
          </div>
        )}

        {stage === "debrief" && debrief && (
          <div className="debrief-layout">
            <div className="panel debrief-intro">
              <div className="debrief-symbol"><Sparkles size={23} /></div>
              <span className="eyebrow">YOUR INVESTIGATION, REVISITED</span>
              <h3>A hypothesis is a beginning, not a conclusion.</h3>
              <p>{debrief.summary}</p>
              <div className="submitted-hypothesis">
                <span className="eyebrow">YOUR HYPOTHESIS</span>
                <p>“{hypothesis}”</p>
              </div>
            </div>

            <div className="debrief-results">
              {[
                ["01", "What supports your thinking", "evidence"],
                ["02", "What you may be assuming", "assumptions"],
                ["03", "What to investigate next", "next_steps"],
              ].map(([number, title, key]) => (
                <article className="panel insight-card" key={key}>
                  <span className="insight-number">{number}</span>
                  <h4>{title}</h4>
                  <ul>
                    {(debrief[key] || []).map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>

            <div className="reflection-panel">
              <Sparkles size={20} />
              <div>
                <span className="eyebrow">TAKE THIS QUESTION WITH YOU</span>
                <p>{debrief.reflection_question}</p>
              </div>
            </div>

            <div className="finish-row">
              <p><Check size={16} /> Investigation complete. Curiosity isn't.</p>
              <button className="primary-button" onClick={reset}>
                Find another mission <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
      <footer className="footer">
        <span>
          perspectivity<span className="brand-dot">.</span>
        </span>

        <span>Made for the curious. Grounded in the real world.</span>

        <span className="footer-credit">
          Crafted with curiosity by <strong>Shuja</strong>
          <span className="brand-dot">.</span>
        </span>
      </footer>
    </main>
  );
}