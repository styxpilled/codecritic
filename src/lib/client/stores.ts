import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const supabase = writable<SupabaseClient>();
export const session = writable<Session | null>();
