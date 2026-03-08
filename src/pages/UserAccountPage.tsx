import { useState, useEffect } from "react";
import { useAuth } from '../utilities/AuthContext';
import * as ticketService from '../services/ticketService';
import { Ticket } from '../utilities/types';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

const TYPE_COLOR = { ACTIVE: "#22c55e", USED: "#fbbf24", REFUNDED: "#ef4444" };

interface TicketCardProps {
  ticket: Ticket;
  selected: boolean;
  onClick: () => void;
}

function TicketCard({ ticket, selected, onClick }: TicketCardProps) {
  const accent = TYPE_COLOR[(ticket.status as keyof typeof TYPE_COLOR)] ?? "#22c55e";
  const d = new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate);
  const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        transition: "transform 0.25s, box-shadow 0.25s",
        transform: selected ? "translateY(-4px) scale(1.015)" : "scale(1)",
        boxShadow: selected
          ? `0 20px 50px rgba(0,0,0,0.65), 0 0 0 1.5px ${accent}`
          : "0 6px 24px rgba(0,0,0,0.45)",
        borderRadius: 10,
        overflow: "hidden",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        userSelect: "none",
        width: "100%",
        maxWidth: 480,
      }}
    >
      <div style={{ display: "flex", background: "linear-gradient(135deg,#1a1f2e,#111827)" }}>
        {/* Accent stripe */}
        <div style={{ width: 5, background: accent, flexShrink: 0 }} />
        {/* Date stub */}
        <div
          style={{
            width: 68,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 6px",
            borderRight: "1px dashed rgba(255,255,255,0.1)",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: 2, color: accent }}>{month}</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{year}</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{timeStr}</span>
        </div>
        {/* Main info */}
        <div style={{ flex: 1, padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: 8, letterSpacing: 3, color: accent, textTransform: "uppercase" }}>
            {ticket.ticketTypeName ?? 'General'} TICKET
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.25,
              fontFamily: "'Playfair Display', Georgia, serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ticket.eventName}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>📍 {ticket.eventVenue ?? ticket.venue ?? 'Venue TBD'}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>🪑 {ticket.ticketNote ?? 'General Admission'}</div>
          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px dashed rgba(255,255,255,0.09)",
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.28)" }}>
              {ticket.qrCode ? (
                <img src={ticket.qrCode} alt="QR Code" style={{ width: 60, height: 60, background: '#fff', borderRadius: 6, marginBottom: 2 }} />
              ) : (
                <div style={{ width: 60, height: 60, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>No QR</div>
              )}
              <div style={{ fontSize: 7, letterSpacing: 2, marginTop: 1 }}>{ticket.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>PRICE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>KSH {ticket.ticketPrice !== undefined ? ticket.ticketPrice.toLocaleString() : '—'}</div>
            </div>
          </div>
        </div>
        {/* Perforation */}
        <div
          style={{
            width: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            background: "#0d1017",
            padding: "6px 0",
            flexShrink: 0,
          }}
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#1e2535" }} />
          ))}
        </div>
        {/* Stub */}
        <div
          style={{
            width: 54,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 4px",
            background: "rgba(255,255,255,0.025)",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 8,
              letterSpacing: 2.5,
              color: accent,
              textTransform: "uppercase",
            }}
          >
            ADMIT ONE
          </div>
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 7,
              letterSpacing: 1.5,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            {ticket.ticketTypeName ?? 'General'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserAccountPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tickets");
  // ...existing code...

  useEffect(() => {
    async function fetchUserData() {
      try {
        const ticketsResp = await ticketService.listUserTickets();
        setTickets(ticketsResp.data);
        if (ticketsResp.data.length > 0) setSelectedId(ticketsResp.data[0].id);
      } catch (err) {
        setTickets([]);
      }
    }
    fetchUserData();
  }, []);

  const tabs = [
    { id: "tickets", label: "My Tickets", icon: "🎟" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "history", label: "History", icon: "📜" },
  ];
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => {
    if (activeTab === "history") {
      async function fetchHistory() {
        try {
          const resp = await apiFetch('/user/history');
          setHistory(Array.isArray(resp.data) ? resp.data : []);
        } catch {
          setHistory([]);
        }
      }
      fetchHistory();
    }
  }, [activeTab]);
        {/* History */}
        {activeTab === "history" && (
          <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 48, textAlign: "left" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 18 }}>My History</h2>
            <pre style={{ background: '#222', color: '#fff', padding: 16, borderRadius: 8 }}>{JSON.stringify(history, null, 2)}</pre>
          </div>
        )}

  const selectedTicket = tickets.find((t) => t.id === selectedId);
  const accent = selectedTicket && selectedTicket.status ? TYPE_COLOR[selectedTicket.status as keyof typeof TYPE_COLOR] : "#22c55e";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0d14",
        color: "#fff",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        .tab-btn { background:none; border:none; cursor:pointer; padding:9px 18px; border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:rgba(255,255,255,0.4);
          transition:all 0.2s; display:flex; align-items:center; gap:7px; white-space:nowrap; }
        .tab-btn:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.06); }
        .tab-btn.active { color:#f0c040; background:rgba(240,192,64,0.1); }
        .action-btn { background:#f0c040; color:#0a0d14; border:none; border-radius:8px;
          padding:10px 22px; font-size:13px; font-weight:600; cursor:pointer;
          transition:opacity 0.2s,transform 0.15s; font-family:'DM Sans',sans-serif; letter-spacing:0.3px; }
        .action-btn:hover { opacity:0.85; transform:translateY(-1px); }
        .ghost-btn { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7);
          border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 22px;
          font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s;
          font-family:'DM Sans',sans-serif; }
        .ghost-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* Nav */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,13,20,0.96)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#f0c040",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: -0.3,
            }}
          >
            <Link to="/" style={{ color: '#f0c040', textDecoration: 'none' }}>Home</Link>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="ghost-btn" onClick={logout}>Sign Out</button>
            {user && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#22c55e,#fbbf24)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0a0d14",
                }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Hero */}
        <div
          className="fade-in"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#f0c040", textTransform: "uppercase", marginBottom: 6 }}>
              My Account
            </p>
            <h1 style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.38)", marginTop: 5, fontSize: 13 }}>{user?.email ?? ''}</p>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "16px 22px",
                minWidth: 90,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0c040" }}>{tickets.length}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>
                Tickets
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: 30,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 11,
            padding: 5,
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tickets panel */}
        {activeTab === "tickets" && (
          <div
            className="fade-in"
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 36,
              alignItems: "start",
            }}
          >
            {/* Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {tickets.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  selected={selectedId === t.id}
                  onClick={() => setSelectedId(t.id)}
                />
              ))}
            </div>

            {/* Detail */}
            {selectedTicket && (
              <div
                style={{
                  background: "linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
                  border: `1px solid ${accent}44`,
                  borderRadius: 14,
                  padding: 26,
                  position: "sticky",
                  top: 76,
                }}
              >
                <p
                  style={{
                    fontSize: 9,
                    letterSpacing: 3,
                    color: accent,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Ticket Details
                </p>
                <h3
                  style={{
                    fontSize: 20,
                    fontFamily: "'Playfair Display', serif",
                    marginBottom: 20,
                    lineHeight: 1.25,
                  }}
                >
                  {selectedTicket.eventName}
                </h3>

                {[
                  {
                    label: "Date",
                    value: new Date(selectedTicket.eventStartTime ?? selectedTicket.startTime ?? selectedTicket.purchaseDate).toLocaleDateString("default", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  },
                  {
                    label: "Time",
                    value: new Date(selectedTicket.eventStartTime ?? selectedTicket.startTime ?? selectedTicket.purchaseDate).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" }),
                  },
                  { label: "Venue", value: selectedTicket.eventVenue ?? selectedTicket.venue ?? 'Venue TBD' },
                  { label: "Seat", value: selectedTicket.ticketNote ?? 'General Admission' },
                  { label: "Ticket Type", value: selectedTicket.ticketTypeName ?? 'General' },
                  { label: "Price Paid", value: `KSH ${selectedTicket.ticketPrice !== undefined ? selectedTicket.ticketPrice.toLocaleString() : '—'}` },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      fontSize: 12,
                      gap: 16,
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: "#fff", fontWeight: 500, textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button className="action-btn">↓ Download</button>
                  <button className="ghost-btn">Share</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <div
            className="fade-in"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: 48,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#f0c040,#c8920a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 700,
                color: "#0a0d14",
                margin: "0 auto 18px",
              }}
            >
              {user && (
                <>
                  {user.firstName[0]}{user.lastName[0]}
                </>
              )}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8 }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 28 }}>
              Profile editing coming soon
            </p>
            <button className="ghost-btn">Request Early Access</button>
          </div>
        )}

        {/* Preferences */}
        {activeTab === "preferences" && (
          <div
            className="fade-in"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: 48,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>⚙️</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8 }}>Preferences</h2>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 28 }}>
              Notification and display settings coming soon
            </p>
            <button className="ghost-btn">Request Early Access</button>
          </div>
        )}
      </main>
    </div>
  );
}