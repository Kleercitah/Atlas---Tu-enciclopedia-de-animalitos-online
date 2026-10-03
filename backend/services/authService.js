const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');

async function registerUser({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert({ name, email, password_hash: passwordHash })
        .select('id, name, email, role, created_at')
        .single();

    if (error) throw error;
    return data;
}

async function authenticateUser(email, password) {
    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, password_hash')
        .eq('email', email)
        .maybeSingle();

    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
}

module.exports = { registerUser, authenticateUser };