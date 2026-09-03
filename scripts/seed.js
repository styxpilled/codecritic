// Seeds the local D1 database with users, popular npm packages and stacks.
//
//   node scripts/seed.js              seed
//   node scripts/seed.js --reset      remove seeded data, then stop
//   node scripts/seed.js --packages=40
//
// Seeded users get a negative github_id. GitHub only issues positive ids, so
// this cannot collide with a real account. The script removes those users, and
// everything that cascades from them, before it seeds. Real users, real
// packages and the package cache stay as they are.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const D1_DIR = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
// Negative, so a real GitHub id can never match.
const SEED_GITHUB_ID = -900000;
const WEEK = 1000 * 60 * 60 * 24 * 7;

const USERS = [
	{
		username: 'nullpointer',
		nickname: 'Nell',
		bio: 'Types first, tests second.',
	},
	{
		username: 'tabsvsspaces',
		nickname: null,
		bio: 'Tabs. This is not a debate.',
	},
	{ username: 'semverbender', nickname: 'Sam', bio: 'Major bumps for fun.' },
	{
		username: 'bundlephobic',
		nickname: 'Bo',
		bio: 'If it is over 10kb I do not want it.',
	},
	{ username: 'yakshaver', nickname: null, bio: 'Here for the build tools.' },
	{
		username: 'regexwizard',
		nickname: 'Rex',
		bio: 'I can read your pattern. Sorry.',
	},
	{
		username: 'lockfilelover',
		nickname: null,
		bio: 'Reviews dependency trees for sport.',
	},
	{ username: 'a11yalice', nickname: 'Alice', bio: 'Keyboard only, always.' },
];

const QUERIES = [
	'keywords:javascript',
	'keywords:typescript',
	'keywords:cli',
	'keywords:react',
	'keywords:svelte',
	'keywords:testing',
];

const OPENERS = [
	'Does exactly what it says.',
	'Works, but the docs are thin.',
	'Solid. No complaints after a year in production.',
	'Great API, questionable defaults.',
	'Pulled it in for one function. No regrets.',
	'Heavier than I expected.',
	'The migration guide saved me a day.',
	'Fine until you need the edge cases.',
	'Best in class right now.',
	'I keep coming back to this one.',
];

const CLOSERS = [
	'Would use again.',
	'Docs could use examples.',
	'Watch the peer dependencies.',
	'The types are excellent.',
	'Ships too much for what it does.',
	'Zero config actually means zero config here.',
	'',
];

const STACK_NAMES = [
	'Daily drivers',
	'What I reach for first',
	'Boring on purpose',
	'The build shelf',
	'Small and sharp',
	'Everything a new service needs',
	'Testing, top to bottom',
	'Things I wish I had found sooner',
	'Zero config club',
	'For the CLI drawer',
	'Frontend, minus the framework',
	'Types all the way down',
];

const STACK_DESCRIPTIONS = [
	'The set I copy into every new repository.',
	'Nothing here is clever. That is the point.',
	'Built this after one too many rewrites.',
	'Opinionated. Ask me about any of them.',
	'Small dependencies that pull their weight. Nothing over 10kb, nothing that drags half of npm in behind it, and every one of them replaceable in an afternoon if it stops being maintained.',
	'Half of these replaced something bigger.',
	'',
];

const STACK_TAGS = [
	'typescript',
	'tooling',
	'testing',
	'frontend',
	'backend',
	'cli',
	'build',
	'minimal',
	'svelte',
	'node',
];

const args = process.argv.slice(2);
const reset = args.includes('--reset');
const packageCount = Number(
	args.find((a) => a.startsWith('--packages='))?.split('=')[1] ?? 30
);

// Deterministic, so repeated runs produce the same database.
let seed = 42;
const random = () => {
	seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
	return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(random() * arr.length)];
const upTo = (max) => Math.floor(random() * max);

// Same slug rule as normalizeName in src/lib/index.ts.
const normalizeName = (input) =>
	input
		.normalize('NFD')
		.toLowerCase()
		.replaceAll(/[^0-9a-z]+/g, '-')
		.replaceAll(/^-+|-+$/g, '');

const someTimeInTheLastTwoMonths = () =>
	Math.floor((Date.now() - random() * 60 * 24 * 60 * 60 * 1000) / 1000);

function openDatabase() {
	const file = readdirSync(D1_DIR).find(
		(f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite'
	);
	if (!file)
		throw new Error(`No D1 database in ${D1_DIR}. Run the app once first.`);
	return new DatabaseSync(join(D1_DIR, file));
}

function clear(db) {
	// Cascades remove the reviews, likes, follows, profiles and stacks.
	const { changes } = db.prepare('DELETE FROM users WHERE github_id < 0').run();
	return changes;
}

async function fetchPackages() {
	const found = new Map();
	const size = Math.ceil(packageCount / QUERIES.length) + 2;
	for (const text of QUERIES) {
		const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}&size=${size}&popularity=1.0&quality=0.0&maintenance=0.0`;
		const res = await fetch(url);
		if (!res.ok)
			throw new Error(`npm search failed: ${res.status} ${res.statusText}`);
		const body = await res.json();
		for (const { package: pkg } of body.objects) {
			if (!found.has(pkg.name)) found.set(pkg.name, pkg);
		}
	}
	return [...found.values()].slice(0, packageCount);
}

function insertUsers(db) {
	const user = db.prepare(
		'INSERT INTO users (username, nickname, github_id) VALUES (?, ?, ?) RETURNING id'
	);
	const profile = db.prepare(
		'INSERT INTO profiles (id, bio, url) VALUES (?, ?, ?)'
	);
	return USERS.map((u, i) => {
		const { id } = user.get(u.username, u.nickname, SEED_GITHUB_ID - i);
		profile.run(id, u.bio, `https://example.com/${u.username}`);
		return { ...u, id };
	});
}

function insertPackages(db, packages) {
	const pkg = db.prepare(
		`INSERT OR IGNORE INTO packages
		 (name, description, latest, next, license, repository, homepage, expires, modified)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	const keyword = db.prepare(
		'INSERT INTO packages_keywords (name, keyword) VALUES (?, ?)'
	);
	const expires = Math.floor((Date.now() + WEEK) / 1000);
	for (const p of packages) {
		const { changes } = pkg.run(
			p.name,
			p.description ?? '',
			p.version,
			null,
			p.license ?? '',
			p.links?.repository ?? '',
			p.links?.homepage ?? null,
			expires,
			p.date ?? null
		);
		// Leave the keywords of a package that the app already cached.
		if (changes === 0) continue;
		for (const k of new Set(p.keywords ?? [])) keyword.run(p.name, k);
	}
}

function insertReviews(db, users, packages) {
	const review = db.prepare(
		`INSERT INTO reviews (authorID, packageID, created_at, version, content, rating, "index")
		 VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
	);
	const ids = [];
	for (const user of users) {
		const count = 3 + Math.floor(random() * 5);
		const reviewed = new Set();
		for (let i = 0; i < count; i++) {
			const pkg = pick(packages);
			if (reviewed.has(pkg.name)) continue;
			reviewed.add(pkg.name);
			const content = [pick(OPENERS), pick(CLOSERS)].filter(Boolean).join(' ');
			const createdAt = someTimeInTheLastTwoMonths();
			const { id } = review.get(
				user.id,
				pkg.name,
				createdAt,
				pkg.version,
				content,
				1 + Math.floor(random() * 10),
				0
			);
			ids.push({ id, authorID: user.id });
		}
	}
	return ids;
}

function insertStacks(db, users, packages) {
	const stack = db.prepare(
		`INSERT INTO stacks
		 (author, name, normalizedName, description, created_at, updated_at, "index")
		 VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`
	);
	const member = db.prepare(
		'INSERT INTO stacks_packages (stack_id, package, position) VALUES (?, ?, ?)'
	);
	const tag = db.prepare(
		'INSERT INTO stacks_tags (stack_id, tag) VALUES (?, ?)'
	);
	// The index disambiguates two stacks of one author under the same slug.
	const indexes = new Map();
	const ids = [];
	for (const user of users) {
		const total = 1 + upTo(3);
		for (let i = 0; i < total; i++) {
			const name = pick(STACK_NAMES);
			const normalized = normalizeName(name);
			const key = `${user.id}/${normalized}`;
			const index = indexes.get(key) ?? 0;
			indexes.set(key, index + 1);
			const createdAt = someTimeInTheLastTwoMonths();
			const { id } = stack.get(
				user.id,
				name,
				normalized,
				pick(STACK_DESCRIPTIONS),
				createdAt,
				createdAt,
				index
			);

			const members = new Set();
			const size = Math.min(3 + upTo(6), packages.length);
			while (members.size < size) members.add(pick(packages).name);
			[...members].forEach((pkg, position) => member.run(id, pkg, position));

			const tags = new Set();
			const tagCount = Math.min(upTo(5), STACK_TAGS.length);
			while (tags.size < tagCount) tags.add(pick(STACK_TAGS));
			for (const t of tags) tag.run(id, t);

			ids.push({ id, authorID: user.id });
		}
	}
	return ids;
}

function insertStackLikes(db, users, stacks) {
	const like = db.prepare(
		'INSERT OR IGNORE INTO stacks_likes (user_id, stack_id) VALUES (?, ?)'
	);
	let likes = 0;
	for (const user of users) {
		for (const stack of stacks) {
			if (stack.authorID === user.id || random() > 0.35) continue;
			likes += like.run(user.id, stack.id).changes;
		}
	}
	return likes;
}

function insertFollowsAndLikes(db, users, reviews) {
	const follow = db.prepare(
		'INSERT OR IGNORE INTO users_follows (user_id, following) VALUES (?, ?)'
	);
	const like = db.prepare(
		'INSERT INTO likes_reviews (user_id, review_id) VALUES (?, ?)'
	);
	let follows = 0;
	let likes = 0;
	for (const user of users) {
		for (const other of users) {
			if (other.id === user.id || random() > 0.4) continue;
			follows += follow.run(user.id, other.id).changes;
		}
		for (const review of reviews) {
			if (review.authorID === user.id || random() > 0.25) continue;
			like.run(user.id, review.id);
			likes++;
		}
	}
	return { follows, likes };
}

const db = openDatabase();
const removed = clear(db);
if (reset) {
	console.log(
		`Removed ${removed} seeded users and everything that hangs off them.`
	);
	process.exit(0);
}

const packages = await fetchPackages();
const users = insertUsers(db);
insertPackages(db, packages);
const reviews = insertReviews(db, users, packages);
const stacks = insertStacks(db, users, packages);
const { follows, likes } = insertFollowsAndLikes(db, users, reviews);
const stackLikes = insertStackLikes(db, users, stacks);

console.log(
	`Seeded ${users.length} users, ${packages.length} packages, ${reviews.length} reviews, ` +
		`${stacks.length} stacks, ${follows} follows, ${likes} review likes and ` +
		`${stackLikes} stack likes.`
);
