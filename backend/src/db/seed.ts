import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- USERS ---
  const restaurantUser = await prisma.user.create({
    data: {
      name: 'Tasty Treats',
      email: 'restaurant@example.com',
      password: 'hashedpassword123',
      role: Role.RESTAURANT,
      Restaurant: {
        create: {
          name: 'Tasty Treats',
          address: '123 Food Street',
          phone: '9876543210',
        },
      },
    },
    include: { Restaurant: true },
  });

  const ngoUser = await prisma.user.create({
    data: {
      name: 'Helping Hands',
      email: 'ngo@example.com',
      password: 'hashedpassword123',
      role: Role.NGO,
      NGO: {
        create: {
          name: 'Helping Hands NGO',
          address: '456 Kindness Avenue',
          phone: '1234567890',
        },
      },
    },
    include: { NGO: true },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword123',
      role: Role.USER,
    },
  });

  // --- FOOD ITEMS ---
  const pizza = await prisma.foodItem.create({
    data: {
      restaurantId: restaurantUser.Restaurant!.id,
      name: 'Pizza Margherita',
      description: 'Classic cheese pizza',
      price: new Decimal(12.5),
      quantity: 10,
    },
  });

  const pasta = await prisma.foodItem.create({
    data: {
      restaurantId: restaurantUser.Restaurant!.id,
      name: 'Pasta Alfredo',
      description: 'Creamy Alfredo pasta',
      price: new Decimal(9.99),
      quantity: 15,
    },
  });

  // --- ORDER ---
  const order = await prisma.order.create({
    data: {
      userId: ngoUser.id,
      restaurantId: restaurantUser.Restaurant!.id,
      status: OrderStatus.PENDING,
      totalAmount: new Decimal(pizza.price.plus(pasta.price.times(2))), // 1 pizza + 2 pasta
      orderItems: {
        create: [
          {
            foodItemId: pizza.id,
            quantity: 1,
            price: pizza.price,
          },
          {
            foodItemId: pasta.id,
            quantity: 2,
            price: pasta.price,
          },
        ],
      },
    },
    include: { orderItems: true },
  });

  // --- REVIEWS ---
  await prisma.review.create({
    data: {
      userId: normalUser.id,
      restaurantId: restaurantUser.Restaurant!.id,
      foodItemId: pizza.id,
      rating: 5,
      comment: 'Amazing pizza!',
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
