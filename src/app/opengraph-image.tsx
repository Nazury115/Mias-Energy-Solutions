import { ImageResponse } from "next/og";

export const alt = "Mias Energy Solutions: water, electrical and renewable energy services in Lusaka, Zambia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share preview built from brand colours and type only, so it can't be mistaken for a photo of Mias work.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#102d4a", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <svg width="54" height="84" viewBox="0 0 54 84"><path d="M34 0 L2 48 H24 L16 84 L52 32 H30 Z" fill="#fbd338" /></svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 60, letterSpacing: -1 }}>MIAS</span>
          <span style={{ fontSize: 20, letterSpacing: 7, color: "#c5d9e9" }}>ENERGY SOLUTIONS</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 80, lineHeight: 1.05, letterSpacing: -3 }}>Water solutions.</span>
        <span style={{ fontSize: 80, lineHeight: 1.05, letterSpacing: -3, color: "#fbd338" }}>Energy for what’s next.</span>
      </div>
      <span style={{ fontSize: 26, color: "#d0dfeb" }}>Lusaka, Zambia · Water · Electrical · Renewable energy</span>
    </div>,
    size,
  );
}
