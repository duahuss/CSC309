import { prisma } from '@prisma/client';



export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const blogPost = await prisma.blogPost.findUnique({
        where: {
          id: parseInt(id),
        },
      });

      if (!blogPost) {
        res.status(404).json({ message: 'Blog post not found' });
      } else {
        res.status(200).json(blogPost);
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching blog post by ID' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
