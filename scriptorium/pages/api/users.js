// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   const { method } = req;

//   switch (method) {
//     case 'GET':
//       const users = await prisma.user.findMany();
//       res.status(200).json(users);
//       break;

//     case 'POST':
//       const { first_name, last_name, email, password, phone_number, avatar, role } = req.body;
//       try {
//         const newUser = await prisma.user.create({
//           data: {
//             first_name,
//             last_name,
//             email,
//             password,
//             phone_number,
//             avatar,
//             role,
//           },
//         });
//         res.status(201).json(newUser);
//       } catch (error) {
//         res.status(500).json({ error: 'Error creating user.' });
//       }
//       break;

//     case 'PUT':
//       const { id, ...updateData } = req.body;

//       try {
//         const updatedUser = await prisma.user.update({
//           where: { id },
//           data: updateData,
//         });
//         res.status(200).json(updatedUser);
//       } catch (error) {
//         res.status(500).json({ error: 'Error updating user.' });
//       }
//       break;

//     case 'DELETE':
//       const { userId } = req.body;
//       try {
//         await prisma.user.delete({
//           where: { id: userId },
//         });
//         res.status(204).end(); // currently no content response for successful deletion (worry abt later)
//       } catch (error) {
//         res.status(500).json({ error: 'Error deleting user.' });
//       }
//       break;

//     default:
//       res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//       res.status(405).end(`Method ${method} Not Allowed`);
//       break;
//   }
// }

// Chatgpt used in combination with my code to develop users.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken'; 

export default async function handler(req, res) {
  const { method } = req;

  const authenticateJWT = (req) => {
    // Use header to get token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
      // Returning user data if token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded; 
    } catch (error) {
      return null; 
    }
  };

  switch (method) {
    case 'GET':
      const users = await prisma.user.findMany();
      res.status(200).json(users);
      break;

    case 'POST':
      const { first_name, last_name, username, email, password, phone_number, avatar, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const newUser = await prisma.user.create({
          data: {
            first_name,
            last_name,
            username,
            email,
            hashedPassword,
            phone_number,
            avatar,
            role,
          },
        });
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ error: 'User could not be created.' });
      }
      break;

    case 'PUT':
      // User validation
      const userData = authenticateJWT(req);
      if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id, ...updateData } = req.body;

      // Allowing updating of fields part of user's profile
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userData.id }, 
          data: updateData,
        });
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: 'User could not be updated.' });
      }
      break;

    case 'DELETE':
      // User validation
      const userToDelete = authenticateJWT(req);
      if (!userToDelete) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        // Deleting everything associated to user
        await prisma.blogPost.deleteMany({
          where: { authorId: userToDelete.id }, 
        });

        await prisma.comment.deleteMany({
          where: { userId: userToDelete.id }, 
        });

        await prisma.template.deleteMany({
          where: { authorId: userToDelete.id }, 
        });

        // Deleting user
        await prisma.user.delete({
          where: { id: userToDelete.id },
        });
        res.status(204).end({ message: 'User deleted successfully.' });
      } catch (error) {
        res.status(500).json({ error: 'Error deleting user.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
