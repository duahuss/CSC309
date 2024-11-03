import { prisma } from "@/prisma/client";
//USER STORY:as a vistor i want to modify code
export default async function handler(req, res) {
    if (req.method === 'PUT') {
        // Update the template
        const { title, description, code, tags } = req.body;
        const {id} = req.query;

        try {

            const updatedTemplate = await prisma.template.update({
            where: {
              id: id,
            },
            data: {
              title,
              description,
              code,
              tags: {
                // Handle tags update (assumes you have a relation to a Tag model)
                set: tags.map(tag => ({ name: tag })),
              },
              
            },
          });
    
          res.status(200).json(updatedTemplate);
        } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template.' });
        }
    } else {
        res.setHeader("Allow", [ "PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
