import { PrismaClient, AdminRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@meddiscover.de'
  let passwordHash = process.env.ADMIN_PASSWORD_HASH

  // If no hash provided, generate one from a default (only for development)
  if (!passwordHash || passwordHash === '<generate-with-bcrypt>') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_PASSWORD_HASH must be set in production!')
    }
    console.log('⚠️  No ADMIN_PASSWORD_HASH set, using development default')
    passwordHash = await bcrypt.hash('DevPassword123!', 12)
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'System Administrator',
        role: AdminRole.SUPER_ADMIN,
        isActive: true
      }
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
