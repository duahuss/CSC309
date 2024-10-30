import { prisma } from '@/prisma/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId; // Ensure your token contains userId
    } catch (error) {
      return null; // Token is invalid
    }
  };

  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  const userId = getUserIdFromToken(token);
  

  if (req.method === 'POST') {
      const { blog_post_id, content, parent_id } = req.body; // Removed user_id from here
      console.log({blog_post_id, content})
      console.log({userId})
      // Check if the user is authenticated
      if (!userId) {
        return res.status(401).json({ error: 'You must be signed in to create a blog post.' });
      }
      console.log({userId})

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
        console.log({blog_post_id, content})
    
        if (!content || !blog_post_id) { // Removed user_id from here as it's not needed
          return res.status(400).json({ error: "Missing required fields" });
        }
        //console.log("Type of blog_post_id:", typeof blog_post_id)

        const blogPost1 = await prisma.blogPost.findUnique({
          where: { id: blog_post_id },
        });
        console.log({blog_post_id, content})

        if (!blogPost1) {
          console.log("hi")
          return res.status(404).json({ error: "Blog post not found." });
        }

        const newComment = await prisma.comment.create({
            data: {
                blog_post: { connect: { id: blog_post_id } }, // Correctly connecting to the blog post
                user: { connect: { id: userId } } , // Correctly connecting to the user
                content,
                ...(parent_id && { parent: { connect: { id: parent_id } } })
            },
        });

        res.status(201).json(newComment);
      } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Failed to create comment." });
      }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
