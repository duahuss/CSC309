import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
    const { postId } = req.query;
  
    if (req.method === 'GET') {
      try {
        const comments = await prisma.comment.findMany({
          where: { postId: parseInt(postId), parentId: null },
          include: {
            replies: {
              include: {
                replies: true, // Add more depth if you want multiple nesting levels
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
  
        res.status(200).json(comments);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching comments' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  