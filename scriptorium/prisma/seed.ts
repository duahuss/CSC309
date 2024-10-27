import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      first_name: 'Eren',
      last_name: 'Yeager',
      //username: 'attacktitan',
      email: 'eren.yeager@example.com',
      password: 'freedom', 
      avatar: 'path/to/avatar1.png',
      phone_number: '123-456-7890',
    },
  });

  const template1 = await prisma.template.create({
    data: {
      title: 'Hello World in Python',
      code: 'print("Hello, World!")',
      language: 'Python',
      description: 'A simple hello world template',
      tags: ['hello', 'world', 'python'],
      author: {
        connect: { id: user1.id },
      },
    },
  });

  console.log({ user1, template1 });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
