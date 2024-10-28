import { prisma } from '@prisma/client';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { explanation, reporterId, postId, commentId } = req.body;

    if (!postId && !commentId) {
      return res.status(400).json({ error: 'Must provide postId or commentId' });
    }

    try {
      const newReport = await prisma.report.create({
        data: {
          explanation,
          reporterId,
          postId,
          commentId,
        },
      });

      // Increment reportsCount on the reported post or comment
      if (postId) {
        await prisma.blogPost.update({
          where: { id: postId },
          data: { reportsCount: { increment: 1 } },
        });
      } else if (commentId) {
        await prisma.comment.update({
          where: { id: commentId },
          data: { reportsCount: { increment: 1 } },
        });
      }

      res.status(201).json(newReport);
    } catch (error) {
      res.status(500).json({ error: 'Error reporting content' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}