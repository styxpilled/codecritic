// Seeds the D1 database with users, popular npm packages and stacks.
//
//   node scripts/seed.js              seed the local database
//   node scripts/seed.js --sql        write scripts/seed.sql instead
//   node scripts/seed.js --reset      remove seeded data, then stop
//   node scripts/seed.js --packages=40
//
// Seeded rows use negative ids. SQLite accepts them for an INTEGER PRIMARY
// KEY, real rows keep their positive ids, and rowid allocation stays
// untouched. GitHub only issues positive account ids, so the seeded users
// cannot collide with a real account either. The script removes those rows,
// and everything that cascades from them, before it seeds. Real users, real
// packages and the package cache stay as they are.
//
// The script builds plain SQL text. It either runs that text against the
// local miniflare database, or writes it to a file for:
//
//   wrangler d1 execute codecritic-d1 --remote --file=scripts/seed.sql
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const D1_DIR = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const SQL_OUT = 'scripts/seed.sql';
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
const toFile = args.includes('--sql');
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

// Every value reaches the database as a literal, so quoting is on us.
const lit = (value) => {
	if (value === null || value === undefined) return 'NULL';
	if (typeof value === 'number') return String(value);
	return `'${String(value).replaceAll("'", "''")}'`;
};

const statements = [];
const write = (sql, ...values) => {
	let i = 0;
	statements.push(sql.replaceAll('?', () => lit(values[i++])) + ';');
};

// Stacks hold no foreign key to their author, so they need their own delete.
function clear() {
	write('DELETE FROM stacks WHERE id < 0');
	write('DELETE FROM users WHERE github_id < 0');
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

function insertUsers() {
	return USERS.map((u, i) => {
		const id = -1 - i;
		write(
			'INSERT INTO users (id, username, nickname, github_id) VALUES (?, ?, ?, ?)',
			id,
			u.username,
			u.nickname,
			SEED_GITHUB_ID - i
		);
		write(
			'INSERT INTO profiles (id, bio, url) VALUES (?, ?, ?)',
			id,
			u.bio,
			`https://example.com/${u.username}`
		);
		return { ...u, id };
	});
}

function insertPackages(packages) {
	const expires = Math.floor((Date.now() + WEEK) / 1000);
	for (const p of packages) {
		write(
			`INSERT OR IGNORE INTO packages
	(name, description, latest, next, license, repository, homepage, expires, modified)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
		// Never duplicate a keyword that the app already cached.
		for (const k of new Set(p.keywords ?? [])) {
			write(
				`INSERT INTO packages_keywords (name, keyword)
	SELECT ?, ? WHERE NOT EXISTS
	(SELECT 1 FROM packages_keywords WHERE name = ? AND keyword = ?)`,
				p.name,
				k,
				p.name,
				k
			);
		}
	}
}

function insertReviews(users, packages) {
	const ids = [];
	let nextID = -1;
	for (const user of users) {
		const count = 3 + Math.floor(random() * 5);
		const reviewed = new Set();
		for (let i = 0; i < count; i++) {
			const pkg = pick(packages);
			if (reviewed.has(pkg.name)) continue;
			reviewed.add(pkg.name);
			const content = [pick(OPENERS), pick(CLOSERS)].filter(Boolean).join(' ');
			const id = nextID--;
			write(
				`INSERT INTO reviews (id, authorID, packageID, created_at, version, content, rating, "index")
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				id,
				user.id,
				pkg.name,
				someTimeInTheLastTwoMonths(),
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

function insertStacks(users, packages) {
	// The index disambiguates two stacks of one author under the same slug.
	const indexes = new Map();
	const ids = [];
	let nextID = -1;
	for (const user of users) {
		const total = 1 + upTo(3);
		for (let i = 0; i < total; i++) {
			const name = pick(STACK_NAMES);
			const normalized = normalizeName(name);
			const key = `${user.id}/${normalized}`;
			const index = indexes.get(key) ?? 0;
			indexes.set(key, index + 1);
			const createdAt = someTimeInTheLastTwoMonths();
			const id = nextID--;
			write(
				`INSERT INTO stacks
	(id, author, name, normalizedName, description, created_at, updated_at, "index")
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				id,
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
			[...members].forEach((pkg, position) =>
				write(
					'INSERT INTO stacks_packages (stack_id, package, position) VALUES (?, ?, ?)',
					id,
					pkg,
					position
				)
			);

			const tags = new Set();
			const tagCount = Math.min(upTo(5), STACK_TAGS.length);
			while (tags.size < tagCount) tags.add(pick(STACK_TAGS));
			for (const t of tags)
				write('INSERT INTO stacks_tags (stack_id, tag) VALUES (?, ?)', id, t);

			ids.push({ id, authorID: user.id });
		}
	}
	return ids;
}

function insertStackLikes(users, stacks) {
	let likes = 0;
	for (const user of users) {
		for (const stack of stacks) {
			if (stack.authorID === user.id || random() > 0.35) continue;
			write(
				'INSERT OR IGNORE INTO stacks_likes (user_id, stack_id) VALUES (?, ?)',
				user.id,
				stack.id
			);
			likes++;
		}
	}
	return likes;
}

function insertFollowsAndLikes(users, reviews) {
	let follows = 0;
	let likes = 0;
	for (const user of users) {
		for (const other of users) {
			if (other.id === user.id || random() > 0.4) continue;
			write(
				'INSERT OR IGNORE INTO users_follows (user_id, following) VALUES (?, ?)',
				user.id,
				other.id
			);
			follows++;
		}
		for (const review of reviews) {
			if (review.authorID === user.id || random() > 0.25) continue;
			write(
				'INSERT INTO likes_reviews (user_id, review_id) VALUES (?, ?)',
				user.id,
				review.id
			);
			likes++;
		}
	}
	return { follows, likes };
}

function runLocally(sql) {
	const file = readdirSync(D1_DIR).find(
		(f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite'
	);
	if (!file)
		throw new Error(`No D1 database in ${D1_DIR}. Run the app once first.`);
	const db = new DatabaseSync(join(D1_DIR, file));
	db.exec('PRAGMA foreign_keys = ON');
	db.exec(sql);
	db.close();
}

clear();

let summary;
if (reset) {
	summary = 'Removed the seeded users and stacks, and everything below them.';
} else {
	const packages = await fetchPackages();
	const users = insertUsers();
	insertPackages(packages);
	const reviews = insertReviews(users, packages);
	const stacks = insertStacks(users, packages);
	const { follows, likes } = insertFollowsAndLikes(users, reviews);
	const stackLikes = insertStackLikes(users, stacks);
	summary =
		`${users.length} users, ${packages.length} packages, ${reviews.length} reviews, ` +
		`${stacks.length} stacks, ${follows} follows, ${likes} review likes and ` +
		`${stackLikes} stack likes.`;
}

// D1 runs a remote file over HTTP, which refuses BEGIN and COMMIT. Every
// statement is idempotent instead, so a re-run is safe.
const sql = statements.join('\n') + '\n';

if (toFile) {
	writeFileSync(SQL_OUT, sql);
	console.log(
		`Wrote ${statements.length} statements to ${SQL_OUT}: ${summary}`
	);
	console.log(
		`Apply with: wrangler d1 execute codecritic-d1 --remote --file=${SQL_OUT}`
	);
} else {
	runLocally(sql);
	console.log(`Seeded the local database: ${summary}`);
}
