function sfc32(a: number, b: number, c: number, d: number) {
	return function () {
		a |= 0;
		b |= 0;
		c |= 0;
		d |= 0;
		const t = (((a + b) | 0) + d) | 0;
		d = (d + 1) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		c = (c + t) | 0;
		return (t >>> 0) / 4294967296;
	};
}

const charRand = (seed: string, offsetA: number, offsetB: number) => {
	return seed.charCodeAt(Math.floor(seed.length / 4) * offsetA + offsetB);
};

export class BannerGenerator {
	getRand: () => number;
	constructor(seed: string) {
		const a = charRand(seed, 1, 1) ** 2 * charRand(seed, 2, 1) ** 2;
		const b = charRand(seed, 1, 2) ** 2 * charRand(seed, 2, 2) ** 2;
		const c = charRand(seed, 1, 3) ** 2 * charRand(seed, 2, 3) ** 2;
		const d = charRand(seed, 1, 4) ** 2 * charRand(seed, 2, 4) ** 2;

		this.getRand = sfc32(a, b, c, d);
	}

	getAd() {
		return ads[Math.floor(this.getRand() * ads.length)];
	}
}

export const ads: {
	title: string;
	text: string;
}[] = [
	{
		title: 'Tired of replacing the oil in your V8 engine?',
		text: 'The New AWS Edge Oil lasts twice as long as other oils!'
	},
	{
		title: 'Cold Start No More!',
		text: 'Reduce cold starts by up to 80% with Workerd!'
	},
	{
		title: 'Most Powerful Witch Doctor',
		text: 'Most pwoerful witchdoctor and spell caster with guaranteed success and results. Call now to change your life! Call +25446643366'
	},
	{
		title: 'Try the new GITHUB for LESBIANS',
		text: "Find the love of your life! Thanks to the new Microsoft™ Azure™ Cloud technology, we can find the person you've spent your whole life searching for!"
	},
	{
		title: 'Make $16,000 by investing $100,000 in new scam cryptocurrency!',
		text: "You know about rugpulls. But what if the rug was a magical djinn rug? That way when it gets swiped from under you, there's no risk!"
	},
	{
		title: 'Make 6 figures by being an Insane Clown Posse frontend engineer',
		text: ''
	},
	{
		title: "Buffer overflows in in your C code? It's more likely than you think!",
		text: ''
	},
	{
		title: 'Finally an AWS wrapper that makes deploying easy and scaling expensive!',
		text: 'Our little AWS wrapper can save you 5.4 minutes a year at the low cost of quadruple the cost!'
	},
	{
		title: 'Learn JavaScript and Get Fit with our free bootcamp!',
		text: ''
	},
	{
		title: 'Why not have style and comfort?',
		text: 'shadcnwind-ui-components - Our CSS-in-JS library will give you the elegance of sematic css with the ease of reading of Tailwind!'
	},
	{
		title: 'The NPM registry is having a sale!',
		text: 'React 60% off, nodemon 50% off, vite free with every purchase! Only at the NPM registry!'
	},
	{
		title: "Want to know about CVE's the same month they happen?",
		text: "Don't want to be exposed to vulnerabilities? Order a Snyk subscription today!"
	},
	{
		title: 'jQuery - JavaScript done the old-fashioned way',
		text: 'Are you tired of rewriting your codebase? Would you like to use libraries tested in the field for years? Visit https://jquery.com/ for more information!'
	},
	{
		title: 'Letterboxd for NPM packages!',
		text: "That's right! Did you ever want to review '@sveltejs/adapter-cloudflare'? Now you can! With codecritic you can review any package published to the NPM registry! All you need is your GitHub account! Find out more at https://codecritic.styx.gay/"
	},
	{
		title: 'Tired of long bundle times?',
		text: "Try Vercel's new blazingly fast bundler!"
	}
];
