import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DocsLayout } from './components/docs/DocsLayout';
import { IntroductionPage } from './pages/docs/IntroductionPage';
import { InstallationPage } from './pages/docs/InstallationPage';
import { TokensShowcase } from './pages/TokensShowcase';
import { HooksShowcase } from './pages/HooksShowcase';

// Component Docs
import { TombstoneDoc } from './pages/docs/TombstoneDoc';
import { ExcavationDoc } from './pages/docs/ExcavationDoc';
import { BoneOssuaryDoc } from './pages/docs/BoneOssuaryDoc';
import { MausoleumDrawerDoc } from './pages/docs/MausoleumDrawerDoc';
import { CoffinAccordionDoc } from './pages/docs/CoffinAccordionDoc';
import { CauldronDoc } from './pages/docs/CauldronDoc';
import { RunicButtonDoc } from './pages/docs/RunicButtonDoc';
import { BloodVialDoc } from './pages/docs/BloodVialDoc';
import { LunarPhaseDoc } from './pages/docs/LunarPhaseDoc';
import { ChickenLegDoc } from './pages/docs/ChickenLegDoc';
import { CobwebDoc } from './pages/docs/CobwebDoc';
import { ButtonDoc } from './pages/docs/ButtonDoc';
import { CardDoc } from './pages/docs/CardDoc';
import { BadgeDoc } from './pages/docs/BadgeDoc';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocsLayout />}>
          <Route index element={<Navigate to="/docs/introduction" replace />} />
          <Route path="docs" element={<Navigate to="/docs/introduction" replace />} />
          <Route path="docs/introduction" element={<IntroductionPage />} />
          <Route path="docs/installation" element={<InstallationPage />} />
          <Route path="docs/tokens" element={<TokensShowcase />} />
          <Route path="docs/audio" element={<HooksShowcase />} />

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

          {/* Legacy redirects */}
          <Route path="primitives" element={<Navigate to="/docs/components/button" replace />} />
          <Route path="crypt" element={<Navigate to="/docs/components/tombstone" replace />} />
          <Route path="tokens" element={<Navigate to="/docs/tokens" replace />} />
          <Route path="hooks" element={<Navigate to="/docs/audio" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
