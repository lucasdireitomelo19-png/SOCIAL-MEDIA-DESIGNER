import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@brecho.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "brecho123";
const adminName = process.env.ADMIN_NAME ?? "Administrador";

const products = [
  {
    name: "Vestido Floral Vintage",
    description:
      "Vestido midi floral dos anos 90, tecido leve, ótimo para o verão. Peça única garimpada.",
    price: 8900,
    category: "Vestidos",
    size: "M",
    condition: "Seminovo",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
    stock: 1,
  },
  {
    name: "Jaqueta Jeans Oversized",
    description: "Jaqueta jeans lavagem clara, corte oversized, unissex.",
    price: 12000,
    category: "Jaquetas",
    size: "G",
    condition: "Usado",
    images: ["https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800"],
    stock: 1,
  },
  {
    name: "Camisa Social Listrada",
    description: "Camisa social de algodão, listras finas, marca premium.",
    price: 6500,
    category: "Camisas",
    size: "P",
    condition: "Novo com etiqueta",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"],
    stock: 2,
  },
  {
    name: "Bolsa de Couro Retrô",
    description: "Bolsa transversal de couro legítimo, tom caramelo, alça ajustável.",
    price: 15000,
    category: "Acessórios",
    size: null,
    condition: "Seminovo",
    images: ["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800"],
    stock: 1,
  },
  {
    name: "Calça Wide Leg",
    description: "Calça de alfaiataria wide leg, cintura alta, cor bege.",
    price: 9500,
    category: "Calças",
    size: "38",
    condition: "Usado",
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
    stock: 1,
  },
  {
    name: "Tênis Casual Branco",
    description: "Tênis branco clássico, poucos usos, sola em ótimo estado.",
    price: 11000,
    category: "Calçados",
    size: "39",
    condition: "Seminovo",
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"],
    stock: 1,
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: adminName,
    },
  });
  console.log(`Admin pronto: ${adminEmail} / senha inicial: ${adminPassword}`);

  for (const product of products) {
    const slug = slugify(product.name);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        ...product,
        slug,
        images: JSON.stringify(product.images),
      },
    });
  }
  console.log(`${products.length} produtos de exemplo garantidos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
