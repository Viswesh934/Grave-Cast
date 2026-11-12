import { Route, Navigate } from 'react-router-dom';

import { IntroductionPage } from '../pages/docs/IntroductionPage';
import { InstallationPage } from '../pages/docs/InstallationPage';
import { TokensShowcase } from '../pages/docs/TokensShowcase';

// Component Docs
import { TombstoneDoc } from '../pages/docs/TombstoneDoc';
import { ExcavationDoc } from '../pages/docs/ExcavationDoc';
import { BoneOssuaryDoc } from '../pages/docs/BoneOssuaryDoc';
import { MausoleumDrawerDoc } from '../pages/docs/MausoleumDrawerDoc';
import { CoffinAccordionDoc } from '../pages/docs/CoffinAccordionDoc';
import { CauldronDoc } from '../pages/docs/CauldronDoc';
import { RunicButtonDoc } from '../pages/docs/RunicButtonDoc';
import { BloodVialDoc } from '../pages/docs/BloodVialDoc';
import { LunarPhaseDoc } from '../pages/docs/LunarPhaseDoc';
import { ChickenLegDoc } from '../pages/docs/ChickenLegDoc';
import { CobwebDoc } from '../pages/docs/CobwebDoc';
import { HorrorCursorDoc } from '../pages/docs/HorrorCursorDoc';
import { HauntedKeyboardDoc } from '../pages/docs/HauntedKeyboardDoc';
import { SoundLibraryDoc } from '../pages/docs/SoundLibraryDoc';
import { HorrorBackgroundDoc } from '../pages/docs/HorrorBackgroundDoc';
import { SoundTriggerDoc } from '../pages/docs/SoundTriggerDoc';
import { AsciiDoc } from '../pages/docs/AsciiDoc';
import { SurveillanceCamDoc } from '../pages/docs/SurveillanceCamDoc';
import { VoiceDoc } from '../pages/docs/VoiceDoc';
import { GrimoireDoc } from '../pages/docs/GrimoireDoc';
import { RiteDocRoute } from '../pages/docs/grimoire/RiteDocRoute';
import { BestiaryDoc } from '../pages/docs/BestiaryDoc';
import { BestiaryCharacterDoc } from '../pages/docs/BestiaryCharacterDoc';
import { ButtonDoc } from '../pages/docs/ButtonDoc';
import { CardDoc } from '../pages/docs/CardDoc';
import { BadgeDoc } from '../pages/docs/BadgeDoc';

/**
 * All documentation-site routes for the Grave-UI showcase, as a fragment of
 * `<Route>` elements that render inside the `DocsLayout` route in {@link App}.
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
      <Route index element={<Navigate to="/docs/introduction" replace />} />
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

      {/* The Grimoire */}
      <Route path="docs/components/grimoire" element={<GrimoireDoc />} />
      <Route path="docs/components/grimoire/:riteId" element={<RiteDocRoute />} />

      {/* The Bestiary */}
      <Route path="docs/components/bestiary" element={<BestiaryDoc />} />
      <Route path="docs/components/bestiary/:characterId" element={<BestiaryCharacterDoc />} />
    </>
  );
}
