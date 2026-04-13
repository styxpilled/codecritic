<script module>
	export const LUCIDE_ICON_IDS = /** @type {const} */ ([
		'search',
		'layers',
		'user-lock',
		'package',
		'list',
		'user',
		'plus',
		'x',
		'sun',
		'moon',
		'scale',
		'copy',
		'notebook',
		'globe',
		'corner-down-left',
	]);
</script>

<script>
	/** @type {{ id: typeof LUCIDE_ICON_IDS[number], size?: number|string, color?: string, [x: string]: any }} */
	let { id, size = 24, color = 'currentColor', ...rest } = $props();

	const sprite_href = $derived(`${import.meta.env.BASE_URL}lucide.svg#${id}`);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{...rest}
>
	<use href={sprite_href}></use>
</svg>
