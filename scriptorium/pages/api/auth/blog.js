import { prisma } from "@/prisma/client";
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
    const { title, description, tags, content } = req.body;
  
    // Check if the user is authenticated
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in to create a blog post.' });
    }
  
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      // Create or connect tags
      const tagConnections = tags.map(tag => ({
        where: { name: tag },
        create: { name: tag },
      }));
  
      const newPost = await prisma.blogPost.create({
        data: {
          title,
          description,
          content,
          author_id: userId, // Associate blog post with user ID
          tags: {
            connectOrCreate: tagConnections,
          },
        },
        include: { // Include tags in the response
          tags: true,
        },
      });
  
      res.status(201).json({
        ...newPost,
        username: user.username, // Include username in the response
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: 'Error creating blog post.', details: error.message });
    }
  }
   else if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (page - 1) * limit;
  
      // Build a dynamic filter based on the search term
      const searchFilter = search ? {
        OR: [
          { title: { contains: search } }, // Search in titles
          { content: { contains: search } }, // Search in content
          {
            tags: {
              some: { name: { contains: search } } // Search in tags
            }
          }
        ]
      } : {}; // If no search, use an empty object
  
      // Count total posts for pagination (with or without search)
      const totalPosts = await prisma.blogPost.count({
        where: searchFilter
      });
  
      // Fetch posts with pagination and optional search filter
      const posts = await prisma.blogPost.findMany({
        where: searchFilter,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          author: {
            select: { username: true }, // Include username in the response
          },
          tags: true, // Include tags in the response
          comments: {
            include: {
              user: {
                select: { username: true, avatar: true } // Include user details for comments
              },
              ratings: true // Include ratings for each comment
            }
          },
          ratings: true // Include ratings for the blog post
        },
      });
  
      // Calculate total pages for pagination
      const totalPages = Math.ceil(totalPosts / limit);
  
      // Send response with posts and pagination details
      res.status(200).json({
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "Error fetching blog posts.", details: error.message });
    }
  } else if (req.method === 'PUT') {
    const { id, title, description, tags } = req.body;

    // Check if the user is authenticated
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in to update a blog post.' });
    }

    try {
      const updatedPost = await prisma.blogPost.update({
        where: { id: id },
        data: {
          title,
          description,
          tags: {
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
      });
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "Error updating blog post." });
    }
  } else if (req.method === 'DELETE') {
    // Check if the user is authenticated
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in to delete a blog post.' });
    }

    const { id } = req.body;
    try {
      const postToDelete = await prisma.blogPost.findUnique({ where: { id: id } });
      if (!postToDelete) {
        return res.status(404).json({ error: 'Post not found.' });
      }

      await prisma.blogPost.delete({ where: { id: id } });
      res.status(200).json({ message: `${postToDelete.title} has been deleted.` });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ error: "Error deleting blog post." });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
