import type { Metadata } from "next";
import { MarketingHeader } from "@/components/MarketingHeader";

export const metadata: Metadata = {
  title: "Webhooks | Visora",
  description: "Receive real-time notifications about every moderation with Visora webhooks.",
};

const webhooksHtml = String.raw`<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #050505; }
  body { font-family: 'Sora', sans-serif; color: #fff; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::selection { background: rgba(126,155,255,0.28); }
  ::-webkit-scrollbar { width: 9px; }
  ::-webkit-scrollbar-track { background: #050505; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 6px; }
  @keyframes whFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
  @keyframes whSpin { 0% { transform: rotateX(-22deg) rotateY(-32deg); } 50% { transform: rotateX(-22deg) rotateY(-46deg); } 100% { transform: rotateX(-22deg) rotateY(-32deg); } }
  @keyframes whPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
  @keyframes whGlow { 0%,100% { opacity: 0.5; transform: translate(-50%,-50%) scale(0.95); } 50% { opacity: 0.95; transform: translate(-50%,-50%) scale(1.08); } }
  @keyframes whTravel { 0% { offset-distance: 0%; opacity: 0; } 14% { opacity: 1; } 86% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
  @keyframes whGridFloat { 0% { background-position: 0 0; } 100% { background-position: 0 -28px; } }

.wh-root > nav { display: none !important; }

@media (max-width: 900px) { .webhooks-nav-links { display: none !important; } }
@media (max-width: 860px) {
  .wh-root > nav, .wh-root > section, .wh-root > footer { padding-left: 18px !important; padding-right: 18px !important; }
  .wh-root > section [style*="grid-template-columns: 1fr 1fr"],
  .wh-root > section [style*="grid-template-columns: 0.85fr 1.15fr"],
  .wh-root > section [style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
}
@media (max-width: 520px) {
  .wh-root > nav, .wh-root > section, .wh-root > footer { padding-left: 15px !important; padding-right: 15px !important; }
}
</style><div class="wh-root" style="position: relative; width: 100%; min-height: 100vh; background: #050505; overflow: hidden;">

  <!-- NAV -->
  <nav style="position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 18px 40px; background: rgba(5,5,5,0.72); border-bottom: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
    <a href="/" style="display: flex; align-items: center; gap: 11px; text-decoration: none;">
      <span style="width: 26px; height: 26px; border-radius: 7px; background: linear-gradient(150deg,#1b1d24,#0c0d11); border: 1px solid rgba(255,255,255,0.12); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 3px; padding: 6px;">
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.22);"></span>
        <span style="border-radius: 1.5px; background: #aebfff; box-shadow: 0 0 7px 1px rgba(126,155,255,0.8);"></span>
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.16);"></span>
        <span style="border-radius: 1.5px; background: rgba(255,255,255,0.22);"></span>
      </span>
      <span style="font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: #fff;">Visora</span>
    </a>
    <div class="webhooks-nav-links" style="display: flex; align-items: center; gap: 34px;">
      <a href="/features/webhooks" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;" style-hover="color: #fff;">Features</a>
      <a href="/docs" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;" style-hover="color: #fff;">Documentation</a>
      <a href="/pricing" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;" style-hover="color: #fff;">Pricing</a>
      <a href="/contact" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;" style-hover="color: #fff;">Help</a>
    </div>
    <div style="display: flex; align-items: center; gap: 18px;">
      <a href="/login" style="font-size: 14px; color: rgba(255,255,255,0.7); text-decoration: none;" style-hover="color: #fff;">Log In</a>
      <a href="/register" style="font-size: 14px; font-weight: 500; color: #050505; background: #fff; padding: 9px 18px; border-radius: 9px; text-decoration: none;" style-hover="transform: translateY(-1px);">Start Free</a>
    </div>
  </nav>

  <!-- HERO (centered + animated 3D object) -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 150px 40px 90px; display: flex; flex-direction: column; align-items: center; text-align: center;">
    <!-- faint grid backdrop -->
    <div style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); width: 760px; height: 520px; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); pointer-events: none;"></div>

    <div style="position: relative; width: 260px; height: 240px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
      
<div style="position: relative; width: 100%; height: 100%; perspective: 900px; perspective-origin: 50% 42%; transform-style: preserve-3d;">
  <div style="position: absolute; top: 52%; left: 50%; width: 360px; height: 320px; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(ellipse at center, rgba(126,155,255,0.22), rgba(126,155,255,0) 62%); filter: blur(14px); pointer-events: none; animation: whGlow 5s ease-in-out infinite;"></div>
  <div style="position: absolute; inset: 0; transform-style: preserve-3d; animation: whFloat 7s ease-in-out infinite;">
    <div style="position: absolute; top: 50%; left: 50%; transform-style: preserve-3d; transform: rotateX(-22deg) rotateY(-32deg); animation: whSpin 12s ease-in-out infinite;">
      <div style="position: absolute; top: 50%; left: 50%; width: 168px; height: 168px; margin-top: -84px; margin-left: -84px; border-radius: 42px; background: linear-gradient(155deg,#1d1f27 0%,#0a0b0e 82%); border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 50px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08); transform-style: preserve-3d;">
        <div style="position: absolute; top: 50%; left: 50%; width: 0; height: 0; transform-style: preserve-3d;">
          <div style="position: absolute; top: 50%; left: 50%; height: 2px; width: 64px; margin-top: -1px; transform-origin: 0 50%; transform: translate3d(0,0,24px) rotate(-31deg); background: linear-gradient(90deg, rgba(126,155,255,0.7), rgba(126,155,255,0.05));"></div>
          <div style="position: absolute; top: 50%; left: 50%; height: 2px; width: 64px; margin-top: -1px; transform-origin: 0 50%; transform: translate3d(0,0,24px) rotate(207deg); background: linear-gradient(90deg, rgba(126,155,255,0.7), rgba(126,155,255,0.05));"></div>
          <div style="position: absolute; top: 50%; left: 50%; height: 2px; width: 70px; margin-top: -1px; transform-origin: 0 50%; transform: translate3d(0,0,24px) rotate(34deg); background: linear-gradient(90deg, rgba(126,155,255,0.7), rgba(126,155,255,0.05));"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; margin-top: -15px; margin-left: -15px; border-radius: 9px; background: linear-gradient(155deg,#2a2d36,#13141a); border: 1px solid rgba(255,255,255,0.14); transform: translate3d(56px, -34px, 18px); box-shadow: inset 0 1px 2px rgba(255,255,255,0.18), 0 6px 14px rgba(0,0,0,0.5);"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; margin-top: -15px; margin-left: -15px; border-radius: 9px; background: linear-gradient(155deg,#2a2d36,#13141a); border: 1px solid rgba(255,255,255,0.14); transform: translate3d(-58px, 30px, 18px); box-shadow: inset 0 1px 2px rgba(255,255,255,0.18), 0 6px 14px rgba(0,0,0,0.5);"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; margin-top: -15px; margin-left: -15px; border-radius: 9px; background: linear-gradient(155deg,#2a2d36,#13141a); border: 1px solid rgba(255,255,255,0.14); transform: translate3d(60px, 40px, 18px); box-shadow: inset 0 1px 2px rgba(255,255,255,0.18), 0 6px 14px rgba(0,0,0,0.5);"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; margin-top: -3.5px; margin-left: -3.5px; border-radius: 50%; background: #eef2ff; box-shadow: 0 0 10px 2px rgba(126,155,255,0.9); offset-path: path('M 0 0 L 56 -34'); animation: whTravel 2.4s ease-in-out 0s infinite;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; margin-top: -3.5px; margin-left: -3.5px; border-radius: 50%; background: #eef2ff; box-shadow: 0 0 10px 2px rgba(126,155,255,0.9); offset-path: path('M 0 0 L -58 30'); animation: whTravel 2.4s ease-in-out 0.8s infinite;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 7px; height: 7px; margin-top: -3.5px; margin-left: -3.5px; border-radius: 50%; background: #eef2ff; box-shadow: 0 0 10px 2px rgba(126,155,255,0.9); offset-path: path('M 0 0 L 60 40'); animation: whTravel 2.4s ease-in-out 1.6s infinite;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 54px; height: 54px; margin-top: -27px; margin-left: -27px; border-radius: 15px; background: radial-gradient(circle at 42% 34%, #eef2ff, #aebfff 62%, #6f86d6 100%); transform: translateZ(46px); box-shadow: 0 0 34px 8px rgba(126,155,255,0.6), inset 0 2px 4px rgba(255,255,255,0.6); animation: whPulse 3s ease-in-out infinite;"></div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>

    <h1 style="margin: 0; font-size: clamp(44px, 6.5vw, 82px); line-height: 1.0; font-weight: 600; letter-spacing: -0.045em;">Webhooks<br/>that work <span style="font-weight: 300; font-style: italic; color: rgba(255,255,255,0.7);">for you</span></h1>
    <p style="margin: 26px auto 0; max-width: 460px; font-size: 18px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">Receive real-time notifications about every moderation. Build automated workflows by listening to granular events.</p>
    <div style="display: flex; align-items: center; gap: 14px; margin-top: 34px;">
      <a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 13px 24px; border-radius: 11px; text-decoration: none;" style-hover="transform: translateY(-1px); box-shadow: 0 12px 34px rgba(255,255,255,0.18);">Add an endpoint</a>
      <a href="/docs#webhooks" style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 13px 24px; border-radius: 11px; text-decoration: none;" style-hover="background: rgba(255,255,255,0.08);">Read the docs</a>
    </div>
  </section>

  <!-- LISTEN TO EVENTS -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 70px 40px;">
    <div style="text-align: center; margin-bottom: 56px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px;">
        <span style="display: inline-grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2px; width: 15px; height: 15px;">
          <span style="border-radius: 2px; background: rgba(255,255,255,0.4);"></span>
          <span style="border-radius: 2px; background: #aebfff;"></span>
          <span style="border-radius: 2px; background: rgba(255,255,255,0.4);"></span>
          <span style="border-radius: 2px; background: rgba(255,255,255,0.4);"></span>
        </span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.06em; color: rgba(255,255,255,0.65);">Automation</span>
      </div>
      <h2 style="margin: 0; font-size: clamp(34px,4.4vw,56px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.04;">Listen to events<br/>in real-time</h2>
      <p style="margin: 20px auto 0; max-width: 480px; font-size: 17px; line-height: 1.55; color: rgba(255,255,255,0.5); font-weight: 300;">Get a JSON payload your app can act on whenever an image is moderated, flagged, or reviewed.</p>
    </div>

    <div style="display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: start;">
      <!-- event cards -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="padding: 22px 24px; border-radius: 16px; background: rgba(126,155,255,0.06); border: 1px solid rgba(126,155,255,0.35); box-shadow: 0 0 40px rgba(126,155,255,0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 13px;">
              <span style="width: 40px; height: 40px; border-radius: 11px; background: radial-gradient(circle at 40% 30%, rgba(126,155,255,0.25), rgba(255,255,255,0.02)); border: 1px solid rgba(126,155,255,0.3); display: flex; align-items: center; justify-content: center;">
                <span style="width: 16px; height: 13px; border-radius: 3px; border: 2px solid #aebfff;"></span>
              </span>
              <span style="font-size: 16px; font-weight: 600;">Image moderated</span>
            </div>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: #aebfff;">POST</span>
          </div>
          <p style="margin: 14px 0 0; font-size: 13.5px; line-height: 1.55; color: rgba(255,255,255,0.55); font-weight: 300;">Fires for every image scored, safe or not.</p>
        </div>
        <div style="padding: 22px 24px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; align-items: center; gap: 13px;">
            <span style="width: 40px; height: 40px; border-radius: 11px; background: linear-gradient(155deg,#23252c,#101116); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 15px; color: rgba(255,255,255,0.6);">⚑</span>
            </span>
            <span style="font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.85);">Flagged for review</span>
          </div>
        </div>
        <div style="padding: 22px 24px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; align-items: center; gap: 13px;">
            <span style="width: 40px; height: 40px; border-radius: 11px; background: linear-gradient(155deg,#23252c,#101116); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 15px; color: rgba(255,255,255,0.6);">⊘</span>
            </span>
            <span style="font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.85);">Auto-rejected</span>
          </div>
        </div>
      </div>

      <!-- payload -->
      <div style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0b0b0b; box-shadow: 0 30px 70px rgba(0,0,0,0.45);">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.018);">
          <span style="display: flex; gap: 7px;">
            <span style="width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,0.14);"></span>
            <span style="width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,0.14);"></span>
            <span style="width: 11px; height: 11px; border-radius: 50%; background: rgba(255,255,255,0.14);"></span>
          </span>
          <span style="width: 14px; height: 14px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);"></span>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13.5px; line-height: 1.95; padding: 22px 24px;">
          <div style="color: rgba(255,255,255,0.35);">{</div>
          <div style="padding-left: 18px; background: rgba(126,155,255,0.1); margin: 0 -24px; padding-right: 24px; padding-left: 42px; border-left: 2px solid #aebfff;"><span style="color: #8fa0d8;">"type"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"image.moderated"</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 18px;"><span style="color: #8fa0d8;">"created_at"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"2026-06-19T14:32:08Z"</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 18px;"><span style="color: #8fa0d8;">"data"</span><span style="color: rgba(255,255,255,0.4);">: {</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"moderation_id"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"mod_01KV9F2X3Q"</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"project"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"Marketplace"</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"safe"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #ff9b9b;">false</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"risk_score"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #aebfff;">92</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"category"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"violence"</span><span style="color: rgba(255,255,255,0.4);">,</span></div>
          <div style="padding-left: 36px;"><span style="color: #8fa0d8;">"action"</span><span style="color: rgba(255,255,255,0.4);">:</span> <span style="color: #c7d2ff;">"reject"</span></div>
          <div style="padding-left: 18px; color: rgba(255,255,255,0.4);">}</div>
          <div style="color: rgba(255,255,255,0.35);">}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- FULL VISIBILITY -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 80px 40px 40px;">
    <div style="text-align: center; margin-bottom: 50px;">
      <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px;">
        <span style="width: 14px; height: 14px; border-radius: 50%; border: 2px solid #aebfff; display: inline-flex; align-items: center; justify-content: center;"><span style="width: 5px; height: 5px; border-radius: 50%; background: #aebfff;"></span></span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.06em; color: rgba(255,255,255,0.65);">Observability</span>
      </div>
      <h2 style="margin: 0; font-size: clamp(34px,4.4vw,56px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.04;">Full visibility over<br/>your webhooks</h2>
      <p style="margin: 20px auto 0; max-width: 500px; font-size: 17px; line-height: 1.55; color: rgba(255,255,255,0.5); font-weight: 300;">Inspect every delivery — request payload, response body, attempt count — and replay any event on demand.</p>
    </div>

    <!-- dashboard mockup -->
    <div style="position: relative; border-radius: 20px 20px 0 0; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; background: linear-gradient(180deg,#0c0c0e,#0a0a0c); box-shadow: 0 -10px 80px rgba(126,155,255,0.06); overflow: hidden; max-width: 1040px; margin: 0 auto; padding: 30px 34px 60px;">
      <!-- webhook header -->
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 26px;">
        <span style="width: 48px; height: 48px; border-radius: 13px; background: radial-gradient(circle at 40% 30%, rgba(126,155,255,0.2), rgba(255,255,255,0.02)); border: 1px solid rgba(126,155,255,0.25); display: flex; align-items: center; justify-content: center;">
          <span style="display: flex; flex-direction: column; gap: 3px;">
            <span style="width: 18px; height: 3px; border-radius: 2px; background: #aebfff;"></span>
            <span style="width: 18px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.35);"></span>
          </span>
        </span>
        <div>
          <div style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 3px;">Webhook</div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #fff;">https://acme.app/api/visora/webhook</div>
        </div>
      </div>
      <!-- meta row -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px;">
        <div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px;">LISTENING FOR</div>
          <div style="font-size: 13.5px; color: rgba(255,255,255,0.85);">image.moderated</div>
        </div>
        <div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px;">STATUS</div>
          <span style="font-size: 12px; color: #7ee0a8; background: rgba(126,224,168,0.1); border: 1px solid rgba(126,224,168,0.25); padding: 3px 10px; border-radius: 20px;">Enabled</span>
        </div>
        <div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px;">CREATED</div>
          <div style="font-size: 13.5px; color: rgba(255,255,255,0.85);">2 mo ago</div>
        </div>
        <div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: rgba(255,255,255,0.35); margin-bottom: 8px;">SIGNING KEY</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.5); letter-spacing: 2px;">••••••••••</span>
            <span style="width: 13px; height: 11px; border-radius: 2px; border: 1.5px solid rgba(255,255,255,0.35);"></span>
          </div>
        </div>
      </div>
      <!-- events + detail -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
        <div>
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 14px;">Events</div>
          <div style="display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 12px; border-radius: 9px; background: rgba(255,255,255,0.04);">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.85);">moderation.rejected <span style="color: rgba(255,255,255,0.35);">1s</span></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #7ee0a8; background: rgba(126,224,168,0.12); padding: 2px 8px; border-radius: 5px;">200</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 12px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.6);">image.moderated <span style="color: rgba(255,255,255,0.3);">2h</span></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #ff9b9b; background: rgba(255,90,90,0.12); padding: 2px 8px; border-radius: 5px;">429</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 12px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.6);">moderation.flagged <span style="color: rgba(255,255,255,0.3);">5h</span></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #7ee0a8; background: rgba(126,224,168,0.12); padding: 2px 8px; border-radius: 5px;">200</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 11px 12px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.6);">review.decided <span style="color: rgba(255,255,255,0.3);">1d</span></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #7ee0a8; background: rgba(126,224,168,0.12); padding: 2px 8px; border-radius: 5px;">200</span>
            </div>
          </div>
        </div>
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <span style="font-size: 15px; font-weight: 600;">moderation.rejected</span>
            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); padding: 5px 11px; border-radius: 8px;">↻ Replay</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); margin-bottom: 5px;">ID</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.8);">msg_33QqoR0f4YnI2luYY</div>
            </div>
            <div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); margin-bottom: 5px;">TIMESTAMP</div>
              <div style="font-size: 13px; color: rgba(255,255,255,0.8);">Jun 19, 2026 — 01:03:57 AM</div>
            </div>
            <div style="display: flex; gap: 40px;">
              <div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); margin-bottom: 5px;">HTTP STATUS</div>
                <div style="font-size: 13px; color: #7ee0a8;">200 OK</div>
              </div>
              <div>
                <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.06em; color: rgba(255,255,255,0.35); margin-bottom: 5px;">ATTEMPTS</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.8);">1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- fade to bg -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 90px; background: linear-gradient(180deg, rgba(5,5,5,0), #050505); pointer-events: none;"></div>
    </div>
  </section>

  <!-- CTA -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 60px 40px 120px; text-align: center;">
    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 680px; height: 360px; background: radial-gradient(ellipse at center, rgba(126,155,255,0.12), rgba(126,155,255,0) 64%); pointer-events: none;"></div>
    <div style="position: relative;">
      <h2 style="margin: 0 auto; max-width: 620px; font-size: clamp(32px,4vw,52px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Start listening in minutes.</h2>
      <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 34px;">
        <a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 14px 26px; border-radius: 11px; text-decoration: none;" style-hover="transform: translateY(-1px); box-shadow: 0 14px 38px rgba(255,255,255,0.2);">Add an endpoint</a>
        <a href="/docs#webhooks" style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 14px 26px; border-radius: 11px; text-decoration: none;" style-hover="background: rgba(255,255,255,0.08);">View event reference</a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.07); max-width: 1180px; margin: 0 auto; padding: 38px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px;">
    <div style="display: flex; align-items: center; gap: 11px;">
      <span style="width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(150deg,#1b1d24,#0c0d11); border: 1px solid rgba(255,255,255,0.12); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2.5px; padding: 5px;">
        <span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span>
        <span style="border-radius: 1px; background: #aebfff;"></span>
        <span style="border-radius: 1px; background: rgba(255,255,255,0.16);"></span>
        <span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span>
      </span>
      <span style="font-size: 14px; color: rgba(255,255,255,0.5);">Visora — Image moderation infrastructure.</span>
    </div>
    <div style="display: flex; align-items: center; gap: 26px;">
      <a href="/features/webhooks" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;" style-hover="color:#fff;">Features</a>
      <a href="/docs" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;" style-hover="color:#fff;">Docs</a>
      <a href="/pricing" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;" style-hover="color:#fff;">Pricing</a>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.3);">© 2026</span>
    </div>
  </footer>

</div>`;

export default function WebhooksFeaturePage() {
  return (
    <>
      <MarketingHeader />
      <div dangerouslySetInnerHTML={{ __html: webhooksHtml }} />
    </>
  );
}
