import React, { useEffect, useMemo, useState } from "react";

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
function toDateLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatTimeRange(start, minutes) {
  const end = addMinutes(start, minutes);
  const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${fmt.format(start)}–${fmt.format(end)}`;
}
function generateRoundRobin(teams) {
  const list = teams.map(t=>t.trim()).filter(Boolean);
  const BYE = "(spielfrei)";
  if (list.length % 2 === 1) list.push(BYE);
  const n = list.length, rounds = n - 1, half = n/2;
  let arr = list.slice();
  const matches = [];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i], b = arr[n-1-i];
      if (a !== BYE && b !== BYE) matches.push({ round: r+1, home: a, away: b });
    }
    const fixed = arr[0];
    const moved = arr.splice(1);
    moved.unshift(moved.pop());
    arr = [fixed, ...moved];
  }
  return matches;
}
function buildSlots(startDate, fields, total, blockMin) {
  const slots = [];
  let current = new Date(startDate);
  let count = 0;
  while (count < total) {
    for (let f = 1; f <= fields && count < total; f++) {
      slots.push({ start: new Date(current), field: f });
      count++;
    }
    current = addMinutes(current, blockMin);
  }
  return slots;
}

// -------- Ergebnisse (Endstand) --------
function matchKey(r) {
  // Eindeutiger Schlüssel pro Spiel
  return `${r.round}-${r.home}-${r.away}-${r.field}-${r.start.toISOString()}`;
}
function parseScore(scoreStr) {
  // Erwartet "x:y" → {home, away} oder null
  if (typeof scoreStr !== "string") return null;
  const m = scoreStr.trim().match(/^(\d{1,3})\s*:\s*(\d{1,3})$/);
  if (!m) return null;
  return { home: Number(m[1]), away: Number(m[2]) };
}
function winnerFromScore(match, scoreStr) {
  const s = parseScore(scoreStr);
  if (!s) return "-";
  if (s.home > s.away) return match.home;
  if (s.away > s.home) return match.away;
  return "Unentschieden";
}

function toCSV(rows, scoresMap) {
  const header = ["Runde","Zeit","Feld","Heim","Auswärts","Endstand","Sieger"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const key = matchKey(r);
    const score = scoresMap[key] ?? "";
    const winner = winnerFromScore(r, score);
    const values = [
      r.round,
      formatTimeRange(r.start, r.duration),
      `Feld ${r.field}`,
      r.home,
      r.away,
      score,
      winner
    ].map(v => `"${String(v).replaceAll('"','""')}"`);
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [teamInput, setTeamInput] = useState("Team A\nTeam B\nTeam C\nTeam D");
  const [fields, setFields] = useState(2);
  const [matchMin, setMatchMin] = useState(20);
  const [breakMin, setBreakMin] = useState(5);
  const [startLocal, setStartLocal] = useState(() => {
    const d = new Date(); d.setSeconds(0,0); d.setHours(10,0,0,0); return toDateLocalInputValue(d);
  });
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Load data from server on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${API_URL}/api/tournament`);
        if (response.ok) {
          const data = await response.json();
          setTeamInput(data.teamInput || "Team A\nTeam B\nTeam C\nTeam D");
          setFields(data.fields || 2);
          setMatchMin(data.matchMin || 20);
          setBreakMin(data.breakMin || 5);
          setStartLocal(data.startLocal || toDateLocalInputValue(new Date()));
          setScores(data.scores || {});
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save data to server whenever values change (debounced)
  useEffect(() => {
    if (loading) return; // Don't save during initial load
    
    const timeoutId = setTimeout(async () => {
      try {
        setSaveStatus('Speichern...');
        const response = await fetch(`${API_URL}/api/tournament`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamInput, fields, matchMin, breakMin, startLocal, scores })
        });
        
        if (response.ok) {
          setSaveStatus('✓ Gespeichert');
          setTimeout(() => setSaveStatus(''), 2000);
        } else {
          setSaveStatus('✗ Fehler beim Speichern');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        setSaveStatus('✗ Fehler beim Speichern');
      }
    }, 1000); // Debounce: wait 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [teamInput, fields, matchMin, breakMin, startLocal, scores, loading]);

  const teams = useMemo(() =>
    teamInput.split(/\n|,|;|\|/).map(s=>s.trim()).filter(Boolean), [teamInput]);

  const schedule = useMemo(() => {
    if (teams.length < 2) return [];
    const matches = generateRoundRobin(teams);
    const slots = buildSlots(new Date(startLocal), Math.max(1, Number(fields)),
      matches.length, Number(matchMin)+Number(breakMin));
    return matches.map((m, i) => ({
      ...m, start: slots[i].start, field: slots[i].field, duration: Number(matchMin)
    }));
  }, [teams, fields, matchMin, breakMin, startLocal]);

  const endTime = useMemo(() => {
    if (schedule.length === 0) return new Date(startLocal);
    const blocks = Math.ceil(schedule.length / Math.max(1, Number(fields)));
    return addMinutes(new Date(startLocal), blocks * (Number(matchMin)+Number(breakMin)));
  }, [schedule, fields, matchMin, breakMin, startLocal]);

  function downloadCSV() {
    const csv = toCSV(schedule, scores);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "turnierplan.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  // Gruppiert nach Startzeit für Anzeige
  const grouped = useMemo(() => {
    const map = new Map();
    schedule.forEach(r => {
      const key = r.start.getTime();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return Array.from(map.entries()).sort((a,b)=>a[0]-b[0])
      .map(([ts, list]) => ({ ts: Number(ts), list: list.sort((a,b)=>a.field-b.field) }));
  }, [schedule]);

  // Nur Ziffern & Doppelpunkt erlauben, und höchstens ein Doppelpunkt
  function sanitizeScoreInput(value) {
    const cleaned = value.replace(/[^0-9:]/g, "");
    // nur den ersten Doppelpunkt behalten
    const first = cleaned.indexOf(":");
    if (first === -1) return cleaned;
    // links/rechts nur Ziffern
    const left = cleaned.slice(0, first).replace(/:/g, "");
    const right = cleaned.slice(first + 1).replace(/:/g, "");
    return `${left}:${right}`;
  }

  if (loading) {
    return (
      <div style={{fontFamily:"system-ui, Arial", padding:"16px", maxWidth:1200, margin:"0 auto", textAlign:"center"}}>
        <h1>⚽ Turnierplaner – Jeder gegen Jeden</h1>
        <p>Lade Daten...</p>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"system-ui, Arial", padding:"16px", maxWidth:1200, margin:"0 auto"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <h1 style={{margin:0}}>⚽ Turnierplaner – Jeder gegen Jeden</h1>
        {saveStatus && (
          <div style={{fontSize:14, color: saveStatus.includes('✓') ? '#22c55e' : saveStatus.includes('✗') ? '#ef4444' : '#6b7280'}}>
            {saveStatus}
          </div>
        )}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:16}}>
        <div style={{border:"1px solid #ddd", borderRadius:8, padding:12}}>
          <h3>Einstellungen</h3>

          <label>Teams (eine pro Zeile)</label>
          <textarea
            value={teamInput}
            onChange={e=>setTeamInput(e.target.value)}
            rows={10}
            style={{width:"100%", marginBottom:8}}
          />

          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            <div>
              <label>Anzahl Felder</label>
              <input type="number" min={1} value={fields} onChange={e=>setFields(Number(e.target.value))} style={{width:"100%"}} />
            </div>
            <div>
              <label>Start (Datum & Zeit)</label>
              <input type="datetime-local" value={startLocal} onChange={e=>setStartLocal(e.target.value)} style={{width:"100%"}} />
            </div>
            <div>
              <label>Spiel-Dauer (Min)</label>
              <input type="number" min={5} value={matchMin} onChange={e=>setMatchMin(Number(e.target.value))} style={{width:"100%"}} />
            </div>
            <div>
              <label>Pausen-Dauer (Min)</label>
              <input type="number" min={0} value={breakMin} onChange={e=>setBreakMin(Number(e.target.value))} style={{width:"100%"}} />
            </div>
          </div>

          <button onClick={downloadCSV} style={{marginTop:12, padding:"8px 12px"}}>CSV herunterladen</button>

          <p style={{fontSize:12, color:"#666", marginTop:8}}>
            Hinweis: Bei ungerader Teamanzahl wird automatisch „spielfrei“ eingefügt.
          </p>
        </div>

        <div style={{border:"1px solid #ddd", borderRadius:8, padding:12}}>
          <h3>Spielplan</h3>

          <div style={{display:"flex", gap:12, marginBottom:8, fontSize:14}}>
            <div style={{border:"1px solid #eee", borderRadius:8, padding:"8px 12px"}}>
              <div><strong>Teams</strong></div>
              <div>{teams.length}</div>
            </div>
            <div style={{border:"1px solid #eee", borderRadius:8, padding:"8px 12px"}}>
              <div><strong>Spiele gesamt</strong></div>
              <div>{schedule.length}</div>
            </div>
            <div style={{border:"1px solid #eee", borderRadius:8, padding:"8px 12px"}}>
              <div><strong>Vorauss. Ende</strong></div>
              <div>{new Intl.DateTimeFormat(undefined, {dateStyle:"medium", timeStyle:"short"}).format(endTime)}</div>
            </div>
          </div>

          {teams.length < 2 ? (
            <p>Füge mindestens zwei Teams hinzu.</p>
          ) : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f6f6f6"}}>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Zeit</th>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Feld</th>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Runde</th>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Begegnung</th>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Endstand (z. B. 1:1)</th>
                    <th style={{textAlign:"left", padding:8, borderBottom:"1px solid #eee"}}>Sieger</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(({ ts, list }) =>
                    list.map((r, i) => {
                      const key = matchKey(r);
                      const score = scores[key] ?? "";
                      const winner = winnerFromScore(r, score);
                      return (
                        <tr key={`${ts}-${r.field}-${i}`} style={{borderBottom:"1px solid #f0f0f0"}}>
                          <td style={{padding:8, whiteSpace:"nowrap"}}>{formatTimeRange(new Date(ts), r.duration)}</td>
                          <td style={{padding:8}}>Feld {r.field}</td>
                          <td style={{padding:8}}>{r.round}</td>
                          <td style={{padding:8, fontWeight:600}}>{r.home} <span style={{color:"#888"}}>vs</span> {r.away}</td>
                          <td style={{padding:8, minWidth:110}}>
                            <input
                              type="text"
                              placeholder="1:1"
                              value={score}
                              onChange={(e) => {
                                const val = sanitizeScoreInput(e.target.value);
                                setScores((prev) => ({ ...prev, [key]: val }));
                              }}
                              style={{width:90, padding:"6px 8px"}}
                              inputMode="numeric"
                              pattern="^\d{1,3}:\d{1,3}$"
                            />
                          </td>
                          <td style={{padding:8}}>{winner}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p style={{fontSize:12, color:"#666", marginTop:16}}>Tipp: CSV in Excel/Google Sheets importieren.</p>
    </div>
  );
}
