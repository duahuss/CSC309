export default async function handler(req, res) {
    const { id } = req.query;
    const userId = req.user.id;
    if (req.method === 'PATCH') {
      const { title, explanation, tags, content } = req.body;
      const userId = req.user.id;
  
      try {
        const template = await prisma.template.updateMany({
          where: { id: parseInt(id), userId },
          data: { title, explanation, tags, content },
        });
        res.status(200).json(template);
      } catch (error) {
        res.status(500).json({ error: 'Unable to edit template' });
      }
    } else if (req.method === 'DELETE') {
      try {
        await prisma.template.deleteMany({
          where: { id: parseInt(id), userId },
        });
        res.status(200).json({ message: 'Template deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Unable to delete template' });
      }
    } 
    else {
      res.setHeader('Allow', ['PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }