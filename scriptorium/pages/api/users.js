import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const users = await prisma.user.findMany();
      res.status(200).json(users);
      break;

    case 'POST':
      const { first_name, last_name, email, password, phone_number, avatar, role } = req.body;
      try {
        const newUser = await prisma.user.create({
          data: {
            first_name,
            last_name,
            email,
            password,
            phone_number,
            avatar,
            role,
          },
        });
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ error: 'Error creating user.' });
      }
      break;

    case 'PUT':
      const { id, ...updateData } = req.body;

      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
        });
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: 'Error updating user.' });
      }
      break;

    case 'DELETE':
      const { userId } = req.body;
      try {
        await prisma.user.delete({
          where: { id: userId },
        });
        res.status(204).end(); // currently no content response for successful deletion (worry abt later)
      } catch (error) {
        res.status(500).json({ error: 'Error deleting user.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
