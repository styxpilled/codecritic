// drizzle-kit does not generate triggers, so append them to the newest migration.
import { readFileSync, appendFileSync } from 'node:fs';

const dir = 'src/lib/server/db';
const triggers = readFileSync(`${dir}/triggers.sql`, 'utf8');
const journal = JSON.parse(
	readFileSync(`${dir}/migrations/meta/_journal.json`, 'utf8')
);
const latest = `${dir}/migrations/${journal.entries.at(-1).tag}.sql`;

if (!readFileSync(latest, 'utf8').includes(triggers)) {
	appendFileSync(latest, `--> statement-breakpoint\n${triggers}`);
	console.log(`Appended triggers to ${latest}`);
}
