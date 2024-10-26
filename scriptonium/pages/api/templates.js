import { prisma } from '@prisma/client';


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, explanation, tags, content } = req.body;
    const userId = req.user.id; // Assume authenticated user ID is in req.user

    try {
      const newTemplate = await prisma.template.create({
        data: {
          title,
          explanation,
          tags,
          content,
          userId,
        },
      });
      res.status(201).json(newTemplate);
    } catch (error) {
      res.status(500).json({ error: 'Unable to create template' });
    }
  } else if (req.method === 'GET') {
    const userId = req.user.id; // Assume authenticated user ID is in req.user
    const { search, user } = req.query;

    const whereClause = {
      userId: user === 'me' ? userId : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { explanation: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ]
        : undefined,
    };

    try {
      const templates = await prisma.template.findMany({
        where: whereClause,
      });
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Unable to retrieve templates' });
    }
  } 
  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
