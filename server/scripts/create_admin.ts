import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@music.app';
  const password = 'admin'; // standard test password
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'admin',
    },
    create: {
      email,
      name: 'Admin',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Admin user created/updated:', admin.email);
  console.log('Password set to: admin');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
