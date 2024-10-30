import { prisma } from '@/prisma/client';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { explanation, reporterId, postId, commentId } = req.body;
    console.log(explanation, reporterId, postId, commentId)
    if (!postId && !commentId) {
      return res.status(400).json({ error: 'Must provide postId or commentId' });
    }

    try {
      const newReport = await prisma.report.create({
        data: {
          explanation,
          reporter: { connect: { id: reporterId } }, // Link to the reporter (user)
          post: postId ? { connect: { id: postId } } : undefined, // Connect to post if provided
          comment: commentId ? { connect: { id: commentId } } : undefined, // Connect to comment if provided
        },
      });
      console.log("hi")


      // Increment reportsCount on the reported post or comment
      if (postId) {
        await prisma.blogPost.update({
          where: { id: postId },
          data: { numOfReports: { increment: 1 } },
        });
      } else if (commentId) {
        await prisma.comment.update({
          where: { id: commentId },
          data: { numOfReports: { increment: 1 } },
        });
      }

      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error reporting content:", error);
      res.status(500).json({ error: 'Error reporting content', });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}