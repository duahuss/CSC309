import jwt from 'jsonwebtoken';

export function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // change ?
}

export function verifyToken(token) {
    try {

        return jwt.verify(token, process.env.JWT_SECRET);

    } catch (error) {

        return null;
        
    }
}


/// This following code is after we have a predefined admin + user login (SPECIFIC_USER_ID needs to be added to .env)

// import jwt from 'jsonwebtoken';

// export function generateToken(userId, role) {
//     const expiresIn = (role === 'ADMIN' || userId === process.env.SPECIFIC_USER_ID) ? undefined : '1h';
//     return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
// }

// export function verifyToken(token) {
//     try {
//         return jwt.verify(token, process.env.JWT_SECRET);
//     } catch (error) {
//         return null;
//     }
// }

