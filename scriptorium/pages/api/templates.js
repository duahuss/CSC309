import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (page - 1) * limit;

      // Dynamic filter based on the search term
      const searchFilter = search ? {
        OR: [
          { title: { contains: search} }, // Search in title
          { code: { contains: search } }, // Search in code content
          {
            tags: {
              some: { name: { contains: search } } // Search in tags
            }
          }
        ]
      } : {}; // No search term, so no filter applied

      // Count total templates for pagination (with or without search)
      const totalTemplates = await prisma.template.count({
        where: searchFilter
      });

      // Fetch templates with pagination and optional search filter
      const templates = await prisma.template.findMany({
        where: searchFilter,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          author: {
            select: { username: true }, // Include author username
          },
          tags: true, // Include tags
        },
      });

      // Calculate total pages for pagination
      const totalPages = Math.ceil(totalTemplates / limit);

      // Send response with templates and pagination details
      res.status(200).json({
        templates,
        pagination: {
          totalTemplates,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Error fetching templates" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
