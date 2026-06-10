import { useState, useEffect, useCallback, useRef } from "react";

const WA_NUMBER = "919710918099";
const WA_NUMBER2 = "919944352567";
const FB_URL = "https://facebook.com/plotxchennai";
const IG_URL = "https://instagram.com/plotxchennai";
const TG_URL = "https://t.me/plotx7743";
const API = "https://plotx-backend-q3pq.onrender.com/api";
const BASE_URL = "https://plotx-backend-q3pq.onrender.com";

import banner from "/banner.jpg"

/* ── Mobile Hook ────────────────────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

/* ── API Helpers ────────────────────────────────────────────────────── */
const getToken = () => localStorage.getItem("plotx_token");

const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
};

/* ── Design tokens ──────────────────────────────────────────────────── */
const T = {
  blue:  "#1B4FD8",
  blueD: "#1540B0",
  blueL: "#EEF3FF",
  slate: "#1E293B",
  slateM:"#475569",
  muted: "#94A3B8",
  bg:    "#F8FAFC",
  white: "#FFFFFF",
  line:  "#E2E8F0",
  green: "#059669",
  red:   "#DC2626",
  amber: "#D97706",
  purple:"#7C3AED",
};

const font = `"DM Sans", "Plus Jakarta Sans", "Helvetica Neue", sans-serif`;

const S = {
  page:{ fontFamily:font, background:T.bg, minHeight:"100vh", color:T.slate },
  nav:{
    position:"fixed", top:0, left:0, right:0, zIndex:200,
    background:"rgba(255,255,255,0.97)", backdropFilter:"blur(12px)",
    borderBottom:`1px solid ${T.line}`,
    display:"flex", alignItems:"center", justifyContent:"space-between",
    padding:"0 48px", height:"68px",
    boxShadow:"0 1px 12px rgba(0,0,0,0.06)"
  },
  btn:(v="primary") => ({
    padding:"12px 28px", border:"none", cursor:"pointer", fontFamily:font,
    fontWeight:"600", fontSize:"14px", borderRadius:"8px", transition:"all 0.2s",
    ...(v==="primary" ? {
      background:T.blue, color:T.white,
      boxShadow:"0 2px 12px rgba(27,79,216,0.28)"
    } : v==="outline" ? {
      background:"transparent", color:T.blue,
      border:`1.5px solid ${T.blue}`
    } : v==="white" ? {
      background:T.white, color:T.blue,
      boxShadow:"0 2px 12px rgba(0,0,0,0.12)"
    } : {
      background:"transparent", color:T.white,
      border:"1.5px solid rgba(255,255,255,0.6)"
    })
  }),
  input:{
    background:T.white, border:`1.5px solid ${T.line}`,
    color:T.slate, padding:"12px 16px", borderRadius:"8px", width:"100%",
    fontFamily:font, fontSize:"14px", outline:"none",
    boxSizing:"border-box", transition:"border-color 0.2s"
  },
  card:{
    background:T.white, border:`1px solid ${T.line}`,
    borderRadius:"12px", overflow:"hidden",
    boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
    transition:"transform 0.25s, box-shadow 0.25s"
  },
  section:{ padding:"88px 48px", maxWidth:"1200px", margin:"0 auto" },
  tag:(color=T.blue) => ({
    display:"inline-block", padding:"4px 12px", borderRadius:"20px",
    background:color+"18", color:color,
    fontSize:"11px", fontWeight:"700", letterSpacing:"0.8px", textTransform:"uppercase"
  }),
  label:{ fontSize:"11px", fontWeight:"700", letterSpacing:"1.5px",
    textTransform:"uppercase", color:T.muted, marginBottom:"6px", display:"block" },
};

/* ── Hero Carousel ──────────────────────────────────────────────────── */
const SLIDES = [
  {
    bg: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
    overlay: "linear-gradient(to right, rgba(15,23,42,0.88) 50%, rgba(15,23,42,0.3) 100%)",
    tag: "Real Estate",
    tagColor: "#60A5FA",
    headline: ["Own Your", "Dream Property", "Today"],
    sub: "Trusted property experts in Chennai. Premium plots, villas & commercial spaces in Porur and beyond.",
    icon: "🏠",
    accent: "#60A5FA",
    route: "real_estate",
  },
  {
    bg: "linear-gradient(135deg,#0d2414 0%,#1a4a2e 100%)",
    overlay: "linear-gradient(to right, rgba(13,36,20,0.88) 50%, rgba(13,36,20,0.3) 100%)",
    tag: "Construction",
    tagColor: "#34D399",
    headline: ["Build Your", "Vision With", "Precision"],
    sub: "End-to-end construction solutions — from architectural planning to turnkey delivery, crafted for excellence.",
    icon: "🏗️",
    accent: "#34D399",
    route: "construction",
  },
  {
    bg: "linear-gradient(135deg,#1a0a2e 0%,#3d1a6e 100%)",
    overlay: "linear-gradient(to right, rgba(26,10,46,0.88) 50%, rgba(26,10,46,0.3) 100%)",
    tag: "Interior Design",
    tagColor: "#C084FC",
    headline: ["Transform Your", "Space Into", "A Masterpiece"],
    sub: "Luxury modular interiors with bespoke design portfolios — spaces that reflect your personality and lifestyle.",
    icon: "🛋️",
    accent: "#C084FC",
    route: "interior",
  },
];

function HeroCarousel({ onEnquire, setRoute }) {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const isMobile = useIsMobile();

  const goTo = (i) => {
    if (animating || i === cur) return;
    setAnimating(true);
    setPrev(cur);
    setCur(i);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCur(c => {
        const next = (c + 1) % SLIDES.length;
        setPrev(c); setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
        return next;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const slide = SLIDES[cur];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  return (
    <div style={{ position:"relative", height:"100vh", minHeight: isMobile ? "580px" : "600px", overflow:"hidden", paddingTop:"68px" }}>
      {prevSlide && (
        <div style={{
          position:"absolute", inset:0,
          background: prevSlide.bg,
          opacity: animating ? 0 : 1,
          transition:"opacity 0.7s ease",
          zIndex:1
        }}>
          <div style={{ position:"absolute", inset:0, background:prevSlide.overlay }} />
        </div>
      )}
      <div style={{
        position:"absolute", inset:0,
        background: slide.bg,
        opacity: animating ? 0 : 1,
        transform: animating ? "scale(1.03)" : "scale(1)",
        transition:"opacity 0.7s ease, transform 0.7s ease",
        zIndex:2
      }}>
        <div style={{ position:"absolute", inset:0, background: isMobile ? "rgba(15,23,42,0.75)" : slide.overlay }} />
        {!isMobile && (
          <div style={{
            position:"absolute", right:"8%", top:"50%", transform:"translateY(-50%)",
            fontSize:"clamp(120px,20vw,260px)", opacity:0.06, userSelect:"none",
            filter:"blur(2px)"
          }}>{slide.icon}</div>
        )}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, zIndex:0 }} xmlns="http://www.w3.org/2000/svg">
          {Array.from({length:12},(_,i)=>(
            <line key={`v${i}`} x1={`${(i+1)*8.33}%`} y1="0" x2={`${(i+1)*8.33}%`} y2="100%" stroke="white" strokeWidth="1"/>
          ))}
          {Array.from({length:8},(_,i)=>(
            <line key={`h${i}`} x1="0" y1={`${(i+1)*12.5}%`} x2="100%" y2={`${(i+1)*12.5}%`} stroke="white" strokeWidth="1"/>
          ))}
        </svg>
      </div>

      <div style={{
        position:"relative", zIndex:10,
        height:"100%", display:"flex", alignItems:"center",
        padding: isMobile ? "0 20px" : "0 clamp(24px,6vw,96px)"
      }}>
        <div style={{ maxWidth: isMobile ? "100%" : "660px", width:"100%" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
            padding:"6px 16px", borderRadius:"20px", marginBottom: isMobile ? "16px" : "28px"
          }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:slide.accent, display:"inline-block" }} />
            <span style={{ color:slide.accent, fontSize:"12px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase" }}>
              {slide.tag}
            </span>
          </div>
          <h1 style={{
            color:"#fff", fontWeight:"800", lineHeight:"1.08",
            fontSize: isMobile ? "2.4rem" : "clamp(2.8rem,6vw,5.2rem)",
            margin: isMobile ? "0 0 16px" : "0 0 24px", letterSpacing:"-0.5px"
          }}>
            {slide.headline.map((line, i) => (
              <span key={i} style={{ display:"block" }}>
                {i === 1 ? <span style={{ color:slide.accent }}>{line}</span> : line}
              </span>
            ))}
          </h1>
          <p style={{
            color:"rgba(255,255,255,0.72)", fontSize: isMobile ? "0.95rem" : "clamp(1rem,2vw,1.15rem)",
            lineHeight:"1.7", marginBottom: isMobile ? "28px" : "40px", maxWidth:"500px"
          }}>{slide.sub}</p>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            <button
              style={{ ...S.btn("white"), fontSize: isMobile ? "13px" : "14px", padding: isMobile ? "11px 20px" : "12px 28px" }}
              onClick={() => setRoute(slide.route)}>
              Explore {slide.tag}
            </button>
            <button
              style={{ ...S.btn("ghost"), display:"inline-flex", alignItems:"center", gap:"8px", padding: isMobile ? "11px 18px" : "12px 24px", fontSize: isMobile ? "13px" : "14px" }}
              onClick={() => onEnquire("Hero — General Enquiry", slide.tag)}>
              Book a Site Visit
            </button>
          </div>

          {!isMobile && (
            <div style={{ display:"flex", gap:"40px", marginTop:"56px", flexWrap:"wrap" }}>
              {[["Chennai","Location"],["Porur & Beyond","Coverage"],["9710918099","Call Now"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ color:"#fff", fontWeight:"700", fontSize:"1rem" }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"11px", letterSpacing:"1px", textTransform:"uppercase", marginTop:"2px" }}>{l}</div>
                </div>
              ))}
            </div>
          )}

          {isMobile && (
            <div style={{ display:"flex", gap:"24px", marginTop:"28px" }}>
              {[["Chennai","Location"],["Porur","Coverage"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ color:"#fff", fontWeight:"700", fontSize:"0.9rem" }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", marginTop:"2px" }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        position:"absolute", bottom: isMobile ? "24px" : "40px",
        left: isMobile ? "50%" : "clamp(24px,6vw,96px)",
        transform: isMobile ? "translateX(-50%)" : "none",
        display:"flex", gap:"8px", zIndex:10
      }}>
        {SLIDES.map((s,i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{
              width: cur===i ? "32px" : "8px", height:"8px",
              borderRadius:"4px", border:"none", cursor:"pointer",
              background: cur===i ? slide.accent : "rgba(255,255,255,0.35)",
              transition:"all 0.3s", padding:0
            }}
          />
        ))}
      </div>

      {!isMobile && (
        <>
          <button onClick={() => goTo((cur-1+SLIDES.length)%SLIDES.length)}
            style={{ position:"absolute", left:"24px", top:"50%", transform:"translateY(-50%)",
              zIndex:10, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", width:"44px", height:"44px", borderRadius:"50%", cursor:"pointer",
              fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
          <button onClick={() => goTo((cur+1)%SLIDES.length)}
            style={{ position:"absolute", right:"24px", top:"50%", transform:"translateY(-50%)",
              zIndex:10, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
              color:"#fff", width:"44px", height:"44px", borderRadius:"50%", cursor:"pointer",
              fontSize:"18px", display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
        </>
      )}
    </div>
  );
}

/* ── Lead Modal ────────────────────────────────────────────────────────── */
function LeadModal({ open, onClose, context, service }) {
  const [form, setForm] = useState({ name:"", email:"", mobile:"" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async () => {
    if (!form.name || !form.email || !form.mobile) {
      setError("All fields are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          service,
          source_context: context,
        }),
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
        setForm({ name:"", email:"", mobile:"" });
      }, 2200);
    } catch (err) {
      setError("Failed to submit. Please try WhatsApp instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(15,23,42,0.65)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", padding:"0"
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background:T.white,
        borderRadius:"20px 20px 0 0",
        width:"100%", maxWidth:"460px",
        padding:"32px 24px 40px",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
      }}>
        {/* Drag handle */}
        <div style={{ width:"40px", height:"4px", borderRadius:"2px", background:T.line, margin:"0 auto 24px" }} />

        {done ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{
              width:"64px", height:"64px", borderRadius:"50%",
              background:"#DCFCE7", display:"flex", alignItems:"center",
              justifyContent:"center", margin:"0 auto 16px", fontSize:"28px"
            }}>✓</div>
            <h3 style={{ color:T.green, fontSize:"1.2rem", margin:"0 0 8px" }}>Enquiry Submitted!</h3>
            <p style={{ color:T.slateM, fontSize:"14px" }}>Our team will contact you within 24 hours.</p>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
              <div>
                <span style={S.tag(T.blue)}>Book a Site Visit</span>
                <h3 style={{ color:T.slate, fontSize:"1.3rem", fontWeight:"700", margin:"10px 0 4px" }}>Get in Touch</h3>
                <p style={{ color:T.muted, fontSize:"13px" }}>{context}</p>
              </div>
              <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:"22px", padding:"0", lineHeight:1 }}>×</button>
            </div>
            {error && (
              <p style={{ color:T.red, fontSize:"13px", marginBottom:"14px", padding:"10px 14px", background:"#FEF2F2", borderRadius:"6px" }}>{error}</p>
            )}
            {["name","email","mobile"].map(f => (
              <div key={f} style={{ marginBottom:"14px" }}>
                <label style={S.label}>{f === "mobile" ? "Phone Number" : f === "name" ? "Full Name" : "Email Address"}</label>
                <input style={{ ...S.input, fontSize:"16px" }} type={f==="email"?"email":f==="mobile"?"tel":"text"}
                  value={form[f]}
                  placeholder={f==="name"?"e.g. Ravi Kumar":f==="email"?"you@email.com":"9876543210"}
                  onChange={e=>setForm({...form,[f]:e.target.value})}
                  onFocus={e=>e.target.style.borderColor=T.blue}
                  onBlur={e=>e.target.style.borderColor=T.line}
                />
              </div>
            ))}
            <button style={{ ...S.btn("primary"), width:"100%", marginTop:"8px", padding:"16px", fontSize:"16px" }}
              onClick={submit} disabled={loading}>
              {loading ? "Sending…" : "Submit Enquiry"}
            </button>
            <p style={{ textAlign:"center", marginTop:"16px", fontSize:"13px", color:T.muted }}>
              Or WhatsApp us:{" "}
              <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`} target="_blank" rel="noopener noreferrer"
                style={{ color:T.green, fontWeight:"600", textDecoration:"none" }}>9710918099</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Poster Card ─────────────────────────────────────────────────────── */
function PosterCard({ poster, onEnquire }) {
  const [hov, setHov] = useState(false);
  const catMeta = {
    real_estate:{ label:"Real Estate", color:T.blue },
    construction:{ label:"Construction", color:T.green },
    interior:{ label:"Interior Design", color:T.purple }
  };
  const meta = catMeta[poster.category] || catMeta.real_estate;

  const imgSrc = poster.image_path
    ? `${BASE_URL}${poster.image_path}`
    : poster.image_data || null;

  return (
    <div style={{
      ...S.card,
      transform: hov ? "translateY(-6px)" : "none",
      boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.14)" : "0 2px 12px rgba(0,0,0,0.06)"
    }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ position:"relative", overflow:"hidden", background:"#F1F5F9" }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={poster.title}
            style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", display:"block" }}
          />
        ) : (
          <div style={{ height:"200px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <span style={{ fontSize:"3rem", opacity:0.25 }}>🏢</span>
            <span style={{ color:T.muted, fontSize:"12px" }}>No image uploaded</span>
          </div>
        )}
        <span style={{ position:"absolute", top:"12px", left:"12px", ...S.tag(meta.color) }}>
          {meta.label}
        </span>
      </div>
      <div style={{ padding:"20px 20px 24px" }}>
        <h3 style={{ color:T.slate, fontSize:"1rem", fontWeight:"700", margin:"0 0 8px", lineHeight:"1.4" }}>
          {poster.title}
        </h3>
        <p style={{ color:T.muted, fontSize:"13px", lineHeight:"1.6", margin:"0 0 20px", minHeight:"40px" }}>
          {poster.description || "Contact us for more details about this property."}
        </p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button style={{ ...S.btn("primary"), flex:1, padding:"10px 12px", fontSize:"13px" }}
            onClick={()=>onEnquire(poster)}>
            Enquire Now
          </button>
          <a href={`https://wa.me/${WA_NUMBER}?text=Hi%20PlotX%2C%20I'm%20interested%20in%20${encodeURIComponent(poster.title)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              width:"42px", borderRadius:"8px", border:`1.5px solid #25D366`,
              background:"#25D36618", textDecoration:"none", flexShrink:0
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Service Page ────────────────────────────────────────────────────── */
const SERVICE_INFO = {
  real_estate: {
    key: "real_estate",
    label: "Real Estate",
    color: T.blue,
    accent: "#60A5FA",
    bg: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
    icon: "🏠",
    tagline: "Find Your Perfect Property",
    desc: "We offer premium residential plots, villas, and commercial spaces across Chennai with transparent dealings and expert guidance every step of the way.",
    features: [
      { icon:"📍", title:"Prime Locations", desc:"Carefully selected plots and properties in Porur, Maduravoyal, Valasaravakkam, and surrounding high-growth zones." },
      { icon:"📋", title:"Clear Documentation", desc:"Complete title verification, encumbrance certificate, and legal support to ensure a hassle-free purchase." },
      { icon:"💰", title:"Competitive Pricing", desc:"Best market prices with flexible payment options and assistance with home loan coordination." },
      { icon:"🔑", title:"End-to-End Support", desc:"From your first site visit to final registration — we're with you at every stage of the process." },
    ],
    process: ["Site Visit", "Document Verification", "Agreement", "Registration", "Handover"],
    cta: "Book a Free Site Visit",
    highlights: [
      { label: "Residential Plots", icon: "🏡" },
      { label: "Independent Villas", icon: "🏘️" },
      { label: "Commercial Spaces", icon: "🏢" },
      { label: "Agricultural Land", icon: "🌾" },
    ],
  },
  construction: {
    key: "construction",
    label: "Construction",
    color: T.green,
    accent: "#34D399",
    bg: "linear-gradient(135deg,#0d2414 0%,#1a4a2e 100%)",
    icon: "🏗️",
    tagline: "Build Your Dream, On Time & On Budget",
    desc: "From architectural planning to turnkey delivery, our construction division handles every aspect of your build with uncompromising quality and complete transparency.",
    features: [
      { icon:"📐", title:"Architectural Planning", desc:"Custom designs by experienced architects tailored to your land dimensions, lifestyle needs, and budget constraints." },
      { icon:"🏗️", title:"Structural Engineering", desc:"Earthquake-resistant RCC structures with premium materials — quality tested at every stage of construction." },
      { icon:"⏱️", title:"On-Time Delivery", desc:"Milestone-based construction schedules with penalty clauses for delays — we honour our commitments." },
      { icon:"📊", title:"Cost Transparency", desc:"Detailed BOQ (Bill of Quantities) provided upfront. No hidden charges. Regular financial updates throughout the project." },
    ],
    process: ["Design & Plan", "Foundation", "Structure", "Finishing", "Handover"],
    cta: "Get a Free Construction Quote",
    highlights: [
      { label: "Home Construction", icon: "🏠" },
      { label: "Architectural Design", icon: "📐" },
      { label: "Renovations", icon: "🔨" },
      { label: "Commercial Build", icon: "🏬" },
    ],
  },
  interior: {
    key: "interior",
    label: "Interior Design",
    color: T.purple,
    accent: "#C084FC",
    bg: "linear-gradient(135deg,#1a0a2e 0%,#3d1a6e 100%)",
    icon: "🛋️",
    tagline: "Spaces That Reflect Your Personality",
    desc: "Luxury modular interiors crafted to your taste. From living rooms to full home interiors — we design spaces you'll love coming home to.",
    features: [
      { icon:"🎨", title:"Custom Design Portfolio", desc:"3D visualizations and mood boards created before any work begins — see your home before it's built." },
      { icon:"🪵", title:"Premium Materials", desc:"Carefully sourced modular furniture, Italian laminates, German fittings, and premium hardware brands." },
      { icon:"⚡", title:"Fast Execution", desc:"Most interior projects completed in 45–60 days with minimal disruption to your daily routine." },
      { icon:"🛡️", title:"10-Year Warranty", desc:"Structural warranty on all modular furniture and installations backed by our quality guarantee." },
    ],
    process: ["Consultation", "3D Design", "Material Selection", "Execution", "Styling & Handover"],
    cta: "Get a Free Design Consultation",
     highlights: [
      { label: "Modular Kitchen", icon: "🍳" },
      { label: "Living Room", icon: "🛋️" },
      { label: "Bedroom Interiors", icon: "🛏️" },
      { label: "Commercial Interiors", icon: "🏢" },
    ],
  },
};

function ServicePage({ serviceKey, onEnquire, onBack }) {
  const info = SERVICE_INFO[serviceKey];
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
const [selectedCategory, setSelectedCategory] = useState("All");
const categories = [
  { label: "All", icon: "✨" },
  ...(info?.highlights || []),
];

const filteredPosters =
  selectedCategory === "All"
    ? posters
    : posters.filter(
        (poster) =>
          poster.sub_category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );
 

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    apiFetch(`/posters?category=${serviceKey}`)
      .then(data => setPosters(data))
      .catch(() => setPosters([]))
      .finally(() => setLoading(false));
  }, [serviceKey]);

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={{
        background: info.bg, paddingTop:"68px", minHeight: isMobile ? "auto" : "60vh",
        display:"flex", alignItems:"center", position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 100%)" }} />
        {!isMobile && (
          <div style={{
            position:"absolute", right:"8%", top:"50%", transform:"translateY(-50%)",
            fontSize:"clamp(120px,18vw,220px)", opacity:0.07, userSelect:"none"
          }}>{info.icon}</div>
        )}
        <div style={{ position:"relative", zIndex:2, padding: isMobile ? "40px 20px 48px" : "60px clamp(24px,6vw,96px)" }}>
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
            color:"rgba(255,255,255,0.8)", borderRadius:"8px", padding:"8px 16px",
            cursor:"pointer", fontFamily:font, fontSize:"13px", fontWeight:"600",
            marginBottom:"20px", display:"flex", alignItems:"center", gap:"6px"
          }}>← Back to Home</button>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
            padding:"6px 16px", borderRadius:"20px", marginBottom:"16px"
          }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:info.accent, display:"inline-block" }} />
            <span style={{ color:info.accent, fontSize:"12px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase" }}>{info.label}</span>
          </div>
          <h1 style={{
            color:"#fff", fontWeight:"800", lineHeight:"1.1",
            fontSize: isMobile ? "2rem" : "clamp(2.2rem,5vw,4rem)",
            margin:"0 0 16px", maxWidth:"700px"
          }}>{info.tagline}</h1>
          <p style={{ color:"rgba(255,255,255,0.72)", fontSize: isMobile ? "0.95rem" : "1.1rem", lineHeight:"1.7", maxWidth:"560px", marginBottom:"28px" }}>
            {info.desc}
          </p>
          <button style={{ ...S.btn("white"), fontSize:"14px", width: isMobile ? "100%" : "auto" }}
            onClick={() => onEnquire(info.cta, info.label)}>
            {info.cta}
          </button>
        </div>
      </div>

      {/* banner */}
      <div style={{width:"100%",height:"400px"}}><img src={banner} alt="banner" style={{objectFit:"cover",width:"100%",height:"100%"}} /></div>

      {/* Process Bar */}
      <div style={{ background:T.white, borderBottom:`1px solid ${T.line}`, padding: isMobile ? "24px 16px" : "32px 0", overflowX:"auto" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto", padding: isMobile ? "0" : "0 48px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent: isMobile ? "flex-start" : "center", gap:"0", minWidth: isMobile ? "max-content" : "auto", padding: isMobile ? "0 4px" : "0" }}>
            {info.process.map((step, i) => (
              <div key={step} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                  <div style={{
                    width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px", borderRadius:"50%",
                    background: info.color+"18", border:`2px solid ${info.color}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontWeight:"700", fontSize: isMobile ? "12px" : "14px", color:info.color
                  }}>{i+1}</div>
                  <span style={{ fontSize: isMobile ? "10px" : "12px", fontWeight:"600", color:T.slate, whiteSpace:"nowrap" }}>{step}</span>
                </div>
                {i < info.process.length - 1 && (
                  <div style={{ width: isMobile ? "32px" : "60px", height:"2px", background:`linear-gradient(to right, ${info.color}, ${info.color}44)`, margin: isMobile ? "0 4px" : "0 8px", marginBottom:"20px" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section style={{ padding: isMobile ? "48px 20px" : "80px 48px", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: isMobile ? "32px" : "56px" }}>
          <span style={S.tag(info.color)}>Why Choose Us</span>
          <h2 style={{ fontSize: isMobile ? "1.6rem" : "clamp(1.8rem,4vw,2.6rem)", fontWeight:"800", color:T.slate, margin:"16px 0 12px" }}>
            What We Offer
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(260px,1fr))", gap:"20px" }}>
          {info.features.map(f => (
            <div key={f.title} style={{ ...S.card, padding:"24px", borderTop:`3px solid ${info.color}` }}>
              <div style={{ fontSize:"1.8rem", marginBottom:"12px" }}>{f.icon}</div>
              <h3 style={{ color:T.slate, fontSize:"1rem", fontWeight:"700", margin:"0 0 10px" }}>{f.title}</h3>
              <p style={{ color:T.slateM, fontSize:"13px", lineHeight:"1.7", margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

 

      {/* Listings */}
      <section style={{ background:T.white, padding: isMobile ? "48px 0" : "40px 0" }}>
   <div
  style={{
    display: "flex",
    justifyContent: "center",
    padding: "10px 0px 40px",
    gap: "12px",
    flexWrap: "wrap",
  }}
>
  {categories.map((item) => {
    const isActive = selectedCategory === item.label;

    return (
      <button
        key={item.label}
        onClick={() => setSelectedCategory(item.label)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 16px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          transition: "all 0.2s ease",

          border: isActive
            ? "1px solid #2563EB"
            : "1px solid #DBEAFE",

          background: isActive
            ? "#2563EB"
            : "#F8FAFC",

          color: isActive
            ? "#FFFFFF"
            : "#1E3A8A",

          boxShadow: isActive
            ? "0 4px 12px rgba(37,99,235,0.25)"
            : "none",
        }}
      >
        <span style={{ fontSize: "20px" }}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  })}
</div>
        <div style={{ padding: isMobile ? "0 16px" : "0 48px", maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between", marginBottom:"32px", flexDirection: isMobile ? "column" : "row", gap:"16px" }}>
            <div>
              <span style={S.tag(info.color)}>Our Listings</span>
              <h2 style={{ fontSize: isMobile ? "1.4rem" : "clamp(1.6rem,3vw,2.2rem)", fontWeight:"800", color:T.slate, margin:"12px 0 0" }}>
                {info.label} Projects
              </h2>
            </div>
            <button style={{ ...S.btn("outline"), color:info.color, borderColor:info.color, width: isMobile ? "100%" : "auto" }}
              onClick={() => onEnquire(`${info.label} — General Enquiry`, info.label)}>
              Get a Free Consultation
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign:"center", padding:"60px", color:T.muted }}>
              <div style={{ fontSize:"2rem", marginBottom:"12px", opacity:.4 }}>⏳</div>
              <p>Loading listings…</p>
            </div>
          ) : filteredPosters .length === 0 ? (
            <div style={{
              textAlign:"center", padding:"60px 24px",
              background:T.bg, borderRadius:"12px", border:`2px dashed ${T.line}`
            }}>
              <div style={{ fontSize:"3rem", marginBottom:"12px", opacity:.35 }}>📋</div>
              <p style={{ color:T.muted, fontSize:"15px" }}>No listings yet. Admin can add from the dashboard.</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(290px,1fr))", gap:"20px" }}>
              {filteredPosters .map(p => (
                <PosterCard key={p.id} poster={p}
                  onEnquire={() => onEnquire(`${p.title} — ${info.label}`, info.label)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: info.bg, padding: isMobile ? "48px 20px" : "64px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
        <div style={{ position:"relative", zIndex:2, maxWidth:"600px", margin:"0 auto" }}>
          <h2 style={{ color:"#fff", fontSize: isMobile ? "1.5rem" : "clamp(1.6rem,3vw,2.2rem)", fontWeight:"800", margin:"0 0 16px" }}>
            Ready to Get Started?
          </h2>
          <p style={{ color:"rgba(255,255,255,0.72)", fontSize:"1rem", marginBottom:"28px" }}>
            Talk to our {info.label.toLowerCase()} experts today. No obligation, just honest advice.
          </p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexDirection: isMobile ? "column" : "row", flexWrap:"wrap" }}>
            <button style={{ ...S.btn("white"), width: isMobile ? "100%" : "auto" }}
              onClick={() => onEnquire(info.cta, info.label)}>
              {info.cta}
            </button>
            <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px",
                padding:"12px 24px", borderRadius:"8px",
                background:"#25D366", color:"#fff",
                fontFamily:font, fontWeight:"600", fontSize:"14px",
                textDecoration:"none", border:"none",
                width: isMobile ? "100%" : "auto", boxSizing:"border-box"
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Services Home Section ─────────────────────────────────────────── */
function ServicesSection({ onEnquire, setRoute }) {
  const isMobile = useIsMobile();

  const services = [
    {
      key:"real_estate", label:"Real Estate", color:T.blue, accent:"#60A5FA",
      bg:"linear-gradient(135deg,#0f172a,#1e3a5f)", icon:"🏠",
      tagline:"Own Your Dream Property",
      desc:"Premium plots, villas & commercial spaces in Chennai's most sought-after locations.",
      highlights:[
        { label:"Residential Plots", icon:"🏡" },
        { label:"Independent Villas", icon:"🏘️" },
        { label:"Commercial Spaces", icon:"🏢" },
        { label:"Agricultural Land", icon:"🌾" },
      ],
    },
    {
      key:"construction", label:"Construction", color:T.green, accent:"#34D399",
      bg:"linear-gradient(135deg,#0d2414,#1a4a2e)", icon:"🏗️",
      tagline:"Build With Precision",
      desc:"End-to-end construction from architectural planning to turnkey delivery, crafted for excellence.",
      highlights:[
        { label:"Home Construction", icon:"🏠" },
        { label:"Architectural Design", icon:"📐" },
        { label:"Renovations", icon:"🔨" },
        { label:"Commercial Build", icon:"🏬" },
      ],
    },
    {
      key:"interior", label:"Interior Design", color:T.purple, accent:"#C084FC",
      bg:"linear-gradient(135deg,#1a0a2e,#3d1a6e)", icon:"🛋️",
      tagline:"Transform Your Space",
      desc:"Luxury modular interiors crafted to your personality — spaces you'll love every day.",
      highlights:[
        { label:"Modular Kitchen", icon:"🍳" },
        { label:"Living Room", icon:"🛋️" },
        { label:"Bedroom Interiors", icon:"🛏️" },
        { label:"Commercial Interiors", icon:"🏢" },
      ],
    },
  ];

  return (
    <section style={{ background:T.white, padding: isMobile ? "48px 0" : "80px 0" }} id="services">
      <div style={{ padding: isMobile ? "0 16px" : "0 48px", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom: isMobile ? "36px" : "64px" }}>
          <span style={S.tag(T.blue)}>Our Services</span>
          <h2 style={{ fontSize: isMobile ? "1.7rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight:"800", color:T.slate, margin:"16px 0 12px", letterSpacing:"-0.5px" }}>
            Three Pillars of Excellence
          </h2>
          <p style={{ color:T.slateM, fontSize:"1rem", maxWidth:"480px", margin:"0 auto", lineHeight:"1.7" }}>
            From land acquisition to your dream living space — we handle every step.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(320px,1fr))", gap:"24px" }}>
          {services.map(svc => (
            <ServiceCard
              key={svc.key}
              svc={svc}
              onEnquire={onEnquire}
              setRoute={setRoute}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ svc, onEnquire, setRoute, isMobile }) {
  const [hovCard, setHovCard] = useState(false);
  const [hovBtn, setHovBtn] = useState(null);

  return (
    <div
      style={{
        ...S.card, overflow:"hidden", display:"flex", flexDirection:"column",
        transform: hovCard ? "translateY(-6px)" : "none",
        boxShadow: hovCard ? `0 16px 48px ${svc.color}22` : "0 2px 12px rgba(0,0,0,0.06)",
        border: hovCard ? `1.5px solid ${svc.color}44` : `1px solid ${T.line}`,
        transition:"all 0.25s",
      }}
      onMouseEnter={() => setHovCard(true)}
      onMouseLeave={() => setHovCard(false)}
    >
      {/* Dark header */}
      <div style={{
        background: svc.bg,
        padding: isMobile ? "28px 20px 24px" : "36px 28px 28px",
        position:"relative", overflow:"hidden"
      }}>
        <div style={{
          position:"absolute", right:"-10px", top:"-10px",
          fontSize:"80px", opacity:0.1, userSelect:"none"
        }}>{svc.icon}</div>

        <div style={{
          display:"inline-flex", alignItems:"center", gap:"8px",
          background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
          padding:"5px 12px", borderRadius:"20px", marginBottom:"14px"
        }}>
          <span style={{ color:svc.accent, fontSize:"11px", fontWeight:"700", letterSpacing:"1.5px", textTransform:"uppercase" }}>{svc.label}</span>
        </div>

        <h3 style={{ color:"#fff", fontSize: isMobile ? "1.2rem" : "1.35rem", fontWeight:"800", margin:"0 0 8px" }}>
          {svc.tagline}
        </h3>
        <p style={{ color:"rgba(255,255,255,0.65)", fontSize:"13px", lineHeight:"1.7", margin:0 }}>
          {svc.desc}
        </p>
      </div>

      {/* Highlight buttons */}
      <div style={{ padding: isMobile ? "20px" : "24px 28px", flex:1, display:"flex", flexDirection:"column", gap:"16px" }}>
        <p style={{
          fontSize:"11px", fontWeight:"700", letterSpacing:"1.2px",
          textTransform:"uppercase", color:T.muted, margin:0
        }}>Select a Service</p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
          {svc.highlights.map((h) => {
            const isHov = hovBtn === h.label;
            return (
              <button
                key={h.label}
                onMouseEnter={() => setHovBtn(h.label)}
                onMouseLeave={() => setHovBtn(null)}
                onClick={() => {
                  setRoute(svc.key);
                  setTimeout(() => onEnquire(`${h.label} — ${svc.label}`, svc.label), 300);
                }}
                style={{
                  display:"flex", alignItems:"center", gap:"7px",
                  padding: isMobile ? "9px 10px" : "10px 12px",
                  borderRadius:"9px", cursor:"pointer", fontFamily:font,
                  fontSize: isMobile ? "11px" : "12px", fontWeight:"600",
                  textAlign:"left", transition:"all 0.18s",
                  border: isHov ? `1.5px solid ${svc.color}` : `1.5px solid ${T.line}`,
                  background: isHov ? svc.color+"10" : T.bg,
                  color: isHov ? svc.color : T.slateM,
                  transform: isHov ? "scale(1.03)" : "scale(1)",
                  boxShadow: isHov ? `0 4px 14px ${svc.color}22` : "none",
                }}
              >
                <span style={{ fontSize:"15px", lineHeight:1 }}>{h.icon}</span>
                <span style={{ lineHeight:"1.3" }}>{h.label}</span>
              </button>
            );
          })}
        </div>

        {/* Explore button */}
        <button
          style={{
            ...S.btn("primary"), width:"100%", padding:"11px 16px", fontSize:"13px",
            background: svc.color, boxShadow:`0 2px 12px ${svc.color}44`,
            display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
            marginTop:"4px"
          }}
          onClick={() => setRoute(svc.key)}
        >
          Explore All {svc.label}
          <span style={{ fontSize:"16px" }}>→</span>
        </button>
      </div>
    </div>
  );
}
/* ── Trust Bar ──────────────────────────────────────────────────────── */
function TrustBar() {
  const isMobile = useIsMobile();
  const items = [
    { icon:"🏆", label:"Trusted Agency", sub:"Serving Chennai since 2010" },
    { icon:"📍", label:"Prime Location", sub:"Porur & surrounding areas" },
    { icon:"🤝", label:"Transparent Process", sub:"No hidden charges" },
    { icon:"🔑", label:"End-to-End Support", sub:"Site visit to registration" },
  ];
  return (
    <div style={{ background:T.blue, padding: isMobile ? "32px 0" : "48px 0" }}>
      <div style={{ padding: isMobile ? "0 16px" : "0 48px", maxWidth:"1200px", margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit,minmax(200px,1fr))", gap: isMobile ? "20px" : "32px" }}>
          {items.map(item=>(
            <div key={item.label} style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
              <span style={{ fontSize: isMobile ? "1.5rem" : "2rem", lineHeight:1 }}>{item.icon}</span>
              <div>
                <div style={{ color:T.white, fontWeight:"700", fontSize: isMobile ? "13px" : "15px" }}>{item.label}</div>
                <div style={{ color:"rgba(255,255,255,0.65)", fontSize: isMobile ? "11px" : "13px", marginTop:"2px" }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CTA Strip ──────────────────────────────────────────────────────── */
function CTAStrip({ onEnquire }) {
  const isMobile = useIsMobile();
  return (
    <section style={{ background:"#F0F4FF", borderTop:`1px solid #D1DCF8`, borderBottom:`1px solid #D1DCF8` }}>
      <div style={{
        maxWidth:"1200px", margin:"0 auto",
        display:"flex", alignItems: isMobile ? "flex-start" : "center",
        justifyContent:"space-between",
        flexDirection: isMobile ? "column" : "row",
        flexWrap:"wrap", gap:"24px",
        padding: isMobile ? "32px 16px" : "48px"
      }}>
        <div>
          <h3 style={{ color:T.slate, fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight:"800", margin:"0 0 8px" }}>
            Ready to find your perfect property?
          </h3>
          <p style={{ color:T.slateM, fontSize:"13px", margin:0 }}>
            Trusted deals. Transparent process. Happy buyers.
          </p>
        </div>
        <div style={{ display:"flex", gap:"12px", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", width: isMobile ? "100%" : "auto" }}>
          <div style={{ fontSize:"13px", color:T.slateM }}>
            📧{" "}<a href="mailto:sales@plotxrealty.com " style={{ color:T.blue, textDecoration:"none", fontWeight:"600" }}>sales@plotxrealty.com </a>
          </div>
          <div style={{ fontSize:"13px", color:T.slateM }}>
            📞{" "}
            <a href="tel:+919710918099" style={{ color:T.slate, fontWeight:"600", textDecoration:"none" }}>9710918099</a>
            {" | "}
            <a href="tel:+919944352567" style={{ color:T.slate, fontWeight:"600", textDecoration:"none" }}>9944352567</a>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button style={{ ...S.btn("primary"), padding:"12px 20px", flex: isMobile ? 1 : "none" }}
              onClick={()=>onEnquire("CTA Strip","General")}>Get Callback</button>
            <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px",
                padding:"12px 16px", borderRadius:"8px",
                background:"#25D366", color:"#fff",
                fontFamily:font, fontWeight:"600", fontSize:"14px",
                textDecoration:"none", border:"none",
                flex: isMobile ? 1 : "none"
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Mobile Menu ────────────────────────────────────────────────────── */
function MobileMenu({ open, onClose, setRoute, onEnquire, route }) {
  if (!open) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:250,
      background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)"
    }} onClick={onClose}>
      <div style={{
        position:"absolute", top:0, right:0, bottom:0, width:"280px",
        background:T.white, boxShadow:"-8px 0 40px rgba(0,0,0,0.15)",
        display:"flex", flexDirection:"column",
        padding:"80px 24px 32px"
      }} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{
          position:"absolute", top:"20px", right:"20px",
          background:"none", border:`1px solid ${T.line}`, borderRadius:"8px",
          cursor:"pointer", color:T.slate, width:"36px", height:"36px",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px"
        }}>×</button>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px", marginBottom:"32px" }}>
          {[
            { label:"Real Estate", route:"real_estate", color:T.blue },
            { label:"Construction", route:"construction", color:T.green },
            { label:"Interior Design", route:"interior", color:T.purple },
          ].map(l=>(
            <button key={l.route} onClick={()=>{ setRoute(l.route); onClose(); }}
              style={{
                color: route===l.route ? l.color : T.slate,
                fontSize:"16px", fontWeight:"600", padding:"14px 16px",
                borderRadius:"10px", border:"none", cursor:"pointer",
                background: route===l.route ? l.color+"12" : "transparent",
                fontFamily:font, textAlign:"left", transition:"all 0.2s",
                display:"flex", alignItems:"center", gap:"10px"
              }}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          <button style={{ ...S.btn("primary"), width:"100%", padding:"14px" }}
            onClick={()=>{ onEnquire("Navbar","General"); onClose(); }}>
            Book a Site Visit
          </button>
          <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`} target="_blank" rel="noopener noreferrer"
            style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
              padding:"14px", borderRadius:"8px",
              background:"#25D36618", border:`1.5px solid #25D36640`,
              color:"#16A34A", fontWeight:"700", fontSize:"14px", textDecoration:"none",
              fontFamily:font
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16A34A">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
          <button style={{ ...S.btn("outline"), width:"100%", padding:"12px", fontSize:"12px" }}
            onClick={()=>{ setRoute("admin"); onClose(); }}>
            Admin Portal
          </button>
        </div>
        <div style={{ marginTop:"auto", paddingTop:"24px", borderTop:`1px solid ${T.line}` }}>
          <p style={{ fontSize:"12px", color:T.muted, textAlign:"center" }}>
            📞 <a href="tel:+919710918099" style={{ color:T.slate, fontWeight:"600", textDecoration:"none" }}>9710918099</a>
            {" | "}
            <a href="tel:+919944352567" style={{ color:T.slate, fontWeight:"600", textDecoration:"none" }}>9944352567</a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Navbar ─────────────────────────────────────────────────────────── */
function Navbar({ onEnquire, logo, setRoute, route }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(()=>{
    const fn = ()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  const navLinks = [
    { label:"Real Estate", route:"real_estate" },
    { label:"Construction", route:"construction" },
    { label:"Interior Design", route:"interior" },
  ];

  return (
    <>
      <nav style={{
        ...S.nav,
        padding: isMobile ? "0 16px" : "0 48px",
        boxShadow: scrolled?"0 4px 24px rgba(0,0,0,0.1)":"0 1px 12px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }} onClick={()=>setRoute("public")}>
          {logo
            ? <img src={logo} alt="PlotX Logo" style={{ height:"36px", objectFit:"contain" }} />
            : (
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"8px", background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"900", fontSize:"16px" }}>P</div>
                <div>
                  <div style={{ fontWeight:"900", fontSize:"17px", letterSpacing:"-0.3px", color:T.slate, lineHeight:1 }}>Plot X</div>
                  <div style={{ fontSize:"10px", color:T.muted, letterSpacing:"1.2px", textTransform:"uppercase" }}>Real Estate</div>
                </div>
              </div>
            )
          }
        </div>

        {isMobile ? (
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <button style={{ ...S.btn("primary"), padding:"9px 16px", fontSize:"13px" }}
              onClick={()=>onEnquire("Navbar","General")}>
              Book Visit
            </button>
            <button onClick={()=>setMenuOpen(true)} style={{
              background:"none", border:`1.5px solid ${T.line}`, borderRadius:"8px",
              cursor:"pointer", padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.slate} strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
            {navLinks.map(l=>(
              <button key={l.route} onClick={()=>setRoute(l.route)}
                style={{
                  color: route===l.route ? T.blue : T.slateM,
                  fontSize:"13px", fontWeight:"600", padding:"8px 12px",
                  borderRadius:"6px", border:"none", cursor:"pointer",
                  background: route===l.route ? T.blueL : "transparent",
                  fontFamily:font, transition:"all 0.2s"
                }}>
                {l.label}
              </button>
            ))}
            <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`} target="_blank" rel="noopener noreferrer"
              style={{
                display:"inline-flex", alignItems:"center", gap:"6px",
                padding:"8px 14px", borderRadius:"8px",
                background:"#25D36618", border:"1px solid #25D36630",
                color:"#16A34A", fontWeight:"700", fontSize:"13px", textDecoration:"none"
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#16A34A">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <button style={{ ...S.btn("primary"), padding:"9px 18px", fontSize:"13px" }}
              onClick={()=>onEnquire("Navbar","General")}>
              Book Visit
            </button>
            <button style={{ ...S.btn("outline"), padding:"9px 14px", fontSize:"12px" }}
              onClick={()=>setRoute("admin")}>
              Admin
            </button>
          </div>
        )}
      </nav>

      <MobileMenu
        open={menuOpen}
        onClose={()=>setMenuOpen(false)}
        setRoute={setRoute}
        onEnquire={onEnquire}
        route={route}
      />
    </>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function Footer({ logo, setRoute }) {
  const isMobile = useIsMobile();

  const SocialIcon = ({ href, label, children, bg, hoverBg }) => {
    const [hov, setHov] = useState(false);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          width:"40px", height:"40px", borderRadius:"10px",
          background: hov ? hoverBg : bg,
          border:`1px solid rgba(255,255,255,0.15)`, textDecoration:"none", transition:"all 0.2s"
        }}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} aria-label={label}>
        {children}
      </a>
    );
  };

  return (
    <footer style={{ background:"#0F172A", color:"rgba(255,255,255,0.6)" }}>
      <div style={{ borderBottom:"1px solid rgba(255,255,255,0.08)", padding: isMobile ? "20px 16px" : "28px 48px" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", display:"flex", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between", flexDirection: isMobile ? "column" : "row", gap:"16px" }}>
          <div>
            <p style={{ color:"rgba(255,255,255,0.8)", fontWeight:"700", fontSize: isMobile ? "14px" : "15px", margin:"0 0 4px" }}>Follow us for latest listings & updates</p>
            <p style={{ fontSize:"13px", margin:0 }}>Stay connected with Plot X on social media</p>
          </div>
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            <SocialIcon href={FB_URL} label="Facebook" bg="rgba(24,119,242,0.15)" hoverBg="rgba(24,119,242,0.35)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </SocialIcon>
            <SocialIcon href={IG_URL} label="Instagram" bg="rgba(225,48,108,0.15)" hoverBg="rgba(225,48,108,0.35)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </SocialIcon>
            <SocialIcon href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`} label="WhatsApp" bg="rgba(37,211,102,0.15)" hoverBg="rgba(37,211,102,0.35)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </SocialIcon>
            <SocialIcon href={TG_URL} label="Telegram" bg="rgba(36,161,222,0.15)" hoverBg="rgba(36,161,222,0.35)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#24A1DE">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://www.linkedin.com/in/plotx-realty" label="LinkedIn" bg="rgba(10,102,194,0.15)" hoverBg="rgba(10,102,194,0.35)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </SocialIcon>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "36px 16px 28px" : "56px 48px 32px" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: isMobile ? "32px 20px" : "40px", marginBottom: isMobile ? "32px" : "48px" }}>
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px", cursor:"pointer" }} onClick={() => setRoute("public")}>
                {logo
                  ? <img src={logo} alt="PlotX" style={{ height:"36px", objectFit:"contain" }} />
                  : (
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"32px",height:"32px",borderRadius:"6px",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:"900",fontSize:"14px" }}>P</div>
                      <span style={{ color:"#fff",fontWeight:"800",fontSize:"16px" }}>Plot X</span>
                    </div>
                  )
                }
              </div>
              <p style={{ fontSize:"13px", lineHeight:"1.7", maxWidth:"260px", margin:"0 0 20px" }}>
                Trusted property experts in Chennai. Your dream property is just one conversation away.
              </p>
              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
                {[WA_NUMBER, WA_NUMBER2].map((num,i)=>(
                  <a key={i} href={`https://wa.me/${num}`} target="_blank" rel="noopener noreferrer"
                    style={{
                      display:"flex", alignItems:"center", gap:"6px",
                      background:"#25D36622", border:"1px solid #25D36644",
                      padding:"7px 12px", borderRadius:"6px",
                      color:"#4ADE80", textDecoration:"none", fontSize:"12px", fontWeight:"600"
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#4ADE80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    {num.replace("91","")}
                  </a>
                ))}
              </div>
            </div>
            {[
              { title:"Services", links:[
                {l:"Real Estate",r:"real_estate"},{l:"Construction",r:"construction"},
                {l:"Interior Design",r:"interior"},{l:"Site Visits",r:"public"}
              ]},
              { title:"Contact", links:[
                {l:"📍 Porur, Chennai",r:null},{l:"📞 9710918099",r:null},
                {l:"📞 9944352567",r:null},{l:"📧 sales@plotxrealty.com",r:null}
              ]},
            ].map(col=>(
              <div key={col.title}>
                <h4 style={{ color:"#fff",fontWeight:"700",fontSize:"12px",letterSpacing:"0.5px",marginBottom:"14px",textTransform:"uppercase" }}>{col.title}</h4>
                {col.links.map(item=>(
                  <div key={item.l} style={{ fontSize:"13px",marginBottom:"10px",lineHeight:"1.5" }}>
                    {item.r ? (
                      <span style={{ cursor:"pointer",color:"rgba(255,255,255,0.6)" }}
                        onClick={()=>setRoute(item.r)}>
                        {item.l}
                      </span>
                    ) : item.l}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px" }}>
            <span style={{ fontSize:"12px" }}>© 2025 Plot X. A Real Estate Agency — Porur, Chennai, India.</span>
            <span style={{ fontSize:"12px" }}>Trusted Property Experts Since 2010</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── WhatsApp Floating Button ─────────────────────────────────────── */
function WAFloat() {
  return (
    <a href={`https://chat.whatsapp.com/H1tWAM25JiN9kvaZ1eX3RJ`}
      target="_blank" rel="noopener noreferrer"
      style={{
        position:"fixed", bottom:"24px", right:"20px", zIndex:500,
        width:"52px", height:"52px", borderRadius:"50%",
        background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 20px rgba(37,211,102,0.5)", textDecoration:"none",
        animation:"waPulse 2s infinite"
      }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <style>{`@keyframes waPulse{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5)}50%{box-shadow:0 4px 32px rgba(37,211,102,0.8)}}`}</style>
    </a>
  );
}

/* ── Admin Login ─────────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [creds, setCreds] = useState({ username:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setErr(""); setLoading(true);
    try {
      const data = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username: creds.username, password: creds.password }),
      });
      localStorage.setItem("plotx_token", data.token);
      onLogin();
    } catch (e) {
      setErr(e.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"20px" }}>
      <div style={{ background:T.white, borderRadius:"16px", border:`1px solid ${T.line}`,
        padding:"40px 28px", width:"100%", maxWidth:"420px", boxShadow:"0 24px 64px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ width:"52px",height:"52px",borderRadius:"12px",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",color:"#fff",fontWeight:"900",fontSize:"22px" }}>P</div>
          <h2 style={{ color:T.slate, fontSize:"1.5rem", fontWeight:"800", margin:"0 0 4px" }}>Admin Portal</h2>
          <p style={{ color:T.muted, fontSize:"14px" }}>Plot X Dashboard</p>
        </div>
        {["username","password"].map(f=>(
          <div key={f} style={{ marginBottom:"16px" }}>
            <label style={S.label}>{f}</label>
            <input style={{ ...S.input, fontSize:"16px" }} type={f==="password"?"password":"text"}
              value={creds[f]} onChange={e=>setCreds({...creds,[f]:e.target.value})}
              onKeyDown={e=>e.key==="Enter"&&login()}
              onFocus={e=>e.target.style.borderColor=T.blue}
              onBlur={e=>e.target.style.borderColor=T.line}
            />
          </div>
        ))}
        {err && <p style={{ color:T.red,fontSize:"13px",marginBottom:"12px",padding:"10px 14px",background:"#FEF2F2",borderRadius:"6px" }}>{err}</p>}
        <button style={{ ...S.btn("primary"),width:"100%",padding:"14px",fontSize:"16px" }} onClick={login} disabled={loading}>
          {loading?"Signing in…":"Sign In"}
        </button>
      </div>
    </div>
  );
}

/* ── Admin Dashboard ─────────────────────────────────────────────────── */
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [posters, setPosters] = useState([]);
  const [upload, setUpload] = useState({ title:"", description:"", category:"real_estate", file:null, preview:null });
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingPosters, setLoadingPosters] = useState(false);
  const [logo, setLogo] = useState(()=>localStorage.getItem("plotx_logo")||null);
  const [logoPreview, setLogoPreview] = useState(()=>localStorage.getItem("plotx_logo")||null);
  const isMobile = useIsMobile();

  const showMsg = (text, type="success") => {
    setMsg(text); setMsgType(type);
    setTimeout(()=>setMsg(""), 3500);
  };

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const data = await apiFetch("/admin/leads");
      setLeads(data);
    } catch (e) {
      showMsg(`Failed to load leads: ${e.message}`, "error");
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  const fetchPosters = useCallback(async () => {
    setLoadingPosters(true);
    try {
      const data = await apiFetch("/posters");
      setPosters(data);
    } catch (e) {
      showMsg(`Failed to load posters: ${e.message}`, "error");
    } finally {
      setLoadingPosters(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchPosters();
  }, [fetchLeads, fetchPosters]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpload(u => ({ ...u, file }));
    const reader = new FileReader();
    reader.onload = ev => setUpload(u => ({ ...u, preview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result;
      setLogoPreview(b64);
      localStorage.setItem("plotx_logo", b64);
      setLogo(b64);
    };
    reader.readAsDataURL(file);
  };

  const uploadPoster = async () => {
    if (!upload.title || !upload.category) {
      showMsg("Title and category are required.", "error");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", upload.title);
      formData.append("description", upload.description || "");
      formData.append("category", upload.category);
      if (upload.file) formData.append("image", upload.file);
      await apiFetch("/admin/posters", { method:"POST", body: formData });
      showMsg("✓ Poster uploaded successfully");
      setUpload({ title:"", description:"", category:"real_estate", file:null, preview:null });
      fetchPosters();
    } catch (e) {
      showMsg(`Upload failed: ${e.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const deletePoster = async (id) => {
    if (!window.confirm("Delete this poster?")) return;
    try {
      await apiFetch(`/admin/posters/${id}`, { method:"DELETE" });
      fetchPosters();
    } catch (e) {
      showMsg(`Delete failed: ${e.message}`, "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("plotx_token");
    onLogout();
  };

  const catMeta = {
    real_estate:{ label:"Real Estate", color:T.blue },
    construction:{ label:"Construction", color:T.green },
    interior:{ label:"Interior Design", color:T.purple }
  };

  const monthLeads = leads.filter(l => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const tabs = [["leads","Leads"],["content","Content"],["upload","Upload"],["settings","Settings"]];

  return (
    <div style={S.page}>
      <div style={{ ...S.nav, padding: isMobile ? "0 12px" : "0 48px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
          <div style={{ width:"32px",height:"32px",borderRadius:"8px",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:"900",fontSize:"14px" }}>P</div>
          {!isMobile && <span style={{ fontWeight:"800",color:T.slate,fontSize:"15px" }}>Plot X</span>}
          <span style={S.tag(T.blue)}>Admin</span>
        </div>
        <div style={{ display:"flex",gap: isMobile ? "4px" : "6px", overflowX:"auto" }}>
          {tabs.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{ ...S.btn(tab===k?"primary":"outline"), padding: isMobile ? "8px 10px" : "8px 16px", fontSize: isMobile ? "11px" : "12px", whiteSpace:"nowrap" }}>{l}</button>
          ))}
          <button style={{ padding: isMobile ? "8px 10px" : "8px 16px", fontSize: isMobile ? "11px" : "12px", border:`1.5px solid ${T.line}`,
            borderRadius:"8px",background:"transparent",color:T.red,cursor:"pointer",fontFamily:font,fontWeight:"600", whiteSpace:"nowrap" }}
            onClick={logout}>{isMobile ? "Exit" : "Logout"}</button>
        </div>
      </div>

      <div style={{ paddingTop:"80px" }}>
        <div style={{ background:T.white,borderBottom:`1px solid ${T.line}`,padding: isMobile ? "16px" : "24px 48px" }}>
          <div style={{ display:"flex",gap:"12px",maxWidth:"1200px",margin:"0 auto", overflowX:"auto" }}>
            {[["Total Leads",leads.length,T.blue],["Posters",posters.length,T.green],["This Month",monthLeads,T.purple]].map(([l,v,c])=>(
              <div key={l} style={{ background:T.bg,border:`1px solid ${c}22`,
                borderLeft:`4px solid ${c}`,padding: isMobile ? "12px 16px" : "16px 24px",borderRadius:"8px", minWidth: isMobile ? "110px" : "auto" }}>
                <div style={{ fontSize:"10px",letterSpacing:"1px",color:T.muted,textTransform:"uppercase",marginBottom:"4px" }}>{l}</div>
                <div style={{ fontSize: isMobile ? "1.6rem" : "2rem",fontWeight:"800",color:c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: isMobile ? "20px 16px" : "88px 48px", maxWidth:"1200px", margin:"0 auto" }}>
          {msg && (
            <div style={{
              padding:"12px 16px", borderRadius:"8px", marginBottom:"20px", fontWeight:"600", fontSize:"13px",
              background: msgType==="error" ? "#FEF2F2" : "#DCFCE7",
              border: `1px solid ${msgType==="error" ? "#FECACA" : "#86EFAC"}`,
              color: msgType==="error" ? T.red : "#15803D"
            }}>{msg}</div>
          )}

          {tab==="leads" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <h2 style={{ color:T.slate,fontWeight:"800",fontSize: isMobile ? "1.3rem" : "1.6rem",margin:0 }}>Customer Leads</h2>
                <button onClick={fetchLeads} style={{ ...S.btn("outline"), padding:"8px 14px", fontSize:"12px" }}>↻ Refresh</button>
              </div>
              {loadingLeads ? (
                <p style={{ color:T.muted, padding:"40px", textAlign:"center" }}>Loading leads…</p>
              ) : isMobile ? (
                /* Mobile lead cards */
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {leads.map(l=>(
                    <div key={l.id} style={{ ...S.card, padding:"16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
                        <div>
                          <p style={{ fontWeight:"700", color:T.slate, margin:"0 0 2px", fontSize:"15px" }}>{l.name}</p>
                          <a href={`tel:+91${l.mobile}`} style={{ color:T.blue, fontWeight:"600", textDecoration:"none", fontSize:"14px" }}>{l.mobile}</a>
                        </div>
                        <span style={S.tag(catMeta[l.service?.toLowerCase().replace(/ /g,"_")]?.color||T.blue)}>{l.service||"—"}</span>
                      </div>
                      <p style={{ color:T.muted, fontSize:"12px", margin:"0 0 6px" }}>{l.email}</p>
                      <p style={{ color:T.muted, fontSize:"11px", margin:0 }}>{l.source_context||"—"} · {new Date(l.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                  {leads.length===0 && <p style={{ color:T.muted, textAlign:"center", padding:"40px" }}>No leads yet.</p>}
                </div>
              ) : (
                <div style={{ background:T.white,borderRadius:"12px",border:`1px solid ${T.line}`,overflow:"hidden" }}>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"13px" }}>
                      <thead style={{ background:T.bg }}>
                        <tr>
                          {["Name","Email","Mobile","Service","Context","Date"].map(h=>(
                            <th key={h} style={{ padding:"14px 16px",textAlign:"left",color:T.muted,fontWeight:"700",letterSpacing:"0.8px",fontSize:"11px",textTransform:"uppercase",borderBottom:`1px solid ${T.line}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((l,i)=>(
                          <tr key={l.id} style={{ borderBottom:`1px solid ${T.line}`,background:i%2===0?"transparent":"#FAFAFA" }}>
                            <td style={{ padding:"14px 16px",color:T.slate,fontWeight:"600" }}>{l.name}</td>
                            <td style={{ padding:"14px 16px",color:T.slateM }}>{l.email}</td>
                            <td style={{ padding:"14px 16px" }}>
                              <a href={`tel:+91${l.mobile}`} style={{ color:T.blue,fontWeight:"600",textDecoration:"none" }}>{l.mobile}</a>
                            </td>
                            <td style={{ padding:"14px 16px" }}>
                              <span style={S.tag(catMeta[l.service?.toLowerCase().replace(/ /g,"_")]?.color||T.blue)}>
                                {l.service||"—"}
                              </span>
                            </td>
                            <td style={{ padding:"14px 16px",color:T.muted,fontSize:"12px" }}>{l.source_context||"—"}</td>
                            <td style={{ padding:"14px 16px",color:T.muted,fontSize:"11px" }}>{new Date(l.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {leads.length===0 && <p style={{ color:T.muted,textAlign:"center",padding:"40px" }}>No leads yet.</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==="content" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <h2 style={{ color:T.slate,fontWeight:"800",fontSize: isMobile ? "1.3rem" : "1.6rem",margin:0 }}>Manage Posters</h2>
                <button onClick={fetchPosters} style={{ ...S.btn("outline"), padding:"8px 14px", fontSize:"12px" }}>↻ Refresh</button>
              </div>
              {loadingPosters ? (
                <p style={{ color:T.muted, padding:"40px", textAlign:"center" }}>Loading posters…</p>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill,minmax(260px,1fr))",gap:"16px" }}>
                  {posters.map(p=>(
                    <div key={p.id} style={{ ...S.card,padding:"12px" }}>
                      {p.image_path && (
                        <img src={`${BASE_URL}${p.image_path}`} alt={p.title}
                          style={{ width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:"8px",marginBottom:"10px",display:"block" }}/>
                      )}
                      <span style={S.tag(catMeta[p.category]?.color||T.blue)}>{catMeta[p.category]?.label}</span>
                      <h3 style={{ color:T.slate,fontSize:"13px",fontWeight:"700",margin:"8px 0 4px" }}>{p.title}</h3>
                      <p style={{ color:T.muted,fontSize:"11px",marginBottom:"10px" }}>{p.description}</p>
                      <button onClick={()=>deletePoster(p.id)}
                        style={{ ...S.btn("outline"),width:"100%",padding:"8px",color:T.red,borderColor:T.red,fontSize:"12px" }}>
                        Delete
                      </button>
                    </div>
                  ))}
                  {posters.length===0 && <p style={{ color:T.muted }}>No posters yet.</p>}
                </div>
              )}
            </div>
          )}

          {tab==="upload" && (
            <div style={{ maxWidth:"560px" }}>
              <h2 style={{ color:T.slate,fontWeight:"800",fontSize: isMobile ? "1.3rem" : "1.6rem",marginBottom:"8px" }}>Upload Poster</h2>
              <p style={{ color:T.muted,marginBottom:"24px",fontSize:"14px" }}>Add new property listings. Images appear on the website instantly.</p>
              {upload.preview && (
                <div style={{ marginBottom:"16px",borderRadius:"10px",overflow:"hidden",border:`1px solid ${T.line}` }}>
                  <img src={upload.preview} alt="Preview"
                    style={{ width:"100%",aspectRatio:"4/3",objectFit:"cover",display:"block" }}/>
                  <div style={{ padding:"8px 12px",background:T.bg,fontSize:"12px",color:T.muted }}>
                    ✓ Image selected
                  </div>
                </div>
              )}
              {[{f:"title",label:"Title *",ph:"e.g. Premium Villa in Porur"},{f:"description",label:"Description",area:true,ph:"Brief description…"}].map(({f,label,ph,area})=>(
                <div key={f} style={{ marginBottom:"16px" }}>
                  <label style={S.label}>{label}</label>
                  {area
                    ? <textarea style={{ ...S.input,height:"80px",resize:"vertical",fontSize:"16px" }} value={upload[f]} placeholder={ph} onChange={e=>setUpload({...upload,[f]:e.target.value})} />
                    : <input style={{ ...S.input,fontSize:"16px" }} value={upload[f]} placeholder={ph} onChange={e=>setUpload({...upload,[f]:e.target.value})} />}
                </div>
              ))}
              <div style={{ marginBottom:"16px" }}>
                <label style={S.label}>Category *</label>
                <select style={{ ...S.input,fontSize:"16px" }} value={upload.category} onChange={e=>setUpload({...upload,category:e.target.value})}>
                  <option value="real_estate">Real Estate</option>
                  <option value="construction">Construction</option>
                  <option value="interior">Interior Design</option>
                </select>
              </div>
              <div style={{ marginBottom:"24px" }}>
                <label style={S.label}>Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange}
                  style={{ ...S.input,padding:"8px",cursor:"pointer",fontSize:"14px" }} />
              </div>
              <button style={{ ...S.btn("primary"),width:"100%",padding:"14px",fontSize:"16px" }} onClick={uploadPoster} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload Poster"}
              </button>
            </div>
          )}

          {tab==="settings" && (
            <div style={{ maxWidth:"560px" }}>
              <h2 style={{ color:T.slate,fontWeight:"800",fontSize: isMobile ? "1.3rem" : "1.6rem",marginBottom:"8px" }}>Settings</h2>
              <p style={{ color:T.muted,marginBottom:"24px",fontSize:"14px" }}>Customise your website branding.</p>
              <div style={{ background:T.white,borderRadius:"12px",border:`1px solid ${T.line}`,padding:"24px",marginBottom:"20px" }}>
                <h3 style={{ color:T.slate,fontSize:"15px",fontWeight:"700",margin:"0 0 16px" }}>Company Logo</h3>
                {logoPreview && (
                  <div style={{ marginBottom:"16px",padding:"16px",background:T.bg,borderRadius:"8px",textAlign:"center" }}>
                    <img src={logoPreview} alt="Logo preview" style={{ maxHeight:"60px",objectFit:"contain" }} />
                  </div>
                )}
                <label style={S.label}>Upload Logo Image</label>
                <input type="file" accept="image/*" onChange={handleLogoChange}
                  style={{ ...S.input,padding:"8px",cursor:"pointer",fontSize:"14px" }} />
              </div>
              <div style={{ background:"#F0FDF4",border:`1px solid #86EFAC`,borderRadius:"12px",padding:"20px" }}>
                <p style={{ color:"#14532D",fontSize:"13px",fontWeight:"600",margin:"0 0 6px" }}>✓ API Connected</p>
                <p style={{ color:"#166534",fontSize:"13px",margin:0,lineHeight:"1.6" }}>
                  All leads and posters are stored via your Flask backend at <code>{API}</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Root App ────────────────────────────────────────────────────────── */
export default function App() {
  const [route, setRoute] = useState("public");
  const [authed, setAuthed] = useState(!!localStorage.getItem("plotx_token"));
  const [modal, setModal] = useState({ open:false, context:"", service:"" });
  const [logo, setLogo] = useState(()=>localStorage.getItem("plotx_logo")||null);

  useEffect(()=>{
    const id = setInterval(()=>{
      const saved = localStorage.getItem("plotx_logo");
      if(saved!==logo) setLogo(saved);
    },1000);
    return ()=>clearInterval(id);
  },[logo]);

  const openLead = (context, service) => setModal({open:true,context,service});
  const closeLead = () => setModal({open:false,context:"",service:""});

  const handleSetRoute = (r) => {
    setRoute(r);
    window.scrollTo(0, 0);
  };

  if(route==="admin"){
    if(!authed) return <AdminLogin onLogin={()=>setAuthed(true)}/>;
    return <AdminDashboard onLogout={()=>{ setAuthed(false); handleSetRoute("public"); }}/>;
  }

  const isServicePage = ["real_estate","construction","interior"].includes(route);

  if (isServicePage) {
    return (
      <>
        <Navbar onEnquire={openLead} logo={logo} setRoute={handleSetRoute} route={route}/>
        <ServicePage serviceKey={route} onEnquire={openLead} onBack={()=>handleSetRoute("public")}/>
        <Footer logo={logo} setRoute={handleSetRoute}/>
        <WAFloat/>
        <LeadModal open={modal.open} onClose={closeLead} context={modal.context} service={modal.service}/>
      </>
    );
  }

  return (
    <div style={S.page}>
      <Navbar onEnquire={openLead} logo={logo} setRoute={handleSetRoute} route={route}/>
      <HeroCarousel onEnquire={openLead} setRoute={handleSetRoute}/>
      <TrustBar/>
      {/* banner */}
      <div style={{width:"100%",height:"400px"}}><img src={banner} alt="banner" style={{objectFit:"cover",width:"100%",height:"100%"}} /></div>

      <div id="services">
        <ServicesSection onEnquire={openLead} setRoute={handleSetRoute}/>
      </div>
      <CTAStrip onEnquire={openLead}/>
      <Footer logo={logo} setRoute={handleSetRoute}/>
      <WAFloat/>
      <LeadModal open={modal.open} onClose={closeLead} context={modal.context} service={modal.service}/>
    </div>
  );
}