import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type CardVariant = 'primary' | 'secondary' | 'tertiary' | 'quiet';
export type CardSize = 's' | 'm' | 'l';
export type CardDensity = 'compact' | 'regular' | 'spacious';

export type CardProps = HTMLAttributes<HTMLElement> & {
	/** Card の視覚スタイル */
	variant?: CardVariant;
	/** フォント・スペーシングが連動するサイズ */
	size?: CardSize;
	/** カード内パディングの密度 */
	density?: CardDensity;
	/** リンク先 — 設定時 <a> としてレンダリング */
	href?: string;

	/* ── Snippet slots ── */

	/** 画像・サムネイル・アイコン領域（カード上部） */
	preview?: Snippet;
	/** タイトル */
	heading: Snippet;
	/** 補足テキスト */
	description?: Snippet;
	/** ボタン・メタ情報領域（カード下部） */
	footer?: Snippet;
};
