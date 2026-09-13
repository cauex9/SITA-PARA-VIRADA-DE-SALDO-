import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ttmqtvkevlfxyqbtyrxx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RkNLJ7Ob4zlrW29FXHy2lg_UQDu5nXJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
