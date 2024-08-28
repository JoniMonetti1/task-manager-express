const argon2 = require('argon2');

// Función para hashear la contraseña
async function hashPassword(password) {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        throw new Error('Error hashing password');
    }
}

// Función para verificar la contraseña
async function verifyPassword(hash, plainPassword) {
    try {
        const match = await argon2.verify(hash, plainPassword);
        return match;
    } catch (err) {
        throw new Error('Error verifying password');
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};