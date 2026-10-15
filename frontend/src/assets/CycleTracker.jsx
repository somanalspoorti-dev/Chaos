import { useEffect, useState } from "react";
import {
  Heart,
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  BookOpen,
  Stethoscope,
  Menu,
  X,
  ChevronRight,
  Activity,
  ShieldCheck,
  Plus,
  Clock,
  CheckCircle,
  Sparkles,
  Droplets,
  Smile,
  Moon,
  Sun,
  CircleHelp,
  Settings,
  ArrowRight,
  Flower2,
} from "lucide-react";

import "./CycleTracker.css";

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

const todayString = () => {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function differenceInDays(first, second) {
  const a = new Date(`${first}T12:00:00`);
  const b = new Date(`${second}T12:00:00`);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString, options = {}) {
  if (!dateString) return "Not set";

  return new Date(`${dateString}T12:00:00`).toLocaleDateString(
    "en-IN",
    options
  );
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Calendar", icon: CalendarDays },
  { label: "Log Symptoms", icon: ClipboardList },
  { label: "Wellness Guide", icon: BookOpen },
];

const symptomOptions = [
  "Cramps",
  "Headache",
  "Bloating",
  "Fatigue",
  "Mood swings",
  "Acne",
  "Back pain",
  "Tender breasts",
];

const wellnessTips = [
  {
    icon: Droplets,
    title: "Stay hydrated",
    text: "Drink water regularly throughout the day.",
  },
  {
    icon: Moon,
    title: "Rest when you need to",
    text: "A consistent sleep routine can support your wellbeing.",
  },
  {
    icon: Sun,
    title: "Gentle movement",
    text: "Try walking or stretching if it feels comfortable.",
  },
];

export default function CycleTracker() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const [lastPeriod, setLastPeriod] = useState(
    () => readStorage("cycleLastPeriod", "")
  );

  const [cycleLength, setCycleLength] = useState(
    () => readStorage("cycleLength", DEFAULT_CYCLE_LENGTH)
  );

  const [periodLength, setPeriodLength] = useState(
    () => readStorage("periodLength", DEFAULT_PERIOD_LENGTH)
  );

  const [periods, setPeriods] = useState(
    () => readStorage("cyclePeriods", [])
  );

  const [logs, setLogs] = useState(
    () => readStorage("cycleSymptomLogs", {})
  );

  const [selectedDate, setSelectedDate] = useState(todayString());
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [flow, setFlow] = useState("Medium");
  const [mood, setMood] = useState("Okay");
  const [note, setNote] = useState("");
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [periodStartInput, setPeriodStartInput] = useState(todayString());
  const [periodEndInput, setPeriodEndInput] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("cycleLastPeriod", JSON.stringify(lastPeriod));
    localStorage.setItem("cycleLength", JSON.stringify(cycleLength));
    localStorage.setItem("periodLength", JSON.stringify(periodLength));
    localStorage.setItem("cyclePeriods", JSON.stringify(periods));
    localStorage.setItem("cycleSymptomLogs", JSON.stringify(logs));
  }, [lastPeriod, cycleLength, periodLength, periods, logs]);

  const today = todayString();

  const nextPeriod = lastPeriod
    ? addDays(lastPeriod, Number(cycleLength))
    : null;

  const ovulationDate = lastPeriod
    ? addDays(lastPeriod, Number(cycleLength) - 14)
    : null;

  const fertileStart = ovulationDate
    ? addDays(ovulationDate, -5)
    : null;

  const fertileEnd = ovulationDate
    ? addDays(ovulationDate, 1)
    : null;

  const cycleDay = lastPeriod
    ? Math.max(1, differenceInDays(lastPeriod, today) + 1)
    : null;

  const daysUntilPeriod = nextPeriod
    ? differenceInDays(today, nextPeriod)
    : null;

  const isPeriodDay = (date) => {
    if (!lastPeriod) return false;

    const elapsed = differenceInDays(lastPeriod, date);

    return (
      elapsed >= 0 &&
      elapsed < Number(periodLength) &&
      differenceInDays(today, date) >= 0
    );
  };

  function showMessage(message) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  function handlePeriodSubmit(event) {
    event.preventDefault();

    if (!periodStartInput) {
      showMessage("Please select a start date.");
      return;
    }

    if (periodStartInput > today) {
      showMessage("Please select today or an earlier date.");
      return;
    }

    if (periodEndInput && periodEndInput < periodStartInput) {
      showMessage("End date cannot be before start date.");
      return;
    }

    if (periodEndInput && periodEndInput > today) {
      showMessage("End date cannot be in the future.");
      return;
    }

    const entry = {
      start: periodStartInput,
      end: periodEndInput || "",
    };

    const updated = [
      ...periods.filter((item) => item.start !== entry.start),
      entry,
    ].sort((a, b) => a.start.localeCompare(b.start));

    const previousEntries = updated.filter(
      (item) => item.start < entry.start
    );

    let calculatedCycleLength = Number(cycleLength);

    if (previousEntries.length > 0) {
      const previous = previousEntries[previousEntries.length - 1];
      const observedLength = differenceInDays(previous.start, entry.start);

      if (observedLength >= 15 && observedLength <= 60) {
        calculatedCycleLength = observedLength;
        setCycleLength(observedLength);
      }
    }

    const selectedPeriodLength = entry.end
      ? differenceInDays(entry.start, entry.end) + 1
      : Number(periodLength);

    setPeriodLength(
      Math.min(10, Math.max(1, selectedPeriodLength))
    );
    setLastPeriod(entry.start);
    setPeriods(updated);
    setShowPeriodForm(false);
    showMessage("Period dates saved successfully.");
  }

  function handleSaveSymptoms(event) {
    event.preventDefault();

    const entry = {
      symptoms: selectedSymptoms,
      flow,
      mood,
      note,
    };

    setLogs((previous) => ({
      ...previous,
      [selectedDate]: entry,
    }));

    showMessage("Your daily log has been saved.");

    setSelectedSymptoms([]);
    setNote("");
  }

  function toggleSymptom(symptom) {
    setSelectedSymptoms((previous) =>
      previous.includes(symptom)
        ? previous.filter((item) => item !== symptom)
        : [...previous, symptom]
    );
  }

  function changePage(page) {
    setActivePage(page);
    setMenuOpen(false);
  }

  function renderCalendar() {
    const firstDay = new Date(
      new Date(`${selectedDate.slice(0, 7)}-01T12:00:00`).getTime()
    );

    const year = firstDay.getFullYear();
    const month = firstDay.getMonth();
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
        `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`
      );
    }

    return (
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <div className="calendar-weekday" key={day}>
              {day}
            </div>
          )
        )}

        {cells.map((date, index) => {
          if (!date) {
            return <div className="calendar-empty" key={`empty-${index}`} />;
          }

          const periodDay = isPeriodDay(date);
          const fertileDay =
            fertileStart &&
            fertileEnd &&
            date >= fertileStart &&
            date <= fertileEnd;

          const selected = date === selectedDate;
          const isToday = date === today;

          return (
            <button
              key={date}
              type="button"
              className={[
                "calendar-day",
                periodDay ? "period-day" : "",
                fertileDay && !periodDay ? "fertile-day" : "",
                selected ? "selected-day" : "",
                isToday ? "today-day" : "",
              ].join(" ")}
              onClick={() => {
                setSelectedDate(date);
                const existing = logs[date];
                setSelectedSymptoms(existing?.symptoms || []);
                setFlow(existing?.flow || "Medium");
                setMood(existing?.mood || "Okay");
                setNote(existing?.note || "");
                setActivePage("Log Symptoms");
              }}
              aria-label={formatDate(date, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            >
              {Number(date.slice(-2))}
              {periodDay && <span className="day-dot" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="cycle-app">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Heart size={23} fill="currentColor" />
          </div>
          <div>
            <h1>CycleCare</h1>
            <span>Your wellness companion</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="nav-caption">YOUR SPACE</div>

        <nav className="navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "nav-active" : ""
              }`}
              onClick={() => changePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {activePage === label && (
                <ChevronRight className="nav-chevron" size={17} />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <ShieldCheck size={23} />
            <div>
              <strong>Your data, your choice</strong>
              <p>Your entries are saved in this browser.</p>
            </div>
          </div>

          <div className="sidebar-footer">
            <Flower2 size={19} />
            <span>Take care of yourself, always.</span>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <div className="breadcrumb">
            <span>CycleCare</span>
            <ChevronRight size={15} />
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="today-label">
              <CalendarDays size={16} />
              {formatDate(today, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="profile-avatar">
              <Heart size={18} />
            </div>
          </div>
        </header>

        {savedMessage && (
          <div className="toast-message" role="status">
            <CheckCircle size={18} />
            {savedMessage}
          </div>
        )}

        {activePage === "Dashboard" && (
          <section className="page">
            <div className="welcome-section">
              <div>
                <div className="eyebrow">
                  <Sparkles size={15} />
                  YOUR PERSONAL WELLNESS SPACE
                </div>
                <h2>
                  Hello, beautiful <span>♡</span>
                </h2>
                <p>
                  Get to know your cycle, understand your body, and
                  take care of yourself one day at a time.
                </p>
              </div>

              <div className="welcome-art">
                <Flower2 size={82} strokeWidth={1.1} />
              </div>
            </div>

            {!lastPeriod && (
              <div className="setup-banner">
                <div className="setup-icon">
                  <CalendarDays size={24} />
                </div>
                <div className="setup-copy">
                  <strong>Let's set up your cycle</strong>
                  <p>
                    Log the first day of your last period to start
                    receiving estimated cycle predictions.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setShowPeriodForm(true)}
                >
                  Get started <ArrowRight size={17} />
                </button>
              </div>
            )}

            <div className="section-heading">
              <div>
                <h3>Your cycle overview</h3>
                <p>A little insight into your current cycle.</p>
              </div>
              <button
                className="text-button"
                onClick={() => changePage("My Calendar")}
              >
                View calendar <ChevronRight size={16} />
              </button>
            </div>

            <div className="stats-grid">
              <article className="stat-card stat-pink">
                <div className="stat-top">
                  <div className="stat-icon">
                    <Droplets size={20} />
                  </div>
                  <span className="stat-tag">PERIOD</span>
                </div>
                <div className="stat-number">
                  {lastPeriod ? `Day ${cycleDay}` : "—"}
                </div>
                <div className="stat-label">Current cycle day</div>
                <div className="stat-foot">
                  {lastPeriod
                    ? `Started ${formatDate(lastPeriod, {
                        day: "numeric",
                        month: "short",
                      })}`
                    : "Add your last period"}
                </div>
              </article>

              <article className="stat-card stat-purple">
                <div className="stat-top">
                  <div className="stat-icon">
                    <CalendarDays size={20} />
                  </div>
                  <span className="stat-tag">ESTIMATE</span>
                </div>
                <div className="stat-number">
                  {daysUntilPeriod === null
                    ? "—"
                    : daysUntilPeriod <= 0
                      ? "Due"
                      : `${daysUntilPeriod} days`}
                </div>
                <div className="stat-label">Until next period</div>
                <div className="stat-foot">
                  {nextPeriod
                    ? formatDate(nextPeriod, {
                        day: "numeric",
                        month: "short",
                      })
                    : "Prediction not available"}
                </div>
              </article>

              <article className="stat-card stat-peach">
                <div className="stat-top">
                  <div className="stat-icon">
                    <Heart size={20} />
                  </div>
                  <span className="stat-tag">CYCLE</span>
                </div>
                <div className="stat-number">{cycleLength} days</div>
                <div className="stat-label">Cycle length</div>
                <div className="stat-foot">
                  {periods.length > 1
                    ? "Based on your saved dates"
                    : "Using your selected average"}
                </div>
              </article>

              <article className="stat-card stat-green">
                <div className="stat-top">
                  <div className="stat-icon">
                    <Activity size={20} />
                  </div>
                  <span className="stat-tag">WELLNESS</span>
                </div>
                <div className="stat-number">
                  {logs[today] ? "Logged" : "Ready"}
                </div>
                <div className="stat-label">Today's check-in</div>
                <div className="stat-foot">
                  {logs[today]
                    ? "Today's log is saved"
                    : "How are you feeling?"}
                </div>
              </article>
            </div>

            <div className="dashboard-columns">
              <section className="content-card cycle-card">
                <div className="card-heading">
                  <div>
                    <h3>Your cycle journey</h3>
                    <p>Explore the estimated phases of your cycle.</p>
                  </div>
                  <div className="heading-icon">
                    <Activity size={20} />
                  </div>
                </div>

                {lastPeriod ? (
                  <>
                    <div className="cycle-progress">
                      <div
                        className="cycle-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (Math.max(1, cycleDay) /
                              Number(cycleLength)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="cycle-progress-labels">
                      <span>Day 1</span>
                      <span>Day {cycleLength}</span>
                    </div>

                    <div className="phase-list">
                      <div className="phase-item">
                        <span className="phase-dot phase-menstrual" />
                        <div>
                          <strong>Menstrual phase</strong>
                          <p>
                            Estimated period days:{" "}
                            {formatDate(lastPeriod, {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            onward
                          </p>
                        </div>
                      </div>
                      <div className="phase-item">
                        <span className="phase-dot phase-follicular" />
                        <div>
                          <strong>Follicular phase</strong>
                          <p>
                            The first half of the cycle leading up to
                            estimated ovulation.
                          </p>
                        </div>
                      </div>
                      <div className="phase-item">
                        <span className="phase-dot phase-ovulation" />
                        <div>
                          <strong>Estimated ovulation</strong>
                          <p>
                            {formatDate(ovulationDate, {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="phase-item">
                        <span className="phase-dot phase-luteal" />
                        <div>
                          <strong>Luteal phase</strong>
                          <p>
                            The days leading up to your next estimated
                            period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <CalendarDays size={35} />
                    <strong>Your cycle journey starts here</strong>
                    <p>
                      Add your last period date to see your estimated
                      cycle timeline.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => setShowPeriodForm(true)}
                    >
                      Add period date
                    </button>
                  </div>
                )}
              </section>

              <section className="content-card today-card">
                <div className="card-heading">
                  <div>
                    <h3>Today's check-in</h3>
                    <p>Make space for yourself today.</p>
                  </div>
                  <div className="heading-icon peach-icon">
                    <Smile size={21} />
                  </div>
                </div>

                <div className="checkin-illustration">
                  <Heart size={29} />
                  <span>How are you feeling today?</span>
                </div>

                <p className="checkin-description">
                  Your mood and symptoms can change throughout your
                  cycle. Track them to notice patterns over time.
                </p>

                {logs[today] ? (
                  <div className="saved-checkin">
                    <CheckCircle size={20} />
                    <div>
                      <strong>Today's check-in is saved</strong>
                      <p>{logs[today].mood || "Mood not specified"}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    className="primary-button full-button"
                    onClick={() => changePage("Log Symptoms")}
                  >
                    Log today's symptoms <ArrowRight size={17} />
                  </button>
                )}

                <div className="small-reminder">
                  <ShieldCheck size={16} />
                  No judgment. Just getting to know yourself.
                </div>
              </section>
            </div>

            <section className="content-card tips-card">
              <div className="card-heading">
                <div>
                  <h3>A little self-care</h3>
                  <p>Small things that can help you feel supported.</p>
                </div>
                <Sparkles size={22} className="tips-sparkle" />
              </div>

              <div className="tips-grid">
                {wellnessTips.map(({ icon: Icon, title, text }) => (
                  <article className="tip-item" key={title}>
                    <div className="tip-icon">
                      <Icon size={21} />
                    </div>
                    <div>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="disclaimer">
              <CircleHelp size={17} />
              <p>
                Cycle predictions are estimates, not medical advice.
                They cannot reliably determine ovulation or prevent
                pregnancy.
              </p>
            </div>
          </section>
        )}

        {activePage === "My Calendar" && (
          <section className="page">
            <div className="page-title">
              <div>
                <div className="eyebrow">YOUR MONTH AT A GLANCE</div>
                <h2>My calendar <span>♡</span></h2>
                <p>
                  Select a date to record how you feel and keep track
                  of your cycle.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => setShowPeriodForm(true)}
              >
                <Plus size={18} /> Log period
              </button>
            </div>

            <div className="content-card calendar-card">
              <div className="calendar-toolbar">
                <div>
                  <h3>
                    {formatDate(`${selectedDate.slice(0, 7)}-01`, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                  <p>Choose any date to add or view a daily log.</p>
                </div>
                <div className="month-controls">
                  <button
                    className="icon-button"
                    aria-label="Previous month"
                    onClick={() =>
                      setSelectedDate((date) => {
                        const d = new Date(`${date}T12:00:00`);
                        d.setMonth(d.getMonth() - 1);
                        return `${d.getFullYear()}-${String(
                          d.getMonth() + 1
                        ).padStart(2, "0")}-01`;
                      })
                    }
                  >
                    ‹
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Next month"
                    onClick={() =>
                      setSelectedDate((date) => {
                        const d = new Date(`${date}T12:00:00`);
                        d.setMonth(d.getMonth() + 1);
                        return `${d.getFullYear()}-${String(
                          d.getMonth() + 1
                        ).padStart(2, "0")}-01`;
                      })
                    }
                  >
                    ›
                  </button>
                </div>
              </div>

              {renderCalendar()}

              <div className="calendar-legend">
                <span><i className="legend-period" /> Period estimate</span>
                <span><i className="legend-fertile" /> Estimated fertile window</span>
                <span><i className="legend-today" /> Today</span>
              </div>
            </div>

            <div className="content-card selected-date-card">
              <div className="heading-icon">
                <CalendarDays size={21} />
              </div>
              <div className="selected-date-info">
                <strong>
                  {formatDate(selectedDate, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <p>
                  {logs[selectedDate]
                    ? `${logs[selectedDate].symptoms?.length || 0} symptoms recorded`
                    : "No daily log for this date yet."}
                </p>
              </div>
              <button
                className="secondary-button"
                onClick={() => {
                  const existing = logs[selectedDate];
                  setSelectedSymptoms(existing?.symptoms || []);
                  setFlow(existing?.flow || "Medium");
                  setMood(existing?.mood || "Okay");
                  setNote(existing?.note || "");
                  changePage("Log Symptoms");
                }}
              >
                {logs[selectedDate] ? "View / edit log" : "Add daily log"}
              </button>
            </div>
          </section>
        )}

        {activePage === "Log Symptoms" && (
          <section className="page">
            <div className="page-title">
              <div>
                <div className="eyebrow">CHECK IN WITH YOURSELF</div>
                <h2>How are you feeling? <span>♡</span></h2>
                <p>
                  There is no right or wrong way to feel. Record only
                  what you are comfortable sharing.
                </p>
              </div>
            </div>

            <form className="content-card log-form" onSubmit={handleSaveSymptoms}>
              <div className="form-heading">
                <div className="heading-icon"><ClipboardList size={21} /></div>
                <div>
                  <h3>Your daily journal</h3>
                  <p>Entries are stored locally in this browser.</p>
                </div>
              </div>

              <label className="field-label" htmlFor="log-date">
                Select date
              </label>
              <input
                id="log-date"
                type="date"
                className="text-input"
                value={selectedDate}
                max={today}
                onChange={(event) => {
                  const date = event.target.value;
                  setSelectedDate(date);
                  const existing = logs[date];
                  setSelectedSymptoms(existing?.symptoms || []);
                  setFlow(existing?.flow || "Medium");
                  setMood(existing?.mood || "Okay");
                  setNote(existing?.note || "");
                }}
                required
              />

              <div className="form-divider" />

              <div className="field-label">How is your mood?</div>
              <div className="mood-grid">
                {[
                  { label: "Happy", emoji: "😊" },
                  { label: "Okay", emoji: "🙂" },
                  { label: "Anxious", emoji: "😟" },
                  { label: "Low", emoji: "😔" },
                  { label: "Irritated", emoji: "😤" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    className={`mood-option ${
                      mood === item.label ? "mood-selected" : ""
                    }`}
                    onClick={() => setMood(item.label)}
                  >
                    <span>{item.emoji}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="form-divider" />

              <div className="field-label">Any symptoms today?</div>
              <p className="field-hint">
                Select all that apply, or skip this section.
              </p>
              <div className="symptom-grid">
                {symptomOptions.map((symptom) => (
                  <button
                    type="button"
                    key={symptom}
                    className={`symptom-option ${
                      selectedSymptoms.includes(symptom)
                        ? "symptom-selected"
                        : ""
                    }`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {selectedSymptoms.includes(symptom) ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                    {symptom}
                  </button>
                ))}
              </div>

              <div className="form-divider" />

              <label className="field-label" htmlFor="flow">
                Period flow (if applicable)
              </label>
              <select
                id="flow"
                className="text-input"
                value={flow}
                onChange={(event) => setFlow(event.target.value)}
              >
                <option>None</option>
                <option>Spotting</option>
                <option>Light</option>
                <option>Medium</option>
                <option>Heavy</option>
              </select>

              <label className="field-label note-label" htmlFor="daily-note">
                Personal notes
              </label>
              <textarea
                id="daily-note"
                className="text-input note-input"
                placeholder="Anything else you'd like to remember about today..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                maxLength={1000}
              />

              <div className="form-actions">
                <span className="privacy-note">
                  <ShieldCheck size={16} /> Private to this browser
                </span>
                <button type="submit" className="primary-button">
                  <CheckCircle size={18} /> Save my log
                </button>
              </div>

              {logs[selectedDate] && (
                <div className="existing-log">
                  <CheckCircle size={18} />
                  A saved log already exists for this date. Saving again
                  will update it.
                </div>
              )}
            </form>
          </section>
        )}

        {activePage === "Wellness Guide" && (
          <section className="page">
            <div className="page-title">
              <div>
                <div className="eyebrow">GENTLE REMINDERS</div>
                <h2>Your wellness guide <span>♡</span></h2>
                <p>
                  Simple, practical ways to support your wellbeing
                  throughout your menstrual cycle.
                </p>
              </div>
            </div>

            <div className="wellness-hero">
              <div>
                <Sparkles size={24} />
                <h3>Your body deserves kindness.</h3>
                <p>
                  Your experience is unique. Listen to your body and
                  give yourself permission to rest when you need it.
                </p>
              </div>
              <Flower2 size={100} strokeWidth={1} />
            </div>

            <div className="wellness-grid">
              {[
                {
                  icon: Droplets,
                  title: "Hydration",
                  text: "Keep water nearby and drink regularly. Your hydration needs may vary with activity and weather.",
                },
                {
                  icon: Moon,
                  title: "Sleep & rest",
                  text: "Aim for a regular sleep schedule. Allow yourself extra rest when you feel tired.",
                },
                {
                  icon: Activity,
                  title: "Movement",
                  text: "Gentle walking, stretching, or your usual exercise may feel good. Adapt movement to your comfort.",
                },
                {
                  icon: Heart,
                  title: "Emotional wellbeing",
                  text: "Notice changes in your mood without judging yourself. Talk to someone you trust if you need support.",
                },
                {
                  icon: Sun,
                  title: "Balanced meals",
                  text: "Eat regular, varied meals that give you energy. Choose foods you enjoy and can access.",
                },
                {
                  icon: Stethoscope,
                  title: "Know when to seek help",
                  text: "Talk with a healthcare professional about severe pain, unusually heavy bleeding, or persistent concerns.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <article className="wellness-card" key={title}>
                  <div className="tip-icon"><Icon size={23} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className="disclaimer medical-note">
              <Stethoscope size={19} />
              <p>
                This app is for educational and personal tracking
                purposes, not diagnosis or treatment. If you experience
                severe pain, very heavy bleeding, or other worrying
                symptoms, seek medical advice.
              </p>
            </div>
          </section>
        )}

        <footer className="app-footer">
          <Heart size={15} />
          Made with care for every cycle.
          <span>CycleCare · Personal wellness tracker</span>
        </footer>
      </main>

      {showPeriodForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowPeriodForm(false);
            }
          }}
        >
          <div
            className="period-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="period-modal-title"
          >
            <div className="modal-heading">
              <div className="heading-icon"><Droplets size={22} /></div>
              <button
                className="icon-button"
                onClick={() => setShowPeriodForm(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="period-modal-title">Log your period</h3>
            <p className="modal-description">
              Enter your period dates to estimate your upcoming cycle.
            </p>

            <form onSubmit={handlePeriodSubmit}>
              <label className="field-label" htmlFor="period-start">
                First day of your period
              </label>
              <input
                id="period-start"
                type="date"
                className="text-input"
                value={periodStartInput}
                max={today}
                onChange={(event) => setPeriodStartInput(event.target.value)}
                required
              />

              <label className="field-label note-label" htmlFor="period-end">
                Last day of your period (optional)
              </label>
              <input
                id="period-end"
                type="date"
                className="text-input"
                value={periodEndInput}
                min={periodStartInput}
                max={today}
                onChange={(event) => setPeriodEndInput(event.target.value)}
              />

              <div className="modal-note">
                <CircleHelp size={17} />
                If your period has not ended, leave the last day blank.
              </div>

              <button type="submit" className="primary-button full-button">
                <CheckCircle size={18} /> Save period dates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}