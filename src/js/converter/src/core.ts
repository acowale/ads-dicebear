import type {
  Result,
  Avatar,
  ToJpeg,
  ToPng,
  ToWebp,
  ToAvif,
  Options,
} from './types.js';
import { getMimeType } from './utils/mime-type.js';
import { ensureSize } from './utils/svg-browser.js';

export const toPng: ToPng = (avatar: Avatar, options: Options = {}) => {
  return toFormat(avatar, 'png', options);
};

export const toJpeg: ToJpeg = (avatar: Avatar, options: Options = {}) => {
  return toFormat(avatar, 'jpeg', options);
};

export const toWebp: ToWebp = (avatar: Avatar, options: Options = {}) => {
  return toFormat(avatar, 'webp', options);
};

export const toAvif: ToAvif = (avatar: Avatar, options: Options = {}) => {
  return toFormat(avatar, 'avif', options);
};

/**
 * Browser conversion entry point. Returns a {@link Result} with `toDataUri()`
 * and `toArrayBuffer()` methods that lazily render the avatar to the chosen
 * raster format. Warns when `includeExif` is set, since Exif metadata is
 * only supported by the Node build.
 */
function toFormat(
  avatar: Avatar,
  format: 'png' | 'jpeg' | 'webp' | 'avif',
  options: Options = {},
): Result {
  if (options.includeExif) {
    console.warn(
      'The `exif` option is not supported in the browser version of `@acowale/converter`. \n' +
        'Please use the node version of `@acowale/converter` to generate images with exif data.',
    );
  }

  const svg = typeof avatar === 'string' ? avatar : avatar.toString();

  return {
    toDataUri: () => toDataUri(svg, format, options),
    toArrayBuffer: () => toArrayBuffer(svg, format, options),
  };
}
