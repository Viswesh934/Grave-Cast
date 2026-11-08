// Quick test to verify tokens are importable
import { colors, shadows, semanticColors } from './dist/index.js';

console.log('🕯️ Grave-UI Token System Test\n');

console.log('📦 Colors:');
console.log('  Crypt Stone:', colors.crypt.stone);
console.log('  Sanguine Blood:', colors.sanguine.blood);
console.log('  Witchcraft Fire:', colors.witchcraft.witchfire);
console.log('  Bone Ivory:', colors.bone.ivory);
console.log('  Abyss Black:', colors.abyss.black);

console.log('\n🌫️ Shadows:');
console.log('  Ethereal:', shadows.depths.ethereal);
console.log('  Spectral:', shadows.depths.spectral);
console.log('  Eldritch Glow:', shadows.glows.eldritch);

console.log('\n🎨 Semantic Colors:');
console.log('  Primary:', semanticColors.primary);
console.log('  Danger:', semanticColors.danger);
console.log('  Surface:', semanticColors.surface);

console.log('\n✅ All tokens imported successfully!');
