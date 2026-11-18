/**
 * The WitchOnBroom drawing as a texture, so she can stand in a 3D scene: hidden
 * behind stones, softened by the fog, and lit by the scene like everything else.
 * It is the very same drawing, drawn once from the component.
 * @module components/horror3d/GraveyardWalk3D/witchTexture
 */
import { createElement, useEffect, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { WitchOnBroom } from '../../coven/WitchOnBroom/WitchOnBroom';
import { WITCH_VIEWBOX } from '../../coven/WitchOnBroom/tokens';
import { walkWitch } from './tokens';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The drawing's own SVG, without the button around it, sized `width` pixels across. */
export const witchSvg = (width: number = walkWitch.textureWidth): string => {
  const markup = renderToStaticMarkup(createElement(WitchOnBroom, { scenery: false, followPointer: false, soundOnCast: false }));
  const start = markup.indexOf('<svg');
  const end = markup.lastIndexOf('</svg>') + '</svg>'.length;
  const height = Math.round((width * WITCH_VIEWBOX.height) / WITCH_VIEWBOX.width);
  return markup
    .slice(start, end)
    .replace(/^<svg([^>]*?) width="[^"]*" height="[^"]*"/, `<svg$1 xmlns="${SVG_NS}" width="${width}" height="${height}"`);
};

/** The width over the height of the drawing. */
export const WITCH_ASPECT = WITCH_VIEWBOX.width / WITCH_VIEWBOX.height;

/** Loads the witch as a texture once, and frees it when the scene goes. */
export const useWitchTexture = (): Texture => {
  const texture = useMemo(() => {
    const loaded = new TextureLoader().load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(witchSvg())}`);
    loaded.colorSpace = SRGBColorSpace;
    return loaded;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
};
