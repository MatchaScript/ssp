import type { Avatar as AvatarPrimitive } from 'bits-ui';

export type AvatarRootProps = AvatarPrimitive.RootProps & {
	/**
	 * The size of the avatar in pixels.
	 * @default 24
	 */
	size?: number;

	/**
	 * Whether the avatar is over a colored background (applies an outline).
	 * @default false
	 */
	isOverBackground?: boolean;
};

export type AvatarImageProps = AvatarPrimitive.ImageProps;

export type AvatarFallbackProps = AvatarPrimitive.FallbackProps;

export type LoadingStatus = 'loading' | 'loaded' | 'error';
