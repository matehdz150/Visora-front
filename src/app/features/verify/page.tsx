import type { Metadata } from "next";
import { MarketingHeader } from "@/components/MarketingHeader";

export const metadata: Metadata = {
  title: "Verify API | Visora",
  description: "Visora checks an identity document against a selfie — document authenticity, face match, and selfie quality — and returns one decision: verified, review, or rejected.",
};

const verifyHtml = String.raw`<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #050505; }
  body { font-family: 'Sora', sans-serif; color: #fff; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::selection { background: rgba(255,255,255,0.22); }
  ::-webkit-scrollbar { width: 9px; }
  ::-webkit-scrollbar-track { background: #050505; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.09); border-radius: 6px; }
  @keyframes vfFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes vfGlow { 0%,100% { opacity: 0.5; transform: translate(-50%,-50%) scale(0.96); } 50% { opacity: 0.9; transform: translate(-50%,-50%) scale(1.08); } }
  @keyframes vfPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
  .vf-root > nav { display: none !important; }
  @media (max-width: 900px) { .vf-nav-links { display: none !important; } }
  @media (max-width: 860px) {
    .vf-root > nav, .vf-root > section, .vf-root > footer { padding-left: 18px !important; padding-right: 18px !important; }
    .vf-cols-3, .vf-cols-2 { grid-template-columns: 1fr !important; }
  }
</style><div class="vf-root" style="position: relative; width: 100%; min-height: 100vh; background: #050505; overflow: hidden;">

  <!-- NAV (hidden; MarketingHeader provides the real one) -->
  <nav><a href="/">Visora</a></nav>

  <!-- HERO -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 150px 40px 90px; display: flex; flex-direction: column; align-items: center; text-align: center;">
    <div style="position: absolute; top: 70px; left: 50%; transform: translateX(-50%); width: 760px; height: 520px; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 72%); pointer-events: none;"></div>

    <div style="position: relative; z-index: 1; width: 280px; height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px;">
      <div style="position: absolute; top: 52%; left: 50%; width: 280px; height: 220px; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(ellipse at center, rgba(126,224,168,0.18), rgba(126,224,168,0) 62%); filter: blur(18px); pointer-events: none; animation: vfGlow 6s ease-in-out infinite;"></div>
      <div style="position: relative; animation: vfFloat 8s ease-in-out infinite;">
        <div style="width: 168px; height: 116px; border-radius: 16px; background: linear-gradient(150deg,#1c1d24,#0b0c10); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 34px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12); display: flex; align-items: center; gap: 14px; padding: 0 20px;">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: radial-gradient(circle at 38% 30%, #f4f5ff 0%, #cfd3ec 13%, #555873 46%, #181922 78%, #0c0d12 100%); box-shadow: inset 0 -5px 12px rgba(0,0,0,0.5), inset 0 3px 8px rgba(255,255,255,0.2); flex-shrink: 0;"></div>
          <div style="display: flex; flex-direction: column; gap: 7px; flex: 1;">
            <span style="height: 7px; width: 80%; border-radius: 3px; background: rgba(255,255,255,0.5);"></span>
            <span style="height: 6px; width: 60%; border-radius: 3px; background: rgba(255,255,255,0.22);"></span>
            <span style="height: 6px; width: 70%; border-radius: 3px; background: rgba(255,255,255,0.22);"></span>
          </div>
        </div>
        <div style="position: absolute; right: -16px; bottom: -16px; width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(150deg,#7ee0a8,#3fae74); box-shadow: 0 12px 30px rgba(126,224,168,0.45); display: flex; align-items: center; justify-content: center; animation: vfPop 0.6s ease-out 0.4s both;">
          <span style="display: block; width: 16px; height: 9px; border-left: 3px solid #04150c; border-bottom: 3px solid #04150c; transform: rotate(-45deg) translateY(-2px);"></span>
        </div>
      </div>
    </div>

    <div style="position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; padding: 5px 13px; border-radius: 20px; background: rgba(126,224,168,0.1); border: 1px solid rgba(126,224,168,0.3);">
      <span style="width: 6px; height: 6px; border-radius: 50%; background: #7ee0a8; box-shadow: 0 0 7px 1px rgba(126,224,168,0.8);"></span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.6);">VERIFY API</span>
    </div>

    <h1 style="position: relative; z-index: 1; margin: 0; font-size: clamp(44px, 6.5vw, 82px); line-height: 1.0; font-weight: 600; letter-spacing: -0.045em;">Is it really them?<br><span style="color: #ffffff;">Find out in one call.</span></h1>
    <p style="position: relative; z-index: 1; margin: 26px auto 0; max-width: 520px; font-size: 18px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">Send an ID and a selfie. Visora checks the document is real and unexpired, matches the face, and screens the selfie — then returns one clear decision.</p>
    <div style="position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; margin-top: 34px; flex-wrap: wrap; justify-content: center;">
      <a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 13px 24px; border-radius: 11px; text-decoration: none;">Start verifying</a>
      <a href="/docs/verify" style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 13px 22px; border-radius: 11px; text-decoration: none;">Read the docs</a>
    </div>
  </section>

  <!-- THREE CHECKS -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 70px 40px;">
    <h2 style="margin: 0; font-size: clamp(30px,3.6vw,44px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Three checks, one decision</h2>
    <div class="vf-cols-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 36px;">
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">01</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">Document authenticity</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">OCR reads the ID, extracts its fields, and confirms it is a real, unexpired document.</p></div>
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">02</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">Face match</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">The selfie is compared against the document portrait and scored from 0 to 100.</p></div>
      <div><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 14px;">03</div><h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 600; letter-spacing: -0.02em;">Selfie quality</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Anti-spoof signals: a single, clear, well-lit face with eyes open and no sunglasses.</p></div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 70px 40px;">
    <h2 style="margin: 0 0 48px; font-size: clamp(30px,3.6vw,44px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Document and selfie in, decision out</h2>
    <div class="vf-cols-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start;">
      <div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">1</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Send two images</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">POST a document and a selfie to /verify — multipart, or two existing image keys.</p></div></div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">2</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Three checks run</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Document OCR, face comparison, and selfie screening happen in a single request.</p></div></div>
        <div style="display: flex; gap: 16px; align-items: baseline; padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.12);"><span style="flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4);">3</span><div><h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Get one decision</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">verified, review, or rejected — with the scores and reasons behind it.</p></div></div>
      </div>
      <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0a0a0a;">
        <div style="padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.07);"><span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4);">verify.sh</span></div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.85; padding: 20px 22px; color: rgba(255,255,255,0.5);"><div><span style="color: rgba(255,255,255,0.3);">$</span> <span style="color: rgba(255,255,255,0.85);">curl</span> -X POST https://api.visora.dev/verify \</div><div style="padding-left: 20px;">-H <span style="color: rgba(255,255,255,0.75);">"x-api-key: $VISORA_KEY"</span> \</div><div style="padding-left: 20px;">-F <span style="color: rgba(255,255,255,0.75);">document=@id.jpg</span> \</div><div style="padding-left: 20px;">-F <span style="color: rgba(255,255,255,0.75);">selfie=@selfie.jpg</span></div><div style="height: 16px;"></div><div style="color: rgba(255,255,255,0.3);">{</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"decision"</span>: <span style="color: #7ee0a8;">"verified"</span>,</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"confidence"</span>: <span style="color: rgba(255,255,255,0.85);">96</span>,</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"faceMatch"</span>: { "similarity": <span style="color: rgba(255,255,255,0.85);">96</span> },</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"document"</span>: { "type": <span style="color: rgba(255,255,255,0.75);">"DRIVER LICENSE"</span>, "expired": <span style="color: rgba(255,255,255,0.85);">false</span> },</div><div style="padding-left: 20px;"><span style="color: rgba(255,255,255,0.55);">"reasons"</span>: []</div><div style="color: rgba(255,255,255,0.3);">}</div></div>
      </div>
    </div>
  </section>

  <!-- DECISIONS -->
  <section style="position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 10px 40px 70px;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 22px;">EVERY CHECK ENDS IN ONE OF THREE</div>
    <div class="vf-cols-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
      <div style="padding: 24px; border-radius: 16px; background: rgba(126,224,168,0.06); border: 1px solid rgba(126,224,168,0.28);"><div style="display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #7ee0a8; margin-bottom: 10px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #7ee0a8;"></span>Verified</div><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">Strong face match, a valid document, and a clean selfie. Let the user through automatically.</p></div>
      <div style="padding: 24px; border-radius: 16px; background: rgba(232,201,138,0.06); border: 1px solid rgba(232,201,138,0.28);"><div style="display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #e8c98a; margin-bottom: 10px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #e8c98a;"></span>Review</div><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">A borderline match or a low-quality selfie. Route to a human queue with the reasons attached.</p></div>
      <div style="padding: 24px; border-radius: 16px; background: rgba(255,155,155,0.06); border: 1px solid rgba(255,155,155,0.28);"><div style="display: inline-flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #ff9b9b; margin-bottom: 10px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ff9b9b;"></span>Rejected</div><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.55); font-weight: 300;">No document, no face, an expired ID, or a match below your reject cutoff. Block the attempt.</p></div>
    </div>
  </section>

  <!-- USE CASES -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 50px 40px;">
    <div style="text-align: center; margin-bottom: 50px;"><h2 style="margin: 0; font-size: clamp(30px,3.8vw,46px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Where teams use it</h2></div>
    <div class="vf-cols-3" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #7ee0a8; margin-bottom: 12px;">FINTECH</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">KYC onboarding</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Confirm new account holders are who they claim before opening an account.</p></div>
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #7ee0a8; margin-bottom: 12px;">MARKETPLACES</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Seller verification</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Vet sellers, hosts, and drivers with a quick document-plus-selfie check.</p></div>
      <div style="padding: 26px; border-radius: 16px; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.08);"><div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #7ee0a8; margin-bottom: 12px;">AGE-GATED</div><h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; letter-spacing: -0.01em;">Age assurance</h3><p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.5); font-weight: 300;">Check a real, unexpired ID before granting access to restricted content.</p></div>
    </div>
  </section>

  <!-- CTA -->
  <section style="position: relative; z-index: 1; max-width: 1180px; margin: 0 auto; padding: 60px 40px 120px; text-align: center;"><div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 680px; height: 360px; background: radial-gradient(ellipse at center, rgba(126,224,168,0.12), rgba(126,224,168,0) 64%); pointer-events: none;"></div><div style="position: relative;"><h2 style="margin: 0 auto; max-width: 620px; font-size: clamp(32px,4vw,52px); font-weight: 600; letter-spacing: -0.04em; line-height: 1.05;">Onboard real people, automatically.</h2><div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 34px; flex-wrap: wrap;"><a href="/dashboard" style="font-size: 15px; font-weight: 500; color: #050505; background: #fff; padding: 14px 26px; border-radius: 11px; text-decoration: none;">Start verifying</a><a href="/docs/verify" style="font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 14px 26px; border-radius: 11px; text-decoration: none;">See the docs</a></div></div></section>

  <!-- FOOTER -->
  <footer style="position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.07); max-width: 1180px; margin: 0 auto; padding: 38px 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 18px;"><div style="display: flex; align-items: center; gap: 11px;"><span style="width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(150deg,#1b1d24,#0c0d11); border: 1px solid rgba(255,255,255,0.12); display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2.5px; padding: 5px;"><span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span><span style="border-radius: 1px; background: #ffffff;"></span><span style="border-radius: 1px; background: rgba(255,255,255,0.16);"></span><span style="border-radius: 1px; background: rgba(255,255,255,0.22);"></span></span><span style="font-size: 14px; color: rgba(255,255,255,0.5);">Visora — Image moderation, redaction &amp; identity verification.</span></div><div style="display: flex; align-items: center; gap: 26px;"><a href="/features/verify" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Product</a><a href="/docs/verify" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Docs</a><a href="/pricing" style="font-size: 13px; color: rgba(255,255,255,0.45); text-decoration: none;">Pricing</a><span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.3);">© 2026</span></div></footer>

</div>`;

export default function VerifyFeaturePage() {
  return (
    <>
      <MarketingHeader />
      <div dangerouslySetInnerHTML={{ __html: verifyHtml }} />
    </>
  );
}
