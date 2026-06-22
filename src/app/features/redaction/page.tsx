import type { Metadata } from "next";
import { MarketingHeader } from "@/components/MarketingHeader";

export const metadata: Metadata = {
  title: "Redaction API | Visora",
  description: "Visora detects faces, license plates, and text, then returns a clean image with every sensitive region blurred in place.",
};

const redactionHtml = String.raw`<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #050505; }
  body { font-family: 'Sora', sans-serif; color: #fff; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::selection { background: rgba(255,255,255,0.22); }
  ::-webkit-scrollbar { width: 9px; }
  ::-webkit-scrollbar-track { background: #050505; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 6px; }
  @keyframes rdFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes rdSpin { 0% { transform: rotateX(60deg) rotateZ(-45deg); } 50% { transform: rotateX(60deg) rotateZ(-58deg); } 100% { transform: rotateX(60deg) rotateZ(-45deg); } }
  @keyframes rdGlow { 0%,100% { opacity: 0.55; transform: translate(-50%,-50%) scale(0.96); } 50% { opacity: 0.95; transform: translate(-50%,-50%) scale(1.08); } }
  .rd-root > nav { display: none !important; }
  @media (max-width: 900px) { .rd-nav-links { display: none !important; } }
  @media (max-width: 860px) {
    .rd-root > nav, .rd-root > section, .rd-root > footer { padding-left: 18px !important; padding-right: 18px !important; }
    .rd-cols-3, .rd-cols-2 { grid-template-columns: 1fr !important; }
  }
</style><div class="rd-root" style="position: relative; width: 100%; min-height: 100vh; background: #050505; overflow: hidden;">

  <!-- NAV -->
  <nav style="position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 18px 40px; background: rgba(5,5,5,0.72); border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
    <a href="/" style="display: flex; align-items: center; gap: 11px; text-decoration: none;">
      <span style="width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(150deg,#1b1d24,#0c0d11); border: 1px solid rgba(255,255,255,0.12); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 3px; padding: 6px;">
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.22);"></span>
        <span style="border-radius: 1.5px; background: #ffffff; box-shadow: 0 0 7px 1px rgba(255,255,255,0.8);"></span>
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.16);"></span>
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.22);"></span>
      </span>
      <span style="font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: #fff;">Visora</span>
    </a>
    <div class="rd-nav-links" style="display: flex; align-items: center; gap: 34px;">
      <a href="/features/redaction" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;">Product</a>
      <a href="/docs/redaction" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;">Documentation</a>
      <a href="/pricing" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;">Pricing</a>
      <a href="/contact" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;">Blog</a>
    </div>
    <div style="display: flex; align-items: center; gap: 18px;">
      <a href="/login" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;">Log In</a>
      <a href="/register" style="font-size: 14px; font-weight: 500; color: #050505; background: #fff; padding: 9px 18px; border-radius: 9px; text-decoration: none;">Start Free</a>
    </div>
  </nav>

  <!-- HERO -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 150px 40px 90px; display: flex; flex-direction: column; align-items: center; text-align: center;">
    <div style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); width: 760px; height: 520px; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); pointer-events: none;"></div>

    <div style="position: relative; z-index: 1; width: 280px; height: 230px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; perspective: 900px; perspective-origin: 50% 46%; transform-style: preserve-3d;">
      <div style="position: absolute; top: 54%; left: 50%; width: 280px; height: 240px; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(ellipse at center, rgba(255,255,255,0.13), rgba(255,255,255,0) 62%); filter: blur(16px); pointer-events: none; animation: rdGlow 6s ease-in-out infinite;"></div>
      <div style="position: absolute; inset: 0; transform-style: preserve-3d; animation: rdFloat 8s ease-in-out infinite;">
        <div style="position: absolute; top: 50%; left: 50%; transform-style: preserve-3d; transform: rotateX(60deg) rotateZ(-45deg); animation: rdSpin 18s ease-in-out infinite;">
          <span style="position:absolute; left:-62px; top:-62px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.25); border:1px solid rgba(255,255,255,0.18); transform:translateZ(6px);"></span><span style="position:absolute; left:-37px; top:-62px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span><span style="position:absolute; left:-12px; top:-62px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.36); border:1px solid rgba(255,255,255,0.18); transform:translateZ(14px);"></span><span style="position:absolute; left:13px; top:-62px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span><span style="position:absolute; left:38px; top:-62px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.25); border:1px solid rgba(255,255,255,0.18); transform:translateZ(6px);"></span>
          <span style="position:absolute; left:-62px; top:-37px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span><span style="position:absolute; left:-37px; top:-37px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.18); transform:translateZ(20px);"></span><span style="position:absolute; left:-12px; top:-37px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.59); border:1px solid rgba(255,255,255,0.18); transform:translateZ(30px);"></span><span style="position:absolute; left:13px; top:-37px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.45); border:1px solid rgba(255,255,255,0.18); transform:translateZ(20px);"></span><span style="position:absolute; left:38px; top:-37px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span>
          <span style="position:absolute; left:-62px; top:-12px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.36); border:1px solid rgba(255,255,255,0.18); transform:translateZ(14px);"></span><span style="position:absolute; left:-37px; top:-12px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.59); border:1px solid rgba(255,255,255,0.18); transform:translateZ(30px); box-shadow:0 0 14px rgba(255,255,255,0.35);"></span><span style="position:absolute; left:-12px; top:-12px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.82); border:1px solid rgba(255,255,255,0.18); transform:translateZ(46px); box-shadow:0 0 14px rgba(255,255,255,0.41);"></span><span style="position:absolute; left:13px; top:-12px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.59); border:1px solid rgba(255,255,255,0.18); transform:translateZ(30px); box-shadow:0 0 14px rgba(255,255,255,0.35);"></span><span style="position:absolute; left:38px; top:-12px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.36); border:1px solid rgba(255,255,255,0.18); transform:translateZ(14px);"></span>
          <span style="position:absolute; left:-62px; top:13px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span><span style="position:absolute; left:-37px; top:13px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.47); border:1px solid rgba(255,255,255,0.18); transform:translateZ(22px);"></span><span style="position:absolute; left:-12px; top:13px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.62); border:1px solid rgba(255,255,255,0.18); transform:translateZ(32px); box-shadow:0 0 14px rgba(255,255,255,0.31);"></span><span style="position:absolute; left:13px; top:13px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.47); border:1px solid rgba(255,255,255,0.18); transform:translateZ(22px);"></span><span style="position:absolute; left:38px; top:13px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.30); border:1px solid rgba(255,255,255,0.18); transform:translateZ(10px);"></span>
          <span style="position:absolute; left:-62px; top:38px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.26); border:1px solid rgba(255,255,255,0.18); transform:translateZ(7px);"></span><span style="position:absolute; left:-37px; top:38px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.33); border:1px solid rgba(255,255,255,0.18); transform:translateZ(12px);"></span><span style="position:absolute; left:-12px; top:38px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.42); border:1px solid rgba(255,255,255,0.18); transform:translateZ(18px);"></span><span style="position:absolute; left:13px; top:38px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.33); border:1px solid rgba(255,255,255,0.18); transform:translateZ(12px);"></span><span style="position:absolute; left:38px; top:38px; width:22px; height:22px; border-radius:3px; background:rgba(255,255,255,0.26); border:1px solid rgba(255,255,255,0.18); transform:translateZ(7px);"></span>
        </div>
      </div>
    </div>

    <div style="position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; padding: 5px 13px; border-radius: 20px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.22);">
      <span style="width: 6px; height: 6px; border-radius: 2px; background: #ffffff; box-shadow: 0 0 7px 1px rgba(255,255,255,0.8);"></span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.6);">REDACTION API</span>
    </div>

    <h1 style="position: relative; z-index: 1; margin: 0; font-size: clamp(44px, 6.5vw, 82px); line-height: 1.0; font-weight: 600; letter-spacing: -0.045em;">Don't just flag it.<br><span style="color: #ffffff;">Erase it.</span></h1>
    <p style="position: relative; z-index: 1; margin: 26px auto 0; max-width: 500px; font-size: 18px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">Visora detects faces, license plates, and text, then returns a clean image with every sensitive region blurred in place. One call does detection and redaction.</p>
    <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; margin-top: 34px; flex-wrap: wrap; justify-content: center;">
      <a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 13px 24px; border-radius: 11px; text-decoration: none;">Start redacting</a>
      <a href="/docs/redaction" style="display: inline-flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 13px 22px; border-radius: 11px; text-decoration: none; font-family: inherit;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.4);"><span style="width: 0; height: 0; border-left: 6px solid #ffffff; border-top: 4px solid transparent; border-bottom: 4px solid transparent; margin-left: 2px;"></span></span>Watch video</a>
    </div>
  </section>

  <!-- WHAT IT DETECTS -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 70px 40px;">
    <h2 style="margin: 0; font-size: clamp(30px,3.6vw,44px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Three things it makes disappear</h2>
    <div class="rd-cols-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 36px;">
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">01</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">Faces</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Anonymize every person in user uploads, group photos, and event imagery — no consent headaches.</p></div>
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">02</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">License plates</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Scrub vehicle plates from street-level, dashcam, and parking imagery before you store or ship it.</p></div>
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">03</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">Text &amp; PII</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Cover names, addresses, and IDs in documents and screenshots — keep PII out of your pipeline.</p></div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 70px 40px;">
    <h2 style="margin: 0 0 48px; font-size: clamp(30px,3.6vw,44px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Detection and blur, in one call</h2>
    <div class="rd-cols-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start;">
      <div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">1</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Send the image</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">POST any image to /redact with the region types you want covered.</p></div></div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">2</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Visora detects regions</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Faces, plates, and text are located with pixel-accurate bounding boxes.</p></div></div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">3</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Get a clean image back</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">A redacted output URL plus the coordinates of everything that was blurred.</p></div></div>
      </div>
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0a0a0a;">
        <div style="padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.07);"><span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4);">redact.sh</span></div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.85; padding: 20px 22px; color: rgba(255,255,255,0.5);"><div><span style="color: rgba(255,255,255,0.3);">$</span> <span style="color: rgba(255,255,255,0.85);">curl</span> -X POST https://api.visora.dev/redact \</div><div style="padding-left: 20px;">-H <span style="color: rgba(255,255,255,0.75);">"Authorization: Bearer $VISORA_KEY"</span> \</div><div style="padding-left: 20px;">-F <span style="color: rgba(255,255,255,0.75);">image=@upload.jpg</span> \</div><div style="padding-left: 20px;">-F <span style="color: rgba(255,255,255,0.75);">blur=faces,plates,text</span></div><div style="height: 16px;"></div><div style="color: rgba(255,255,255,0.3);">{</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"redactions"</span>: <span style="color: rgba(255,255,255,0.85);">3</span>,</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"regions"</span>: [</div><div style="padding-left: 36px;">{ "type": <span style="color: rgba(255,255,255,0.75);">"face"</span>, "box": [56,64,72,72] },</div><div style="padding-left: 36px;">{ "type": <span style="color: rgba(255,255,255,0.75);">"plate"</span>, "box": [310,228,116,38] },</div><div style="padding-left: 36px;">{ "type": <span style="color: rgba(255,255,255,0.75);">"text"</span>, "box": [150,150,130,26] }</div><div style="padding-left: 20px; color: rgba(255,255,255,0.3);">],</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"output"</span>: <span style="color: rgba(255,255,255,0.75);">"https://cdn.visora.dev/r/8f2a.jpg"</span></div><div style="color: rgba(255,255,255,0.3);">}</div></div>
      </div>
    </div>
  </section>

  <!-- BEFORE / AFTER EXAMPLES -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 0 40px 80px;">
    <div style="display: flex; flex-direction: column; gap: 44px;">
      <div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 16px;">FACES — CROWD PHOTO</div>
        <div class="rd-cols-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
          <figure style="margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0a0a0a;">
            <div style="height: 240px; background: #0a0a0a; display: flex; align-items: center; justify-content: center;"><img src="/images/redaction-crowd-before.jpeg" alt="Crowd photo before redaction" style="display: block; width: 100%; height: 100%; object-fit: cover;" /></div>
            <figcaption style="padding: 11px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.07);">Before</figcaption>
          </figure>
          <figure style="margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.16); background: #0a0a0a;">
            <div style="height: 240px; background: #0a0a0a; display: flex; align-items: center; justify-content: center;"><img src="/images/redaction-crowd-after.jpg" alt="Crowd photo after face redaction" style="display: block; width: 100%; height: 100%; object-fit: cover;" /></div>
            <figcaption style="padding: 11px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; border-top: 1px solid rgba(255,255,255,0.07);">After — faces blurred</figcaption>
          </figure>
        </div>
      </div>
      <div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 16px;">TEXT &amp; PII — ID DOCUMENT</div>
        <div class="rd-cols-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
          <figure style="margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0a0a0a;">
            <div style="height: 240px; background: #0a0a0a; display: flex; align-items: center; justify-content: center;"><img src="/images/redaction-id-before.jpeg" alt="ID document before redaction" style="display: block; max-width: 100%; max-height: 100%; object-fit: contain;" /></div>
            <figcaption style="padding: 11px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.07);">Before</figcaption>
          </figure>
          <figure style="margin: 0; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.16); background: #0a0a0a;">
            <div style="height: 240px; background: #0a0a0a; display: flex; align-items: center; justify-content: center;"><img src="/images/redaction-id-after.jpg" alt="ID document after PII redaction" style="display: block; max-width: 100%; max-height: 100%; object-fit: contain;" /></div>
            <figcaption style="padding: 11px 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; border-top: 1px solid rgba(255,255,255,0.07);">After — fields blurred</figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>

  <!-- USE CASES -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 60px 40px;">
    <div style="text-align: center; margin-bottom: 50px;"><h2 style="margin: 0; font-size: clamp(30px,3.8vw,46px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Where teams use it</h2></div>
    <div class="rd-cols-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ffffff; margin-bottom: 12px;">MARKETPLACES</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Listing photos</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Blur bystanders and plates in user-submitted product and vehicle listings.</p></div>
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ffffff; margin-bottom: 12px;">MAPPING</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Street imagery</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Anonymize faces and plates at scale for compliant geospatial datasets.</p></div>
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #ffffff; margin-bottom: 12px;">SUPPORT</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Shared screenshots</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Strip PII from tickets and attachments before they hit your data store.</p></div>
    </div>
  </section>

  <!-- CTA -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 80px 40px 120px; text-align: center;"><div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 680px; height: 360px; background: radial-gradient(ellipse at center, rgba(255,255,255,0.13), rgba(255,255,255,0) 64%); pointer-events: none;"></div><div style="position: relative;"><h2 style="margin: 0 auto; max-width: 620px; font-size: clamp(32px,4vw,52px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Ship images that protect your users.</h2><div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 34px; flex-wrap: wrap;"><a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 14px 26px; border-radius: 11px; text-decoration: none;">Start redacting</a><a href="/docs/redaction" style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 14px 26px; border-radius: 11px; text-decoration: none;">See the docs</a></div></div></section>

  <!-- FOOTER -->
  <footer style="position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.07); max-width: 1180px; margin: 0 auto; padding: 38px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px;"><div style="display: flex; align-items: center; gap: 11px;"><span style="width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(150deg,#1b1d24,#0c0d11); border: 1px solid rgba(255,255,255,0.12); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2.5px; padding: 5px;"><span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span><span style="border-radius: 1px; background: #ffffff;"></span><span style="border-radius: 1px; background: rgba(255,255,255,0.16);"></span><span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span></span><span style="font-size: 14px; color: rgba(255,255,255,0.5);">Visora — Image moderation &amp; redaction infrastructure.</span></div><div style="display: flex; align-items: center; gap: 26px;"><a href="/features/redaction" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Product</a><a href="/docs/redaction" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Docs</a><a href="/pricing" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Pricing</a><span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.3);">© 2026</span></div></footer>

</div>`;

export default function RedactionFeaturePage() {
  return (
    <>
      <MarketingHeader />
      <div dangerouslySetInnerHTML={{ __html: redactionHtml }} />
    </>
  );
}
