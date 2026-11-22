import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

// Every docs page loads only when it is opened. Many of them show 3D components,
// so importing them up front would put three.js on the home page's first load.
const IntroductionPage = lazy(() => import('../pages/docs/IntroductionPage').then((m) => ({ default: m.IntroductionPage })));
const InstallationPage = lazy(() => import('../pages/docs/InstallationPage').then((m) => ({ default: m.InstallationPage })));
const TokensShowcase = lazy(() => import('../pages/docs/TokensShowcase').then((m) => ({ default: m.TokensShowcase })));

// Component Docs
const TombstoneDoc = lazy(() => import('../pages/docs/TombstoneDoc').then((m) => ({ default: m.TombstoneDoc })));
const ExcavationDoc = lazy(() => import('../pages/docs/ExcavationDoc').then((m) => ({ default: m.ExcavationDoc })));
const BoneOssuaryDoc = lazy(() => import('../pages/docs/BoneOssuaryDoc').then((m) => ({ default: m.BoneOssuaryDoc })));
const MausoleumDrawerDoc = lazy(() => import('../pages/docs/MausoleumDrawerDoc').then((m) => ({ default: m.MausoleumDrawerDoc })));
const CoffinAccordionDoc = lazy(() => import('../pages/docs/CoffinAccordionDoc').then((m) => ({ default: m.CoffinAccordionDoc })));
const CauldronDoc = lazy(() => import('../pages/docs/CauldronDoc').then((m) => ({ default: m.CauldronDoc })));
const RunicButtonDoc = lazy(() => import('../pages/docs/RunicButtonDoc').then((m) => ({ default: m.RunicButtonDoc })));
const BloodVialDoc = lazy(() => import('../pages/docs/BloodVialDoc').then((m) => ({ default: m.BloodVialDoc })));
const LunarPhaseDoc = lazy(() => import('../pages/docs/LunarPhaseDoc').then((m) => ({ default: m.LunarPhaseDoc })));
const ChickenLegDoc = lazy(() => import('../pages/docs/ChickenLegDoc').then((m) => ({ default: m.ChickenLegDoc })));
const CobwebDoc = lazy(() => import('../pages/docs/CobwebDoc').then((m) => ({ default: m.CobwebDoc })));
const HorrorCursorDoc = lazy(() => import('../pages/docs/HorrorCursorDoc').then((m) => ({ default: m.HorrorCursorDoc })));
const HauntedKeyboardDoc = lazy(() => import('../pages/docs/HauntedKeyboardDoc').then((m) => ({ default: m.HauntedKeyboardDoc })));
const SoundLibraryDoc = lazy(() => import('../pages/docs/SoundLibraryDoc').then((m) => ({ default: m.SoundLibraryDoc })));
const HorrorBackgroundDoc = lazy(() => import('../pages/docs/HorrorBackgroundDoc').then((m) => ({ default: m.HorrorBackgroundDoc })));
const SoundTriggerDoc = lazy(() => import('../pages/docs/SoundTriggerDoc').then((m) => ({ default: m.SoundTriggerDoc })));
const AsciiDoc = lazy(() => import('../pages/docs/AsciiDoc').then((m) => ({ default: m.AsciiDoc })));
const SurveillanceCamDoc = lazy(() => import('../pages/docs/SurveillanceCamDoc').then((m) => ({ default: m.SurveillanceCamDoc })));
const VoiceDoc = lazy(() => import('../pages/docs/VoiceDoc').then((m) => ({ default: m.VoiceDoc })));
const ScribbleDoc = lazy(() => import('../pages/docs/ScribbleDoc').then((m) => ({ default: m.ScribbleDoc })));
const DoodleDoc = lazy(() => import('../pages/docs/DoodleDoc').then((m) => ({ default: m.DoodleDoc })));
const DiaryDoc = lazy(() => import('../pages/docs/DiaryDoc').then((m) => ({ default: m.DiaryDoc })));
const GhostRunDoc = lazy(() => import('../pages/docs/GhostRunDoc').then((m) => ({ default: m.GhostRunDoc })));
const BitingFrameDoc = lazy(() => import('../pages/docs/BitingFrameDoc').then((m) => ({ default: m.BitingFrameDoc })));
const BroomProgressDoc = lazy(() => import('../pages/docs/BroomProgressDoc').then((m) => ({ default: m.BroomProgressDoc })));
const HauntedScrollbarDoc = lazy(() => import('../pages/docs/HauntedScrollbarDoc').then((m) => ({ default: m.HauntedScrollbarDoc })));
const GrimoireDoc = lazy(() => import('../pages/docs/GrimoireDoc').then((m) => ({ default: m.GrimoireDoc })));
const RiteDocRoute = lazy(() => import('../pages/docs/grimoire/RiteDocRoute').then((m) => ({ default: m.RiteDocRoute })));
const BestiaryDoc = lazy(() => import('../pages/docs/BestiaryDoc').then((m) => ({ default: m.BestiaryDoc })));
const BestiaryCharacterDoc = lazy(() => import('../pages/docs/BestiaryCharacterDoc').then((m) => ({ default: m.BestiaryCharacterDoc })));
const ButtonDoc = lazy(() => import('../pages/docs/ButtonDoc').then((m) => ({ default: m.ButtonDoc })));
const CardDoc = lazy(() => import('../pages/docs/CardDoc').then((m) => ({ default: m.CardDoc })));
const BadgeDoc = lazy(() => import('../pages/docs/BadgeDoc').then((m) => ({ default: m.BadgeDoc })));

/**
 * All documentation-site routes for the Grave-UI showcase, as a fragment of
 * `<Route>` elements that render inside the `DocsLayout` route in {@link App}.
 * `DocsLayout` wraps its outlet in `Suspense`, so each page shows once its code arrives.
 *
 * Kept in a dedicated module so route registration stays decoupled from the
 * app shell — adding a new component doc is a single edit here.
 *
 * NOTE: this is a plain function, not a component. React Router's `<Routes>`
 * inspects its direct children, so the elements must be inlined via
 * `{docsRoutes()}` rather than rendered as `<DocsRoutes />`.
 */
export function docsRoutes() {
  return (
    <>
      <Route path="docs" element={<Navigate to="/docs/introduction" replace />} />
      <Route path="docs/introduction" element={<IntroductionPage />} />
      <Route path="docs/installation" element={<InstallationPage />} />
      <Route path="docs/tokens" element={<TokensShowcase />} />

      {/* Primitives */}
      <Route path="docs/components/button" element={<ButtonDoc />} />
      <Route path="docs/components/card" element={<CardDoc />} />
      <Route path="docs/components/badge" element={<BadgeDoc />} />

      {/* The Crypt */}
      <Route path="docs/components/tombstone" element={<TombstoneDoc />} />
      <Route path="docs/components/excavation" element={<ExcavationDoc />} />
      <Route path="docs/components/ossuary" element={<BoneOssuaryDoc />} />
      <Route path="docs/components/mausoleum" element={<MausoleumDrawerDoc />} />
      <Route path="docs/components/coffin-accordion" element={<CoffinAccordionDoc />} />

      {/* The Coven */}
      <Route path="docs/components/cauldron" element={<CauldronDoc />} />
      <Route path="docs/components/runic-button" element={<RunicButtonDoc />} />

      {/* The Sanguine */}
      <Route path="docs/components/blood-vial" element={<BloodVialDoc />} />

      {/* The Lycan */}
      <Route path="docs/components/lunar-phase" element={<LunarPhaseDoc />} />

      {/* The Slavic */}
      <Route path="docs/components/chicken-legs" element={<ChickenLegDoc />} />

      {/* The Arachnid */}
      <Route path="docs/components/cobweb" element={<CobwebDoc />} />

      {/* The Effects */}
      <Route path="docs/components/horror-cursor" element={<HorrorCursorDoc />} />
      <Route path="docs/components/haunted-keyboard" element={<HauntedKeyboardDoc />} />
      <Route path="docs/components/sound-library" element={<SoundLibraryDoc />} />
      <Route path="docs/components/horror-background" element={<HorrorBackgroundDoc />} />
      <Route path="docs/components/sound-trigger" element={<SoundTriggerDoc />} />
      <Route path="docs/components/ascii" element={<AsciiDoc />} />
      <Route path="docs/components/surveillance-cam" element={<SurveillanceCamDoc />} />
      <Route path="docs/components/voice" element={<VoiceDoc />} />
      <Route path="docs/components/scribble" element={<ScribbleDoc />} />
      <Route path="docs/components/doodle" element={<DoodleDoc />} />
      <Route path="docs/components/diary" element={<DiaryDoc />} />
      <Route path="docs/components/ghost-run" element={<GhostRunDoc />} />
      <Route path="docs/components/biting-frame" element={<BitingFrameDoc />} />
      <Route path="docs/components/broom-progress" element={<BroomProgressDoc />} />
      <Route path="docs/components/haunted-scrollbar" element={<HauntedScrollbarDoc />} />

      {/* The Grimoire */}
      <Route path="docs/components/grimoire" element={<GrimoireDoc />} />
      <Route path="docs/components/grimoire/:riteId" element={<RiteDocRoute />} />

      {/* The Bestiary */}
      <Route path="docs/components/bestiary" element={<BestiaryDoc />} />
      <Route path="docs/components/bestiary/:characterId" element={<BestiaryCharacterDoc />} />
    </>
  );
}
