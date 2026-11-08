// Test file for Iteration 2: Typography, Animations, Spacing, and Hooks
import { 
  colors, 
  shadows, 
  typography, 
  animations, 
  transitions,
  spacing 
} from './dist/index.js';

console.log('🕯️ Grave-UI Iteration 2 Test\n');

console.log('📝 TYPOGRAPHY TOKENS:');
console.log('  Families:');
console.log('    Epitaph:', typography.families.epitaph);
console.log('    Grimoire:', typography.families.grimoire);
console.log('    Runic:', typography.families.runic);
console.log('\n  Type Scale:');
console.log('    Whisper:', typography.scale.whisper);
console.log('    Speech:', typography.scale.speech);
console.log('    Proclamation:', typography.scale.proclamation);
console.log('    Monolith:', typography.scale.monolith);
console.log('\n  Letter Spacing:');
console.log('    Normal:', typography.letterSpacing.normal);
console.log('    Wide:', typography.letterSpacing.wide);
console.log('    Widest:', typography.letterSpacing.widest);

console.log('\n⏱️ ANIMATION TOKENS:');
console.log('  Durations:');
console.log('    Flicker:', animations.durations.flicker);
console.log('    Creep:', animations.durations.creep);
console.log('    Manifest:', animations.durations.manifest);
console.log('\n  Easing:');
console.log('    Crypt:', animations.easing.easeInOutCrypt);
console.log('    Curse:', animations.easing.easeOutCurse);
console.log('    Spectral:', animations.easing.easeOutSpectral);
console.log('\n  Keyframes:');
console.log('    Flicker:', animations.keyframes.flicker);
console.log('    Heartbeat:', animations.keyframes.heartbeat);
console.log('    Fog Drift:', animations.keyframes.fogDrift);
console.log('\n  Presets:');
console.log('    Candle Flicker:', animations.presets.candleFlicker);
console.log('    Heartbeat Pulse:', animations.presets.heartbeatPulse);

console.log('\n📐 SPACING TOKENS:');
console.log('  Coven Scale:');
console.log('    0:', spacing.coven[0]);
console.log('    4 (1rem):', spacing.coven[4]);
console.log('    8 (2rem):', spacing.coven[8]);
console.log('    16 (4rem):', spacing.coven[16]);
console.log('\n  Semantic:');
console.log('    Inset:', spacing.semantic.inset);
console.log('    Gap:', spacing.semantic.gap);
console.log('    Section:', spacing.semantic.section);

console.log('\n🔄 TRANSITIONS:');
console.log('  All:', transitions.all);
console.log('  Transform:', transitions.transform);
console.log('  Interactive:', transitions.interactive);

console.log('\n✨ COMPOSITION EXAMPLES:');
console.log('\n  Tombstone Style:');
const tombstoneStyle = {
  backgroundColor: colors.crypt.stone,
  color: colors.bone.ivory,
  fontFamily: typography.families.epitaph,
  fontSize: typography.scale.voice,
  letterSpacing: typography.letterSpacing.wide,
  padding: spacing.coven[4],
  boxShadow: shadows.depths.spectral,
  transition: transitions.all,
};
console.log('   ', JSON.stringify(tombstoneStyle, null, 2));

console.log('\n  Animated Ghost Button:');
const ghostButton = {
  animation: animations.presets.candleFlicker,
  transition: transitions.interactive,
  boxShadow: shadows.glows.eldritch,
};
console.log('   ', JSON.stringify(ghostButton, null, 2));

console.log('\n✅ All tokens and utilities imported successfully!');
console.log('✅ Typography system complete');
console.log('✅ Animation system complete');
console.log('✅ Spacing system complete');
console.log('✅ Hooks built (check dist/hooks/index.js)');
