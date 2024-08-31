// authService.js
const argon2 = require('argon2');

async function hashPassword(password) {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new Error('Error hashing password');
    }
}

async function verifyPassword(hash, plainPassword) {
    try {
        if (typeof hash !== 'string' || typeof plainPassword !== 'string') {
            throw new Error('Invalid input types for password verification');
        }
        if (!hash.startsWith('$')) {
            console.warn('Stored password hash is not in the correct format. Attempting to rehash.');
            return plainPassword === hash;
        }
        const match = await argon2.verify(hash, plainPassword);
        return match;
    } catch (err) {
        console.error('Error verifying password:', err);
        throw new Error('Error verifying password');
    }
}

module.exports = {
    hashPassword,
    verifyPassword
};