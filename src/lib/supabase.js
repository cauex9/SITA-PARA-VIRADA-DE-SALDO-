import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
	import.meta.env.VITE_SUPABASE_ANON_KEY ||
	import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ou VITE_SUPABASE_PUBLISHABLE_KEY.');
}

console.log('SUPABASE URL OK?', Boolean(supabaseUrl));
console.log('SUPABASE KEY OK?', Boolean(supabaseKey));

export const supabase = createClient(supabaseUrl, supabaseKey);
