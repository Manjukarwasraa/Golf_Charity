import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  addScore,
  getCharities,
  getScores,
  runDraw,
  selectCharity,
} from "../services/api";

function Dashboard({ token, user, onLogout, onUserUpdate }) {
  const [scores, setScores] = useState([]);
  const [scoreInput, setScoreInput] = useState("");
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(user.charity || "");
  const [drawResult, setDrawResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [isSavingCharity, setIsSavingCharity] = useState(false);
  const [isRunningDraw, setIsRunningDraw] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [scoreData, charityData] = await Promise.all([
          getScores(token),
          getCharities(),
        ]);

        setScores(scoreData);
        setCharities(charityData);
      } catch (apiError) {
        if (apiError.status === 401) {
          onLogout();
          return;
        }

        setError(apiError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token, onLogout]);

  useEffect(() => {
    setSelectedCharity(user.charity || "");
  }, [user.charity]);

  const totalEntries = scores.length;
  const averageScore = useMemo(() => {
    if (!scores.length) {
      return "-";
    }

    const total = scores.reduce((sum, item) => sum + item.score, 0);
    return (total / scores.length).toFixed(1);
  }, [scores]);

  const bestScore = useMemo(() => {
    if (!scores.length) {
      return "-";
    }

    return Math.min(...scores.map((item) => item.score));
  }, [scores]);

  const refreshScores = async () => {
    const updatedScores = await getScores(token);
    setScores(updatedScores);
  };

  const handleAddScore = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSavingScore(true);

    try {
      await addScore(scoreInput, token);
      setScoreInput("");
      await refreshScores();
      setNotice("Score saved to your recent rounds.");
    } catch (apiError) {
      if (apiError.status === 401) {
        onLogout();
        return;
      }

      setError(apiError.message);
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleCharitySave = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSavingCharity(true);

    try {
      const response = await selectCharity(selectedCharity, token);
      onUserUpdate(response.user);
      setNotice(response.msg);
    } catch (apiError) {
      if (apiError.status === 401) {
        onLogout();
        return;
      }

      setError(apiError.message);
    } finally {
      setIsSavingCharity(false);
    }
  };

  const handleDraw = async () => {
    setError("");
    setNotice("");
    setIsRunningDraw(true);

    try {
      const response = await runDraw(token);
      setDrawResult(response);
      setNotice(response.message);
    } catch (apiError) {
      if (apiError.status === 401) {
        onLogout();
        return;
      }

      setError(apiError.message);
    } finally {
      setIsRunningDraw(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <main className="dashboard-layout">
        <Navbar user={user} onLogout={onLogout} />

        {error ? <p className="status-banner error dashboard-status">{error}</p> : null}
        {notice ? <p className="status-banner success dashboard-status">{notice}</p> : null}

        <section className="summary-grid">
          <article className="summary-card accent-card">
            <p className="eyebrow">Active cause</p>
            <h2>{user.charity || "Choose your charity"}</h2>
            <p>
              Keep your preferred organization selected so every visit feels ready for action.
            </p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Recent rounds</p>
            <h2>{totalEntries}</h2>
            <p>Your dashboard stores your latest five scores.</p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Average score</p>
            <h2>{averageScore}</h2>
            <p>Calculated from your saved rounds.</p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Best score</p>
            <h2>{bestScore}</h2>
            <p>Your strongest performance in the recent set.</p>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel panel-large">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Round entry</p>
                <h3>Add a score</h3>
              </div>
              <span className="pill">Numbers 1-45</span>
            </div>

            <form className="inline-form" onSubmit={handleAddScore}>
              <label className="field">
                <span>Enter score</span>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={scoreInput}
                  onChange={(event) => setScoreInput(event.target.value)}
                  placeholder="28"
                  required
                />
              </label>
              <button className="button primary-button" type="submit" disabled={isSavingScore}>
                {isSavingScore ? "Saving..." : "Save Score"}
              </button>
            </form>

            <div className="score-list">
              <div className="panel-header compact">
                <div>
                  <p className="eyebrow">History</p>
                  <h3>Your last rounds</h3>
                </div>
              </div>

              {isLoading ? (
                <p className="empty-state">Loading your score history...</p>
              ) : scores.length ? (
                <ul className="score-items">
                  {scores.map((entry) => (
                    <li key={entry._id} className="score-item">
                      <strong>{entry.score}</strong>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No scores yet. Add your first round to get started.</p>
              )}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Cause selection</p>
                <h3>Choose a charity</h3>
              </div>
            </div>

            <form className="stack-form" onSubmit={handleCharitySave}>
              <label className="field">
                <span>Preferred charity</span>
                <select
                  value={selectedCharity}
                  onChange={(event) => setSelectedCharity(event.target.value)}
                  required
                >
                  <option value="">Select a charity</option>
                  {charities.map((charity) => (
                    <option key={charity._id} value={charity.name}>
                      {charity.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="charity-list">
                {charities.map((charity) => (
                  <div key={charity._id} className="charity-item">
                    <strong>{charity.name}</strong>
                    <span>{charity.description}</span>
                  </div>
                ))}
              </div>

              <button className="button secondary-button" type="submit" disabled={isSavingCharity}>
                {isSavingCharity ? "Saving..." : "Save Charity"}
              </button>
            </form>
          </article>

          <article className="panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Lucky draw</p>
                <h3>Run today&apos;s draw</h3>
              </div>
            </div>

            <p className="panel-copy">
              Generate a fresh draw, compare it against your saved scores, and see how many matches you land.
            </p>

            <button className="button primary-button" onClick={handleDraw} disabled={isRunningDraw}>
              {isRunningDraw ? "Running draw..." : "Run Draw"}
            </button>

            {drawResult ? (
              <div className="draw-result">
                <div>
                  <span>Draw numbers</span>
                  <strong>{drawResult.drawNumbers.join(", ")}</strong>
                </div>
                <div>
                  <span>Your scores</span>
                  <strong>
                    {drawResult.userScores.length ? drawResult.userScores.join(", ") : "No saved scores"}
                  </strong>
                </div>
                <div>
                  <span>Matches</span>
                  <strong>{drawResult.matches}</strong>
                </div>
              </div>
            ) : (
              <p className="empty-state">Run the draw to see your numbers and match count.</p>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
