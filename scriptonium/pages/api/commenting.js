import { prisma } from '@prisma/client';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, postId, authorId, parentId } = req.body;

    try {
      const newComment = await prisma.comment.create({
        data: {
          content,
          postId,
          authorId,
          parentId, 
        },
      });
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ error: 'Error creating comment' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
