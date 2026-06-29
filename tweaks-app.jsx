/* Tweaks island — controls brand-level switches on a vanilla page.
   Mounts only the panel; writes CSS vars / data-attrs on <html>. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e6b23c",
  "density": "regular",
  "heroDark": 1
}/*EDITMODE-END*/;

const ACCENT_MAP = {
  "#e6b23c": "gold",
  "#28a564": "green",
  "#8fb4ff": "ice"
};

function applyAll(t){
  const root = document.documentElement;
  root.dataset.accent = ACCENT_MAP[t.accent] || "gold";
  root.dataset.density = t.density;
  root.style.setProperty("--scrim-op", t.heroDark);
}

function TweaksApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyAll(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t.accent}
        options={["#b07d12", "#1c8a4f", "#2b2a26"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Layout" />
      <TweakRadio label="Density" value={t.density}
        options={["regular", "compact"]}
        onChange={(v) => setTweak("density", v)} />
      <TweakSlider label="Hero darkness" value={t.heroDark}
        min={0.45} max={1} step={0.05}
        onChange={(v) => setTweak("heroDark", v)} />
    </TweaksPanel>
  );
}

/* apply current values immediately (EDITMODE block reflects saved state) */
applyAll(TWEAK_DEFAULTS);

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<TweaksApp />);
