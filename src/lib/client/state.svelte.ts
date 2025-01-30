import { browser } from '$app/environment';

export const defaultDarkTheme = {
	color_bg: '#181a1b',
	color_bg_bright: '#21252b',
	color_bg_brighter: '#282c34',
	color_bg_brightest: '#404859',

	color_text: '#dcdfe4',
	color_text_darker: 'hsl(220, 13%, 80%)',
	color_text_dark: 'hsl(220, 13%, 55%)',

	color_red: '#e06c75',
	color_orange: '#d19a66',
	color_yellow: '#e5c07b',
	color_green: '#98c379',
	color_cyan: '#56b6c2',
	color_blue: '#61afef',
	color_purple: '#c678dd'
};

export const theme = persisted<typeof defaultDarkTheme>('codecritic-theme', defaultDarkTheme);

export const localState = persisted('codecritic-state', {
	useCustomTheme: false
});

function persisted<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	const stored = readLocalStorage(key, fallback);
	const state = $state(stored);
	localStorage.setItem(key, JSON.stringify(state));
	$effect.root(() => {
		$effect(() => {
			localStorage.setItem(key, JSON.stringify(state));
		});
	});
	return state;
}

function readLocalStorage<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	const res = localStorage.getItem(key);
	if (res === null) return fallback;
	else {
		try {
			return { ...fallback, ...JSON.parse(res) };
		} catch (error) {
			console.error(error);
			return fallback;
		}
	}
}
