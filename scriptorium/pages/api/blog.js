import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
  if (req.method === 'POST') {
      const { title, description, tags, content } = req.body; 
      try {
          // Create a blog post
          const newPost = await prisma.blogPost.create({
            data: { title, description, tags, content },
          });
          //TODO NEED TO INCLUDE USERID
          res.status(201).json(post);
        } catch (error) {
          res.status(500).json({ error: 'Error creating blog post' });
        }
  } else if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const posts = await prisma.blogPost.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Error fetching blog posts" });
    }
  }
  else if (req.method === 'PUT') {
    const { title, description, tags } = req.body;
    try {
      const updatedPost = await prisma.blogPost.update({
        where: { id: parseInt(id) },
        data: { title, description, tags },
      });
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: "Error updating blog post" });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.blogPost.delete({ where: { id: parseInt(id) } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Error deleting blog post" });
    }
  }
  else {
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} not allowed`);
  }
    
}
    
    
