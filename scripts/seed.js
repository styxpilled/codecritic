// Seeds the local D1 database with users and popular npm packages.
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
			const createdAt = Math.floor(
				(Date.now() - random() * 60 * 24 * 60 * 60 * 1000) / 1000
			);
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
const { follows, likes } = insertFollowsAndLikes(db, users, reviews);

console.log(
	`Seeded ${users.length} users, ${packages.length} packages, ${reviews.length} reviews, ` +
		`${follows} follows and ${likes} likes.`
);
