const supabase = require('../config/supabase');

async function getDiscoveries(userId) {
    const { data, error } = await supabase
        .from('discoveries')
        .select('id, user_id, external_id, notes, favorite, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

async function createDiscovery(userId, { external_id, notes }) {
    const { data, error } = await supabase
        .from('discoveries')
        .insert({ user_id: userId, external_id, notes })
        .select('id, user_id, external_id, notes, favorite, status, created_at')
        .single();

    if (error) throw error;
    return data;
}

async function recordTaxonView(userId, externalId) {
    const { error } = await supabase
        .from('taxon_views')
        .insert({ user_id: userId, external_id: externalId });

    if (error) throw error;
}

async function updateDiscovery(userId, id, changes) {
    const { data, error } = await supabase
        .from('discoveries')
        .update(changes)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, external_id, notes, favorite, status, created_at')
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function deleteDiscovery(userId, id) {
    const { data, error } = await supabase
        .from('discoveries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select('id')
        .maybeSingle();

    if (error) throw error;
    return data;
}

module.exports = { getDiscoveries, createDiscovery, recordTaxonView, updateDiscovery, deleteDiscovery };