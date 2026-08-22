import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definido nas variáveis de ambiente.");
}
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "Roupas Femininas", slug: "roupas-femininas" },
    { name: "Roupas Masculinas", slug: "roupas-masculinas" },
    { name: "Calçados", slug: "calcados" },
    { name: "Acessórios", slug: "acessorios" },
    { name: "Bolsas", slug: "bolsas" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const roupasFemininas = await prisma.category.findUniqueOrThrow({
    where: { slug: "roupas-femininas" },
  });
  const roupasMasculinas = await prisma.category.findUniqueOrThrow({
    where: { slug: "roupas-masculinas" },
  });
  const calcados = await prisma.category.findUniqueOrThrow({ where: { slug: "calcados" } });
  const acessorios = await prisma.category.findUniqueOrThrow({ where: { slug: "acessorios" } });
  const bolsas = await prisma.category.findUniqueOrThrow({ where: { slug: "bolsas" } });

  const products = [
    {
      name: "Vestido Midi Floral",
      slug: "vestido-midi-floral",
      description:
        "Vestido midi estampado, tecido leve, ótimo estado. Peça única garimpada para quem ama um look romântico.",
      price: 12900,
      size: "M",
      brand: "Farm",
      condition: "SEMINOVO" as const,
      categoryId: roupasFemininas.id,
      featured: true,
      image: "/placeholders/vestido.svg",
    },
    {
      name: "Jaqueta Jeans Oversized",
      slug: "jaqueta-jeans-oversized",
      description: "Jaqueta jeans clássica, corte oversized, lavagem média. Combina com tudo.",
      price: 14900,
      size: "G",
      brand: "Levi's",
      condition: "USADO" as const,
      categoryId: roupasMasculinas.id,
      featured: true,
      image: "/placeholders/jaqueta.svg",
    },
    {
      name: "Calça Alfaiataria Preta",
      slug: "calca-alfaiataria-preta",
      description: "Calça de alfaiataria com caimento reto, cintura alta. Poucas vezes usada.",
      price: 9900,
      size: "38",
      brand: "Zara",
      condition: "SEMINOVO" as const,
      categoryId: roupasFemininas.id,
      featured: false,
      image: "/placeholders/calca.svg",
    },
    {
      name: "Camisa Social Listrada",
      slug: "camisa-social-listrada",
      description: "Camisa social de algodão, listras finas, ideal para o dia a dia ou trabalho.",
      price: 7900,
      size: "P",
      brand: "Aramis",
      condition: "NOVO_COM_ETIQUETA" as const,
      categoryId: roupasMasculinas.id,
      featured: false,
      image: "/placeholders/camisa.svg",
    },
    {
      name: "Tênis Casual Branco",
      slug: "tenis-casual-branco",
      description: "Tênis branco básico, solado em boas condições, poucos sinais de uso.",
      price: 15900,
      size: "39",
      brand: "Vans",
      condition: "USADO" as const,
      categoryId: calcados.id,
      featured: true,
      image: "/placeholders/tenis.svg",
    },
    {
      name: "Bolsa Transversal Couro",
      slug: "bolsa-transversal-couro",
      description: "Bolsa pequena transversal em couro legítimo, alça ajustável.",
      price: 11900,
      size: "Único",
      brand: "Schutz",
      condition: "SEMINOVO" as const,
      categoryId: bolsas.id,
      featured: true,
      image: "/placeholders/bolsa.svg",
    },
    {
      name: "Saia Midi Plissada",
      slug: "saia-midi-plissada",
      description: "Saia midi plissada, tecido fluido, ótima para compor looks de trabalho.",
      price: 8900,
      size: "P",
      brand: "C&A",
      condition: "SEMINOVO" as const,
      categoryId: roupasFemininas.id,
      featured: false,
      image: "/placeholders/saia.svg",
    },
    {
      name: "Cinto de Couro Trançado",
      slug: "cinto-couro-trancado",
      description: "Cinto de couro trançado, fivela metálica, tamanho ajustável.",
      price: 4900,
      size: "Único",
      brand: null,
      condition: "USADO" as const,
      categoryId: acessorios.id,
      featured: false,
      image: "/placeholders/acessorio.svg",
    },
  ];

  for (const product of products) {
    const { image, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...data,
        images: {
          create: [{ url: image, position: 0 }],
        },
      },
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@renovebrecho.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "TrocarSenha123!";

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail} / senha: ${adminPassword} (troque após o primeiro login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
