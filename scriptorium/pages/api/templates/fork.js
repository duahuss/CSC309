import { getSession } from 'next-auth/react';
import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session || req.method !== 'POST') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { title, code, description, tags, originalTemplateId } = req.body;

  if (!title || !code || !description) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newTemplate = await prisma.template.create({
      data: {
        title: title,
        code: code,
        description: `${description} (Forked from Template ID: ${originalTemplateId})`,
        tags: { connect: tags.map(tag => ({ id: tag.id })) },  // Assumes `tags` are already selected
        author: { connect: { id: session.user.id } },
        forkedFromId: originalTemplateId,  // Assuming a `forkedFromId` field in your model
      },
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fork template', error });
  }
}
