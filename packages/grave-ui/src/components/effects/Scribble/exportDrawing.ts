/**
 * Saving a Scribble drawing as an SVG or PNG file.
 * @module components/effects/Scribble/exportDrawing
 */

/** File formats a drawing can be saved as. */
export type ScribbleFormat = 'svg' | 'png';

/**
 * Options for {@link exportScribble}.
 */
export interface ScribbleExportOptions {
  /** File name without the extension. @default 'scribble' */
  fileName?: string;
  /** Fill behind the drawing, or `null` for a see-through background. @default null */
  background?: string | null;
  /** Pixels per screen pixel, for PNG. @default the screen's pixel ratio */
  scale?: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Marks parts of the drawing that are only feedback (trails, the eraser cursor), so they are never saved. */
export const SCRIBBLE_TRANSIENT_ATTRIBUTE = 'data-scribble-transient';
/** How long a download link stays alive after it is clicked, in ms. Some browsers start downloads late. */
const REVOKE_DELAY_MS = 1000;

/** A standalone copy of the drawing's SVG, sized and with an optional background. */
export const scribbleToSvg = (svg: SVGSVGElement, background: string | null = null): string => {
  const { width, height } = svg.getBoundingClientRect();
  const copy = svg.cloneNode(true) as SVGSVGElement;
  copy.setAttribute('xmlns', SVG_NS);
  copy.setAttribute('width', String(Math.round(width)));
  copy.setAttribute('height', String(Math.round(height)));
  copy.setAttribute('viewBox', `0 0 ${Math.round(width)} ${Math.round(height)}`);
  copy.removeAttribute('style');
  copy.removeAttribute('class');
  copy.querySelectorAll(`[${SCRIBBLE_TRANSIENT_ATTRIBUTE}]`).forEach((node) => node.remove());
  if (background) {
    const fill = document.createElementNS(SVG_NS, 'rect');
    fill.setAttribute('width', '100%');
    fill.setAttribute('height', '100%');
    fill.setAttribute('fill', background);
    copy.insertBefore(fill, copy.firstChild);
  }
  return new XMLSerializer().serializeToString(copy);
};

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

const svgToPngBlob = (markup: string, width: number, height: number, scale: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
    image.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('This browser cannot draw the picture.'));
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The picture could not be made.'))), 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The drawing could not be turned into a picture.'));
    };
    image.src = url;
  });

/**
 * Saves the drawing as a file: an SVG (sharp at any size, editable) or a
 * PNG (easy to paste anywhere). Everything happens on the device.
 *
 * @example
 * ```ts
 * await exportScribble(svgElement, 'png', { fileName: 'notes', background: palette.dark[900] });
 * ```
 */
export const exportScribble = async (svg: SVGSVGElement, format: ScribbleFormat, options: ScribbleExportOptions = {}): Promise<void> => {
  const { fileName = 'scribble', background = null, scale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1 } = options;
  const markup = scribbleToSvg(svg, background);
  if (format === 'svg') {
    download(new Blob([markup], { type: 'image/svg+xml' }), `${fileName}.svg`);
    return;
  }
  const { width, height } = svg.getBoundingClientRect();
  download(await svgToPngBlob(markup, width, height, scale), `${fileName}.png`);
};
