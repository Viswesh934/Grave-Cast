/**
 * The painted witch: a filled, inked cartoon hag on her broom, in the same
 * drawing space as the line-art one (240 by 160), flying to the right. Our own
 * drawing in the classic style: sickly green skin, a hooked and warty nose, a
 * yellow eye, a crooked grin, a tall bent hat, a ragged black robe and hair
 * streaming behind her, and a wooden broom bound with straw.
 * @module components/coven/WitchOnBroom/PaintedWitch
 */

import { witchPaint } from './tokens';

/** The ink line that goes round every painted shape. */
const ink = { stroke: witchPaint.ink, strokeWidth: witchPaint.outline, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
/** Fine ink, for strands, knuckles and creases. */
const fine = { fill: 'none', stroke: witchPaint.ink, strokeWidth: witchPaint.fine, strokeLinecap: 'round' } as const;

/** The broom handle, from the bristles to the tip, as one curve. */
const HANDLE = 'M 54 104 C 100 98, 150 92, 208 83';

/**
 * The moon behind her, filled and softly glowing, for the painted look.
 */
export function PaintedMoon() {
  return (
    <g>
      <circle cx="178" cy="46" r="40" fill={witchPaint.moon} opacity={witchPaint.moonGlow} />
      <circle cx="178" cy="46" r="30" fill={witchPaint.moon} fillOpacity={witchPaint.moonFill} />
      {/* Craters, placed unevenly so they never read as a face */}
      <g fill={witchPaint.strawShade} opacity={witchPaint.shade}>
        <circle cx="169" cy="38" r="5" />
        <circle cx="190" cy="59" r="2.5" />
        <circle cx="160" cy="57" r="1.8" />
      </g>
    </g>
  );
}

/**
 * The witch herself. `flutterClass` is put on her robe and hair, so they snap
 * in the wind with the line-art witch's animation.
 */
export function PaintedWitch({ flutterClass }: { flutterClass: string }) {
  return (
    <g>
      {/* Robe and hair streaming behind her, under everything else */}
      <g className={flutterClass}>
        <path
          {...ink}
          fill={witchPaint.robe}
          d="M 134 64 C 120 66, 106 76, 96 90 L 82 104 L 97 100 L 86 118 L 103 108 L 98 130 L 113 112 L 121 134 L 128 109 L 133 96 Z"
        />
        <path fill={witchPaint.robeSheen} opacity={witchPaint.shade} d="M 128 70 C 116 76, 106 86, 100 96 L 110 92 C 116 84, 122 78, 130 74 Z" />
        <path
          {...ink}
          fill={witchPaint.robe}
          d="M 134 50 C 122 50, 110 54, 100 62 C 107 62, 105 66, 96 71 C 105 72, 110 70, 104 79 C 116 72, 125 67, 133 64 Z"
        />
        <g {...fine} stroke={witchPaint.robeSheen}>
          <path d="M 130 54 Q 118 57, 106 63" />
          <path d="M 131 59 Q 120 63, 110 72" />
        </g>
      </g>

      {/* The bristles, bound with twine */}
      <path
        {...ink}
        fill={witchPaint.straw}
        d="M 57 97 C 41 91, 23 85, 6 85 C 12 91, 10 97, 3 101 C 12 105, 8 111, 5 118 C 14 120, 15 126, 18 131 C 32 123, 46 115, 57 111 Z"
      />
      <path fill={witchPaint.strawShade} opacity={witchPaint.shade} d="M 57 104 C 44 108, 30 114, 16 124 C 22 124, 24 128, 18 131 C 32 123, 46 115, 57 111 Z" />
      <g {...fine} stroke={witchPaint.strawShade}>
        <path d="M 55 100 Q 34 93, 12 90" />
        <path d="M 55 103 Q 32 100, 9 101" />
        <path d="M 55 106 Q 32 108, 10 112" />
        <path d="M 55 108 Q 36 115, 16 122" />
      </g>
      <path d={HANDLE} fill="none" stroke={witchPaint.ink} strokeWidth={witchPaint.handleEdge} strokeLinecap="round" />
      <path d={HANDLE} fill="none" stroke={witchPaint.wood} strokeWidth={witchPaint.handle} strokeLinecap="round" />
      <path d="M 70 101 C 110 96, 160 89, 206 82" fill="none" stroke={witchPaint.woodShade} strokeWidth={witchPaint.fine} strokeLinecap="round" />
      <g {...ink} fill={witchPaint.twine}>
        <path d="M 54 96 L 57 96 L 60 112 L 57 112 Z" />
        <path d="M 60 95 L 63 95 L 66 111 L 63 111 Z" />
      </g>

      {/* Her skirt over the broom, and a pointed boot */}
      <path {...ink} fill={witchPaint.robe} d="M 119 97 C 132 96, 146 97, 155 103 C 153 112, 141 117, 125 115 C 121 110, 119 104, 119 97 Z" />
      <path {...ink} fill={witchPaint.robe} d="M 145 111 L 150 120 C 156 122, 163 120, 170 113 C 165 116, 158 116, 152 113 Z" />
      <path fill={witchPaint.robeSheen} d="M 150 117 C 155 118, 160 117, 165 115" stroke={witchPaint.robeSheen} strokeWidth={witchPaint.fine} />

      {/* Her body, leaning into the flight */}
      <path {...ink} fill={witchPaint.robe} d="M 123 100 C 123 86, 127 74, 135 66 C 141 63, 147 67, 147 74 C 145 84, 141 94, 139 100 Z" />
      <path fill={witchPaint.robeSheen} opacity={witchPaint.shade} d="M 140 70 C 143 72, 144 76, 143 80 C 141 88, 138 94, 136 99 L 132 99 C 135 90, 139 80, 140 70 Z" />

      {/* Her arm reaching to the broom, and her green hand round it */}
      <path {...ink} fill={witchPaint.robe} d="M 137 67 C 146 71, 154 79, 160 85 L 162 86 L 157 93 L 154 91 C 148 85, 141 79, 135 76 Z" />
      <ellipse {...ink} cx="164" cy="89" rx="5" ry="3.8" fill={witchPaint.skin} />
      <g {...fine}>
        <path d="M 162 86.5 Q 163 89, 162 91.5" />
        <path d="M 165 86 Q 166 89, 165 92" />
      </g>

      {/* Her face: hooked warty nose, yellow eye, jutting chin, crooked grin */}
      <path
        {...ink}
        fill={witchPaint.skin}
        d="M 135 50 L 147 49 C 149 52, 151 54, 153 56 C 157 58, 161 61, 159 63.5 C 156.5 64.5, 153.5 62.5, 151 61.5 C 151 63, 151 64, 150 65 C 152.5 66, 155 68.5, 153.5 71.5 C 150 73.5, 145 72.5, 141 70.5 C 139 69.5, 137 67.5, 136 65 C 134 61, 133 55, 135 50 Z"
      />
      <path fill={witchPaint.skinShade} opacity={witchPaint.shade} d="M 136 60 C 137 65, 140 69, 145 71 C 141 71, 138 68, 136.5 65 C 135.5 63, 135.5 61, 136 60 Z" />
      <circle cx="155.5" cy="58.2" r="1.15" fill={witchPaint.wart} stroke={witchPaint.ink} strokeWidth={witchPaint.fine} />
      <circle cx="152" cy="71" r="0.85" fill={witchPaint.wart} stroke={witchPaint.ink} strokeWidth={witchPaint.fine} />
      <path {...fine} d="M 138 57 q -2 2 0 4" />
      <ellipse cx="146.6" cy="54.2" rx="2.3" ry="1.7" fill={witchPaint.eye} stroke={witchPaint.ink} strokeWidth={witchPaint.fine} />
      <circle cx="147.4" cy="54.4" r="0.85" fill={witchPaint.pupil} />
      <path {...fine} strokeWidth={witchPaint.outline} d="M 143.4 51.6 Q 146.6 50.2, 149.8 52.6" />
      <path {...fine} d="M 145.4 66.1 Q 148 67.9, 150.6 65.3" />
      <path d="M 146.4 66.3 L 146.9 68 L 147.7 66.7 Z" fill={witchPaint.teeth} stroke={witchPaint.ink} strokeWidth={witchPaint.fine} strokeLinejoin="round" />
      <path d="M 148.6 66.7 L 149 68.1 L 149.7 66.3 Z" fill={witchPaint.teeth} stroke={witchPaint.ink} strokeWidth={witchPaint.fine} strokeLinejoin="round" />

      {/* Her tall hat, its tip bent back by the wind, with a violet band and a gold buckle */}
      <path
        {...ink}
        fill={witchPaint.robe}
        d="M 130 49 C 130 40, 130 30, 126 22 C 122 15, 113 13, 106 18 C 115 18, 121 22, 125 30 C 131 38, 143 44, 152 48 Z"
      />
      <path fill={witchPaint.robeSheen} opacity={witchPaint.shade} d="M 128 30 C 131 37, 138 42, 146 46 L 140 46 C 134 42, 131 37, 128 30 Z" />
      <path {...ink} fill={witchPaint.hatBand} d="M 130.5 47.5 C 137.5 49.5, 145.5 49.5, 151 47.5 L 149 43.5 C 143.5 45.2, 136.8 45.2, 131 43.2 Z" />
      <rect {...ink} x="138.5" y="44" width="4" height="3.6" rx="0.6" fill="none" stroke={witchPaint.buckle} strokeWidth={witchPaint.fine * 2} />
      <path {...ink} fill={witchPaint.robe} d="M 118 53 C 128 46, 150 43, 168 49 C 162 54, 140 56, 118 53 Z" />
      <path fill={witchPaint.robeSheen} opacity={witchPaint.shade} d="M 126 51 C 138 47, 152 46, 162 49 C 150 49, 138 50, 126 51 Z" />
    </g>
  );
}
