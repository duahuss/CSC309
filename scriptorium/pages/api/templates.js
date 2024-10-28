import { prisma } from '@prisma/client';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, explanation, tags, content } = req.body;
    const userId = req.user.id; // Assume authenticated user ID is in req.user

    try {
      const newTemplate = await prisma.template.create({
        data: {
          title,
          explanation,
          tags,
          content,
          userId,
        },
      });
      res.status(201).json(newTemplate);
    } catch (error) {
      res.status(500).json({ error: 'Unable to create template' });
    }
  } else if (req.method === 'GET') {
    const userId = req.user.id; // Assume authenticated user ID is in req.user
    const { search, user } = req.query;

    const whereClause = {
      userId: user === 'me' ? userId : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { explanation: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ]
        : undefined,
    };

    try {
      const templates = await prisma.template.findMany({
        where: whereClause,
      });
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Unable to retrieve templates' });
    }
  } 
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// import { prisma } from "@/prisma/client";
// import jwt from 'jsonwebtoken';

// export default async function handler(req, res) {
//   const getUserIdFromToken = (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       return decoded.userId; // Make sure your token contains userId
//     } catch (error) {
//       return null; // Token is invalid
//     }
//   };

//   const token = req.headers.authorization?.split(' ')[1]; // Bearer token
//   const userId = getUserIdFromToken(token);

//   if (req.method === 'POST') {
//     const { title, description, code, tags } = req.body;
//     if (!userId) {
//       return res.status(401).json({ error: 'You must be signed in to create a template.' });
//     }

//     try {
//       const user = await prisma.user.findUnique({ where: { id: userId } });
//       if (!user) {
//         return res.status(404).json({ error: 'User not found.' });
//       }

//       const newTemplate = await prisma.template.create({
//         data: {
//           title,
//           description,
//           code,
//           author_id: userId, // Associate template with user ID
//         },
//       });

//       res.status(201).json({
//         ...newTemplate,
//         username: user.username, // Include username in the response
//       });
//     } catch (error) {
//       res.status(500).json({ error: 'Error creating template.' });
//     }
//   } else if (req.method === 'GET') {
//     try {
//       const { page = 1, limit = 10 } = req.query;
//       const skip = (page - 1) * limit;
//       const templates = await prisma.template.findMany({
//         skip: parseInt(skip),
//         take: parseInt(limit),
//         orderBy: { created_at: 'desc' },
//         include: {
//           author: {
//             select: { username: true }, // Include username in the response
//           },
//         },
//       });
//       res.status(200).json(templates);
//     } catch (error) {
//       res.status(500).json({ error: "Error fetching templates." });
//     }
//   } else if (req.method === 'PUT') {
//     const { id, title, description, code, tags } = req.body;
//     if (!userId) {
//       return res.status(401).json({ error: 'You must be signed in to update a template.' });
//     }
//     try {
//       const updatedTemplate = await prisma.template.update({
//         where: { id: id },
//         data: { title, description, code, tags },
//       });
//       res.status(200).json(updatedTemplate);
//     } catch (error) {
//       res.status(500).json({ error: "Error updating template." });
//     }
//   } else if (req.method === 'DELETE') {
//     if (!userId) {
//       return res.status(401).json({ error: 'You must be signed in to delete a template.' });
//     }
//     const { id } = req.body;
//     try {
//       await prisma.template.delete({ where: { id: id } });
//       res.status(204).end();
//     } catch (error) {
//       res.status(500).json({ error: "Error deleting template." });
//     }
//   } else {
//     res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
//     res.status(405).end(`Method ${req.method} not allowed`);
//   }
// }
