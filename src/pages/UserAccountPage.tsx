import { useState, useEffect } from "react";
import { useAuth } from '../utilities/AuthContext';
import * as ticketService from '../services/ticketService';
import { Ticket } from '../utilities/types';
import { Link } from 'react-router-dom';
import * as historyService from '../services/historyService';
 
const TYPE_COLOR = { ACTIVE: "#22c55e", USED: "#fbbf24", REFUNDED: "#ef4444" };
 
/* ── Ticket Card ─────────────────────────────────────────────────────────── */
function TicketCard({ ticket, selected, onClick }: { ticket: Ticket; selected: boolean; onClick: () => void }) {
  const accent = TYPE_COLOR[(ticket.status as keyof typeof TYPE_COLOR)] ?? "#22c55e";
  const d = new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate);
  const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
 
  return (
    <>
      {/* ── Desktop ticket (horizontal stub layout) ── */}
      <div className="ticket-desktop"
        onClick={onClick}
        style={{
          cursor: "pointer",
          transition: "transform 0.25s, box-shadow 0.25s",
          transform: selected ? "translateY(-4px) scale(1.015)" : "scale(1)",
          boxShadow: selected ? `0 20px 50px rgba(0,0,0,0.65), 0 0 0 1.5px ${accent}` : "0 6px 24px rgba(0,0,0,0.45)",
          borderRadius: 10, overflow: "hidden",
          fontFamily: "'DM Mono', 'Courier New', monospace",
          userSelect: "none", width: "100%", maxWidth: 480,
        }}
      >
        <div style={{ display: "flex", background: "linear-gradient(135deg,#1a1f2e,#111827)" }}>
          <div style={{ width: 5, background: accent, flexShrink: 0 }} />
          <div style={{ width: 68, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 6px", borderRight: "1px dashed rgba(255,255,255,0.1)", gap: 1, flexShrink: 0 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, color: accent }}>{month}</span>
            <span style={{ fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{day}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{year}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{timeStr}</span>
          </div>
          <div style={{ flex: 1, padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: accent, textTransform: "uppercase" }}>{ticket.ticketTypeName ?? 'General'} TICKET</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.25, fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.eventName}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>📍 {ticket.eventVenue ?? ticket.venue ?? 'Venue TBD'}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>🪑 {ticket.ticketNote ?? 'General Admission'}</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(255,255,255,0.09)" }}>
              <div style={{ color: "rgba(255,255,255,0.28)" }}>
                {ticket.qrCode
                  ? <img src={ticket.qrCode} alt="QR" style={{ width: 60, height: 60, background: '#fff', borderRadius: 6, marginBottom: 2 }} />
                  : <div style={{ width: 60, height: 60, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>No QR</div>
                }
                <div style={{ fontSize: 7, letterSpacing: 2, marginTop: 1 }}>{ticket.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>PRICE</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>KSH {ticket.ticketPrice !== undefined ? ticket.ticketPrice.toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>
          <div style={{ width: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", background: "#0d1017", padding: "6px 0", flexShrink: 0 }}>
            {Array.from({ length: 11 }).map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#1e2535" }} />)}
          </div>
          <div style={{ width: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px", background: "rgba(255,255,255,0.025)", gap: 6, flexShrink: 0 }}>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, letterSpacing: 2.5, color: accent, textTransform: "uppercase" }}>ADMIT ONE</div>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 7, letterSpacing: 1.5, color: "rgba(255,255,255,0.25)" }}>{ticket.ticketTypeName ?? 'General'}</div>
          </div>
        </div>
      </div>
 
      {/* ── Mobile ticket (stacked card layout) ── */}
      <div className="ticket-mobile"
        onClick={onClick}
        style={{
          cursor: "pointer",
          borderRadius: 14, overflow: "hidden",
          fontFamily: "'DM Mono', monospace",
          userSelect: "none", width: "100%",
          boxShadow: selected ? `0 0 0 1.5px ${accent}, 0 12px 32px rgba(0,0,0,0.5)` : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "box-shadow 0.25s",
          background: "linear-gradient(160deg,#1a1f2e,#111827)",
        }}
      >
        {/* Accent top bar */}
        <div style={{ height: 4, background: accent }} />
        <div style={{ padding: "16px 16px 14px" }}>
          {/* Type tag + status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 8, letterSpacing: 3, color: accent, textTransform: "uppercase" }}>{ticket.ticketTypeName ?? 'General'} TICKET</span>
            <span style={{ fontSize: 8, letterSpacing: 1.5, color: accent, background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase" }}>{ticket.status ?? 'ACTIVE'}</span>
          </div>
          {/* Event name */}
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif", lineHeight: 1.25, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ticket.eventName}
          </div>
          {/* Date + venue row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Date</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{month} {day}, {year}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{timeStr}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 3 }}>Venue</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.eventVenue ?? ticket.venue ?? 'TBD'}</div>
            </div>
          </div>
          {/* Dashed divider */}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.08)", marginBottom: 12 }} />
          {/* Bottom row: QR + price + tap hint */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {ticket.qrCode
                ? <img src={ticket.qrCode} alt="QR" style={{ width: 44, height: 44, background: '#fff', borderRadius: 5 }} />
                : <div style={{ width: 44, height: 44, background: '#222', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>QR</div>
              }
              <div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>PRICE</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: accent }}>KSH {ticket.ticketPrice !== undefined ? ticket.ticketPrice.toLocaleString() : '—'}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 4 }}>
              <span>Details</span>
              <span style={{ fontSize: 14 }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
 
/* ── Canvas download (unchanged) ────────────────────────────────────────── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}
 
async function downloadTicketAsPng(ticket: Ticket) {
  const accent = TYPE_COLOR[(ticket.status as keyof typeof TYPE_COLOR)] ?? "#22c55e";
  const d = new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate);
  const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
  const day = String(d.getDate());
  const year = String(d.getFullYear());
  const timeStr = d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" });
  const W = 800, H = 240, DPR = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * DPR; canvas.height = H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1a1f2e"); bg.addColorStop(1, "#111827");
  ctx.fillStyle = bg; roundRect(ctx, 0, 0, W, H, 14); ctx.fill();
  ctx.fillStyle = accent; roundRect(ctx, 0, 0, 7, H, [14, 0, 0, 14]); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fillRect(7, 0, 90, H);
  ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(97, 0); ctx.lineTo(97, H); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.fillStyle = accent; ctx.font = "600 10px monospace"; ctx.fillText(month, 52, 72);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 40px monospace"; ctx.fillText(day, 52, 118);
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "10px monospace"; ctx.fillText(year, 52, 140);
  ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillText(timeStr, 52, 158);
  ctx.textAlign = "left"; const mx = 116;
  ctx.fillStyle = accent; ctx.font = "600 9px monospace";
  ctx.fillText(`${(ticket.ticketTypeName ?? 'General').toUpperCase()} TICKET`, mx, 54);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 20px Georgia, serif";
  const title = (ticket.eventName ?? '').length > 36 ? (ticket.eventName ?? '').substring(0, 36) + '...' : (ticket.eventName ?? 'Event');
  ctx.fillText(title, mx, 82);
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "12px monospace";
  ctx.fillText("Venue: " + (ticket.eventVenue ?? ticket.venue ?? 'Venue TBD'), mx, 108);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("Seat: " + (ticket.ticketNote ?? 'General Admission'), mx, 128);
  ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(mx, 144); ctx.lineTo(W - 90, 144); ctx.stroke(); ctx.setLineDash([]);
 ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace";
  ctx.fillText("ID: " + ticket.id, mx, 216);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "9px monospace"; ctx.fillText("PRICE", W - 90, 164);
  ctx.fillStyle = accent; ctx.font = "bold 24px monospace";
  ctx.fillText("KSH " + (ticket.ticketPrice !== undefined ? ticket.ticketPrice.toLocaleString() : '—'), W - 90, 190);
  const dotX = W - 76;
  for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(dotX, 20 + i * 17, 3.5, 0, Math.PI * 2); ctx.fillStyle = "#0d1017"; ctx.fill(); }
  ctx.fillStyle = "rgba(255,255,255,0.025)"; ctx.fillRect(W - 66, 0, 66, H);
  ctx.save(); ctx.translate(W - 36, H / 2 + 30); ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center"; ctx.fillStyle = accent; ctx.font = "bold 9px monospace"; ctx.fillText("ADMIT ONE", 0, 0); ctx.restore();
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(240,192,64,0.2)"; ctx.font = "bold 11px Georgia, serif";
  ctx.fillText("SparkVybzEnt", W / 2, H - 12);
 if (ticket.qrCode) {
    await new Promise<void>((resolve) => {
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.onload = () => {
        const qrSize = 54;
  const qrX = mx;
  const qrY = 148;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        resolve();
      };
      qrImg.onerror = () => resolve(); // skip QR silently if it fails to load
      qrImg.src = ticket.qrCode!;
    });
  }

  const link = document.createElement("a");
  link.download = "ticket-" + ticket.eventName?.replace(/\s+/g, '-').toLowerCase() + ".png";
  link.href = canvas.toDataURL("image/png"); link.click();
}
 
async function shareTicket(ticket: Ticket): Promise<string | undefined> {
  const d = new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate);
  const dateStr = d.toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const text = "I'm going to " + ticket.eventName + "!\nVenue: " + (ticket.eventVenue ?? 'TBD') + "\nDate: " + dateStr + "\n\nBooked via SparkVybzEnt";
  if (navigator.share) { try { await navigator.share({ title: ticket.eventName, text }); return; } catch {} }
  await navigator.clipboard.writeText(text);
  return "copied";
}
 
/* ── Ticket Detail Content ───────────────────────────────────────────────── */
function TicketDetailContent({ ticket, accent, downloading, sharing, shareMsg, onDownload, onShare }: {
  ticket: Ticket; accent: string; downloading: boolean; sharing: boolean; shareMsg: string;
  onDownload: () => void; onShare: () => void;
}) {
  return (
    <div style={{ background: "linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))", border: `1px solid ${accent}44`, borderRadius: 14, padding: 26 }}>
      <p style={{ fontSize: 9, letterSpacing: 3, color: accent, textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Ticket Details</p>
      <h3 style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", marginBottom: 20, lineHeight: 1.25 }}>{ticket.eventName}</h3>
      {[
        { label: "Date",        value: new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate).toLocaleDateString("default", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
        { label: "Time",        value: new Date(ticket.eventStartTime ?? ticket.startTime ?? ticket.purchaseDate).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" }) },
        { label: "Venue",       value: ticket.eventVenue ?? ticket.venue ?? 'Venue TBD' },
        { label: "Seat",        value: ticket.ticketNote ?? 'General Admission' },
        { label: "Ticket Type", value: ticket.ticketTypeName ?? 'General' },
        { label: "Price Paid",  value: `KSH ${ticket.ticketPrice !== undefined ? ticket.ticketPrice.toLocaleString() : '—'}` },
        { label: "Status",      value: ticket.status ?? 'ACTIVE' },
      ].map(row => (
        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 12, gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>{row.label}</span>
          <span style={{ color: row.label === "Status" ? accent : "#fff", fontWeight: 500, textAlign: "right", fontFamily: row.label === "Status" ? "'DM Mono',monospace" : "inherit" }}>{row.value}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
        <button className="action-btn" disabled={downloading} onClick={onDownload}>{downloading ? "⏳ Saving…" : "↓ Download"}</button>
        <button className="ghost-btn" onClick={onShare}>{sharing ? "⏳" : "↗ Share"}</button>
      </div>
      {shareMsg && <p style={{ fontSize: 11, color: "#22c55e", marginTop: 10, fontFamily: "'DM Mono',monospace", letterSpacing: 1 }}>✓ {shareMsg}</p>}
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 14, lineHeight: 1.6, fontFamily: "'DM Mono',monospace" }}>
        Download saves the ticket as an image. Share sends event details as text.
      </p>
    </div>
  );
}
 
/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function UserAccountPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tickets");
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [prefs, setPrefs] = useState({ emailNewEvents: true, emailBlogs: false, emailTicketConfirmation: true, emailReminders: true, emailPromotions: false });
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [prefError, setPrefError] = useState("");
 
  useEffect(() => {
    async function fetchUserData() {
      try {
        const ticketsResp = await ticketService.listUserTickets();
        setTickets(ticketsResp.data);
        if (ticketsResp.data.length > 0) setSelectedId(ticketsResp.data[0].id);
      } catch { setTickets([]); }
    }
    fetchUserData();
  }, []);
 
  useEffect(() => {
    if (activeTab === "history" && user?.id) {
      async function fetchHistory() {
        setLoadingHistory(true);
        try {
          const resp = await historyService.getUserHistory(user?.id);
          const d = resp.data;
          setHistory([...(d.favorites || []), ...(d.reviews || []), ...(d.chats || [])]);
        } catch { setHistory([]); }
        finally { setLoadingHistory(false); }
      }
      fetchHistory();
    }
  }, [activeTab, user?.id]);
 
  useEffect(() => {
    if (activeTab === "preferences") {
      async function fetchPrefs() {
        setLoadingPrefs(true); setPrefError("");
        try {
          const data = await historyService.getUserPreferences();
          setPrefs({ emailNewEvents: data.emailNewEvents ?? false, emailBlogs: data.emailBlogs ?? false, emailTicketConfirmation: data.emailTicketConfirmation ?? true, emailReminders: data.emailReminders ?? true, emailPromotions: data.emailPromotions ?? false });
        } catch { setPrefError("Failed to load preferences."); }
        finally { setLoadingPrefs(false); }
      }
      fetchPrefs();
    }
  }, [activeTab]);
 
  const selectedTicket = tickets.find(t => t.id === selectedId);
  const accent = selectedTicket?.status ? TYPE_COLOR[selectedTicket.status as keyof typeof TYPE_COLOR] : "#22c55e";
 
  const handleTicketClick = (id: string) => {
    setSelectedId(id);
    setShowMobileDetail(true);
  };
 
  const handleDownload = async () => {
    if (!selectedTicket) return;
    setDownloading(true);
    await downloadTicketAsPng(selectedTicket);
    setTimeout(() => setDownloading(false), 1200);
  };
 
  const handleShare = async () => {
    if (!selectedTicket) return;
    setSharing(true);
    const result = await shareTicket(selectedTicket);
    if (result === "copied") { setShareMsg("Copied to clipboard!"); setTimeout(() => setShareMsg(""), 2500); }
    setSharing(false);
  };
 
  const handlePrefSave = async () => {
    setLoadingPrefs(true); setPrefError(""); setPrefsSaved(false);
    try {
      await historyService.updateUserPreferences(prefs);
      setPrefsSaved(true); setTimeout(() => setPrefsSaved(false), 2500);
    } catch { setPrefError("Failed to save preferences. Please try again."); }
    finally { setLoadingPrefs(false); }
  };
 
  const tabs = [
    { id: "tickets",     label: "My Tickets",  icon: "🎟" },
    { id: "profile",     label: "Profile",     icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "history",     label: "History",     icon: "📜" },
  ];
 
  return (
    <div style={{ minHeight: "100vh", background: "#0a0d14", color: "#fff", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
 
        .tab-btn { background:none; border:none; cursor:pointer; padding:9px 14px; border-radius:8px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:rgba(255,255,255,0.4);
          transition:all 0.2s; display:flex; align-items:center; gap:6px; white-space:nowrap; }
        .tab-btn:hover { color:rgba(255,255,255,0.8); background:rgba(255,255,255,0.06); }
        .tab-btn.active { color:#f0c040; background:rgba(240,192,64,0.1); }
 
        .action-btn { background:#f0c040; color:#0a0d14; border:none; border-radius:8px;
          padding:10px 22px; font-size:13px; font-weight:600; cursor:pointer;
          transition:opacity 0.2s,transform 0.15s; font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:7px; }
        .action-btn:hover:not(:disabled) { opacity:0.85; transform:translateY(-1px); }
        .action-btn:disabled { opacity:0.5; cursor:not-allowed; }
 
        .ghost-btn { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.7);
          border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px 22px;
          font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s;
          font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:7px; }
        .ghost-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
 
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fadeUp 0.4s ease forwards; }
        @keyframes historyIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
 
        .toggle-track { width:44px; height:24px; border-radius:12px; position:relative;
          cursor:pointer; transition:background 0.25s; flex-shrink:0; border:none; padding:0; }
        .toggle-thumb { position:absolute; top:3px; width:18px; height:18px;
          border-radius:50%; background:#fff; transition:left 0.25s; }
        .pref-row { display:flex; align-items:flex-start; justify-content:space-between;
          padding:18px 0; border-bottom:1px solid rgba(255,255,255,0.06); gap:20px; }
        .pref-row:last-of-type { border-bottom:none; }
        .profile-field { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:14px 18px; display:flex; justify-content:space-between;
          align-items:center; margin-bottom:10px; }
        .stat-pill { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:12px; padding:16px 20px; text-align:center; flex:1; }
 
        /* ── Ticket variants ── */
        .ticket-mobile { display: none; }
        .ticket-desktop { display: block; }
 
        /* ── Tabs scroll ── */
        .tabs-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 2px; }
        .tabs-scroll::-webkit-scrollbar { display: none; }
        .tabs-inner { display: flex; gap: 3px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 11px; padding: 5px;
          width: fit-content; min-width: 100%; }
 
        /* ── Mobile bottom sheet ── */
        .detail-backdrop { display:none; position:fixed; inset:0; z-index:400; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); }
        .detail-sheet { position:fixed; bottom:0; left:0; right:0; z-index:401;
          background:#0f1521; border-top:1px solid rgba(240,192,64,0.2);
          border-radius:20px 20px 0 0; padding:24px 20px 44px;
          max-height:88vh; overflow-y:auto; animation:slideUp 0.3s ease; }
        .sheet-handle { width:40px; height:4px; background:rgba(255,255,255,0.12);
          border-radius:2px; margin:0 auto 20px; }
 
        @media (max-width: 768px) {
          .ticket-mobile { display: block; }
          .ticket-desktop { display: none; }
          .detail-backdrop { display: block; }
          .tickets-grid { grid-template-columns: 1fr !important; }
          .detail-panel-desktop { display: none !important; }
          .hero-section { flex-direction: column; align-items: flex-start !important; }
          .stats-row { width: 100%; }
          .stat-pill { padding: 12px 10px; }
          .main-pad { padding: 24px 16px 80px !important; }
          .tabs-inner { min-width: max-content; }
        }
      `}</style>
 
      {/* Nav */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,13,20,0.96)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 16px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ fontSize: 17, fontWeight: 700, color: "#f0c040", fontFamily: "'Playfair Display',serif", letterSpacing: -0.3, textDecoration: "none" }}>✦ SparkVybzEnt</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="ghost-btn" style={{ padding: "8px 14px" }} onClick={logout}>Sign Out</button>
            {user && (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0a0d14", flexShrink: 0 }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
            )}
          </div>
        </div>
      </header>
 
      <main className="main-pad" style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px 80px" }}>
 
        {/* Hero */}
        <div className="fade-in hero-section" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: 3, color: "#f0c040", textTransform: "uppercase", marginBottom: 6 }}>My Account</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.38)", marginTop: 5, fontSize: 13 }}>{user?.email ?? ''}</p>
          </div>
          <div className="stats-row" style={{ display: "flex", gap: 10 }}>
            {[
              { val: tickets.length, label: "Tickets" },
              { val: tickets.filter(t => t.status === "ACTIVE").length, label: "Active" },
              { val: tickets.filter(t => t.status === "USED").length, label: "Used" },
            ].map(s => (
              <div key={s.label} className="stat-pill">
                <div style={{ fontSize: 26, fontWeight: 700, color: "#f0c040", fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Tabs */}
        <div className="tabs-scroll" style={{ marginBottom: 30 }}>
          <div className="tabs-inner">
            {tabs.map(tab => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
 
        {/* ── TICKETS ── */}
        {activeTab === "tickets" && (
          <div className="fade-in tickets-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 36, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {tickets.length === 0 && (
                <div style={{ padding: "48px 32px", background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16, textAlign: "center", minWidth: 280 }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🎟</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "rgba(255,255,255,0.3)", fontSize: 15 }}>No tickets yet — go explore events.</p>
                  <Link to="/events" style={{ display: "inline-block", marginTop: 16, fontSize: 12, color: "#f0c040", textDecoration: "none", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5 }}>Browse Events →</Link>
                </div>
              )}
              {tickets.map(t => (
                <TicketCard key={t.id} ticket={t} selected={selectedId === t.id} onClick={() => handleTicketClick(t.id)} />
              ))}
            </div>
 
            {/* Desktop detail panel */}
            {selectedTicket && (
              <div className="detail-panel-desktop" style={{ position: "sticky", top: 76 }}>
                <TicketDetailContent ticket={selectedTicket} accent={accent} downloading={downloading} sharing={sharing} shareMsg={shareMsg} onDownload={handleDownload} onShare={handleShare} />
              </div>
            )}
          </div>
        )}
 
        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="fade-in" style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36, padding: "24px 28px", background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, flexWrap: "wrap" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#f0c040,#c8920a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#0a0d14", flexShrink: 0 }}>
                {user?.firstName[0]}{user?.lastName[0]}
              </div>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 4 }}>{user ? `${user.firstName} ${user.lastName}` : 'Guest'}</h2>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", fontFamily: "'DM Mono',monospace" }}>{user?.email}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 20, background: "rgba(240,192,64,0.1)", border: "1px solid rgba(240,192,64,0.2)", color: "#f0c040", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>{user?.role ?? 'Member'}</span>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 20, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>Verified</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 9, letterSpacing: 3, color: "rgba(240,192,64,0.6)", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 14 }}>Account Details</p>
            {[
              { label: "First Name",   value: user?.firstName ?? "—" },
              { label: "Last Name",    value: user?.lastName  ?? "—" },
              { label: "Email",        value: user?.email     ?? "—" },
              { label: "Phone",        value: user?.phone     ?? "Not added" },
              { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("default", { month: "long", year: "numeric" }) : "—" },
            ].map(row => (
              <div key={row.label} className="profile-field">
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: row.value === "Not added" ? "rgba(255,255,255,0.2)" : "#fff" }}>{row.value}</span>
              </div>
            ))}
            <p style={{ fontSize: 9, letterSpacing: 3, color: "rgba(240,192,64,0.6)", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginTop: 28, marginBottom: 14 }}>Your Activity</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { val: tickets.length, label: "Tickets Bought" },
                { val: tickets.filter(t => t.status === "ACTIVE").length, label: "Upcoming" },
                { val: tickets.filter(t => t.status === "USED").length, label: "Attended" },
              ].map(s => (
                <div key={s.label} className="stat-pill">
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#f0c040", fontFamily: "'DM Mono',monospace" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 24, lineHeight: 1.7 }}>
              To update your name, email, or phone number, reach out via the live chat widget at the bottom of the screen.
            </p>
          </div>
        )}
 
        {/* ── PREFERENCES ── */}
        {activeTab === "preferences" && (
          <div className="fade-in" style={{ maxWidth: 580 }}>
            <p style={{ fontSize: 9, letterSpacing: 3, color: "rgba(240,192,64,0.6)", textTransform: "uppercase", fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Notifications</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 28, lineHeight: 1.2 }}>Email Preferences<span style={{ color: "#f0c040" }}>.</span></h2>
            <div style={{ background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "8px 24px 16px" }}>
              {([
                { key: "emailTicketConfirmation", label: "Ticket Confirmations", desc: "Receive a confirmation email every time you successfully purchase a ticket." },
                { key: "emailReminders",          label: "Event Reminders",      desc: "Get reminded 24 hours before an event you have a ticket for." },
                { key: "emailNewEvents",          label: "New Events",           desc: "Be the first to know when new events are added to the platform." },
                { key: "emailBlogs",              label: "New Blog Posts",       desc: "Get notified when a new article is published on The Hub." },
                { key: "emailPromotions",         label: "Offers & Promotions",  desc: "Occasionally receive special deals and early-bird ticket discounts." },
              ] as { key: keyof typeof prefs; label: string; desc: string }[]).map(item => (
                <div key={item.key} className="pref-row" style={{ opacity: loadingPrefs ? 0.4 : 1, transition: "opacity 0.2s" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                  <button className="toggle-track" style={{ background: prefs[item.key] ? "#f0c040" : "rgba(255,255,255,0.1)", pointerEvents: loadingPrefs ? "none" : "auto" }}
                    onClick={() => { setPrefError(""); setPrefs(p => ({ ...p, [item.key]: !p[item.key] })); }}
                    aria-label={item.label} disabled={loadingPrefs}>
                    <div className="toggle-thumb" style={{ left: prefs[item.key] ? "23px" : "3px" }} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              <button className="action-btn" onClick={handlePrefSave} disabled={loadingPrefs} style={{ opacity: loadingPrefs ? 0.5 : 1 }}>
                {loadingPrefs ? "Saving…" : prefsSaved ? "✓ Saved" : "Save Preferences"}
              </button>
              {prefsSaved && !prefError && <span style={{ fontSize: 12, color: "#22c55e", fontFamily: "'DM Mono',monospace" }}>Your preferences have been updated.</span>}
              {prefError && <span style={{ fontSize: 12, color: "#ef4444", fontFamily: "'DM Mono',monospace" }}>{prefError}</span>}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", marginTop: 20, lineHeight: 1.7 }}>
              We respect your inbox. You can change these at any time.
            </p>
          </div>
        )}
 
        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div className="fade-in">
            {loadingHistory && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 90, borderRadius: 14, background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)", animation: "shimmer 1.8s infinite" }} />
                  </div>
                ))}
              </div>
            )}
            {!loadingHistory && history.length === 0 && (
              <div style={{ textAlign: "center", padding: "64px 32px", background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 18 }}>
                <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.3 }}>◎</div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "rgba(255,255,255,0.28)", fontSize: 15 }}>No activity. Start exploring events and your interactions will appear here.</p>
              </div>
            )}
            {!loadingHistory && history.length > 0 && (() => {
              const reviews   = history.filter(i => "rating" in i);
              const messages  = history.filter(i => "content" in i && !("rating" in i));
              const favorites = history.filter(i => !("rating" in i) && !("content" in i) && i.event);
 
              const Section = ({ items, title, accent: sAccent, accentBg, accentBorder, renderItem }: any) =>
                items.length === 0 ? null : (
                  <div style={{ marginBottom: 52 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                      <div style={{ width: 3, height: 22, borderRadius: 2, background: sAccent, flexShrink: 0 }} />
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{title}</h3>
                      <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: sAccent, background: accentBg, border: `1px solid ${accentBorder}`, borderRadius: 20, padding: "2px 10px" }}>{items.length}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                      {items.map((item: any, idx: number) => renderItem(item, idx))}
                    </div>
                  </div>
                );
 
              return (
                <div>
                  <Section items={favorites} title="Favorited Events" accent="#f472b6" accentBg="rgba(244,114,182,0.07)" accentBorder="rgba(244,114,182,0.2)"
                    renderItem={(item: any, idx: number) => {
                      const ev = item.event; const date = new Date(item.createdAt);
                      return (
                        <div key={item.id} style={{ background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.25s,transform 0.25s,box-shadow 0.25s", animation: `historyIn 0.4s ease ${idx * 0.06}s both` }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(244,114,182,0.3)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                          {ev?.imageUrl && <div style={{ height: 130, overflow: "hidden" }}><img src={ev.imageUrl} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.72)" }} /></div>}
                          <div style={{ padding: "16px 18px" }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{ev?.title ?? "Event"}</p>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>♥ Saved · {date.toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Section items={reviews} title="Reviews Left" accent="#f0c040" accentBg="rgba(240,192,64,0.07)" accentBorder="rgba(240,192,64,0.2)"
                    renderItem={(item: any, idx: number) => {
                      const ev = item.event; const date = new Date(item.createdAt);
                      return (
                        <div key={item.id} style={{ background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "22px", transition: "border-color 0.25s,transform 0.25s,box-shadow 0.25s", animation: `historyIn 0.4s ease ${idx * 0.06}s both` }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(240,192,64,0.25)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                          <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 16, color: s <= item.rating ? "#f0c040" : "rgba(255,255,255,0.1)" }}>★</span>)}</div>
                          {item.comment && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, fontStyle: "italic", marginBottom: 14 }}>"{item.comment}"</p>}
                          <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{ev?.title ?? "Event"}</p>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Mono',monospace" }}>{date.toLocaleDateString("default", { day: "numeric", month: "short" })}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Section items={messages} title="Chat Messages" accent="#60c8f0" accentBg="rgba(96,200,240,0.07)" accentBorder="rgba(96,200,240,0.2)"
                    renderItem={(item: any, idx: number) => {
                      const date = new Date(item.createdAt);
                      return (
                        <div key={item.id} style={{ background: "linear-gradient(160deg,#141927,#0f1521)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px 22px", transition: "border-color 0.25s,transform 0.25s,box-shadow 0.25s", animation: `historyIn 0.4s ease ${idx * 0.06}s both`, position: "relative" }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(96,200,240,0.25)"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)"; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                          <div style={{ fontSize: 40, lineHeight: 1, color: "rgba(96,200,240,0.1)", fontFamily: "Georgia,serif", position: "absolute", top: 12, right: 18, userSelect: "none" }}>"</div>
                          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 14, paddingRight: 20 }}>{item.content}</p>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Mono',monospace" }}>
                            {date.toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" })} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      );
                    }}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </main>
 
      {/* ── Mobile detail bottom sheet ── */}
      {showMobileDetail && selectedTicket && (
        <div className="detail-backdrop" onClick={() => setShowMobileDetail(false)}>
          <div className="detail-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 9, letterSpacing: 3, color: accent, textTransform: "uppercase", fontFamily: "'DM Mono',monospace" }}>Ticket Details</p>
              <button onClick={() => setShowMobileDetail(false)} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <TicketDetailContent ticket={selectedTicket} accent={accent} downloading={downloading} sharing={sharing} shareMsg={shareMsg} onDownload={handleDownload} onShare={handleShare} />
          </div>
        </div>
      )}
    </div>
  );
}