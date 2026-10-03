const supabase = require('../config/supabase');

async function getUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

async function getMetrics() {
    const [saved, viewed] = await Promise.all([
        supabase
            .from('admin_most_saved')
            .select('external_id, saved_count')
            .order('saved_count', { ascending: false })
            .limit(10),
        supabase
            .from('admin_most_viewed')
            .select('external_id, view_count')
            .order('view_count', { ascending: false })
            .limit(10),
    ]);

    if (saved.error) throw saved.error;
    if (viewed.error) throw viewed.error;
    return { mostSaved: saved.data || [], mostViewed: viewed.data || [] };
}

module.exports = { getUsers, getMetrics };