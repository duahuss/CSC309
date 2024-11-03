import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId; 
    } catch (error) {
      return null; 
    }
  };

  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  const userId = getUserIdFromToken(token);
  
  if (!userId) {
    return res.status(401).json({ error: 'You must be signed in' });
  } 

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });  
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Could not verify' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const sortedBlogPosts = await prisma.blogPost.findMany({
          orderBy: {
            numOfReports: 'desc',
          },
        });

        const sortedComments = await prisma.comment.findMany({
          orderBy: {
            numOfReports: 'desc',
          },
        });

        res.status(200).json({
          blogPosts: sortedBlogPosts,
          comments: sortedComments,
        });
      } catch (error) {
        res.status(500).json({ error: 'Error fetching and sorting content.' });
      }
      break;

    case 'POST':
      const { contentType, contentId } = req.body;

      if (!contentType || !contentId) {
        return res.status(400).json({ error: 'Invalid request data.' });
      }

      try {
        if (contentType === 'blogPost') {
          await prisma.blogPost.update({
            where: { id: contentId },
            data: { is_hidden: true },
          });
        } else if (contentType === 'comment') {
          await prisma.comment.update({
            where: { id: contentId },
            data: { is_hidden: true },
          });
        } else {
          return res.status(400).json({ error: 'Invalid content type.' });
        }

        res.status(200).json({ message: 'Content successfully hidden.' });
      } catch (error) {
        res.status(500).json({ error: 'Error hiding content.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
