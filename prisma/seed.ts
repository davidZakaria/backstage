import { PrismaClient, UserRole, OrderStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash,
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      passwordHash: customerHash,
      name: "Customer",
      role: UserRole.CUSTOMER,
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: customer.id,
      line1: "1 Tahrir Square",
      city: "Cairo",
      governorate: "Cairo",
      phone: "+201000000000",
      isDefault: true,
    },
  });

  const zone = await prisma.shippingZone.upsert({
    where: { slug: "cairo" },
    update: {},
    create: {
      nameEn: "Greater Cairo",
      nameAr: "القاهرة الكبرى",
      slug: "cairo",
      sortOrder: 0,
    },
  });

  await prisma.shippingRateRule.upsert({
    where: { id: "seed-rule-cairo" },
    update: {},
    create: {
      id: "seed-rule-cairo",
      zoneId: zone.id,
      labelEn: "Standard furniture delivery",
      labelAr: "توصيل أثاث قياسي",
      feeCents: 15000,
      sortOrder: 0,
    },
  });

  const catLiving = await prisma.category.upsert({
    where: { slug: "living" },
    update: {},
    create: {
      nameEn: "Living",
      nameAr: "معيشة",
      slug: "living",
      sortOrder: 0,
    },
  });

  const catBedroom = await prisma.category.upsert({
    where: { slug: "bedroom" },
    update: {},
    create: {
      nameEn: "Bedroom",
      nameAr: "غرفة النوم",
      slug: "bedroom",
      sortOrder: 1,
    },
  });

  const catDining = await prisma.category.upsert({
    where: { slug: "dining" },
    update: {},
    create: {
      nameEn: "Dining",
      nameAr: "طعام",
      slug: "dining",
      sortOrder: 2,
    },
  });

  const catLighting = await prisma.category.upsert({
    where: { slug: "lighting" },
    update: {},
    create: {
      nameEn: "Lighting",
      nameAr: "إضاءة",
      slug: "lighting",
      sortOrder: 3,
    },
  });

  const oak = await prisma.material.upsert({
    where: { slug: "oak" },
    update: {},
    create: { nameEn: "Oak", nameAr: "بلوط", slug: "oak" },
  });
  const walnut = await prisma.material.upsert({
    where: { slug: "walnut" },
    update: {},
    create: { nameEn: "Walnut", nameAr: "جوز", slug: "walnut" },
  });
  const oakWood = await prisma.material.upsert({
    where: { slug: "engineered-wood" },
    update: {},
    create: { nameEn: "Engineered wood", nameAr: "خشب مصنع", slug: "engineered-wood" },
  });
  const marble = await prisma.material.upsert({
    where: { slug: "marble" },
    update: {},
    create: { nameEn: "Marble", nameAr: "رخام", slug: "marble" },
  });
  const brass = await prisma.material.upsert({
    where: { slug: "brass" },
    update: {},
    create: { nameEn: "Brass", nameAr: "نحاس", slug: "brass" },
  });

  const sand = await prisma.color.upsert({
    where: { slug: "sand" },
    update: {},
    create: { nameEn: "Sand", nameAr: "رملي", slug: "sand" },
  });
  const charcoal = await prisma.color.upsert({
    where: { slug: "charcoal" },
    update: {},
    create: { nameEn: "Charcoal", nameAr: "فحمي", slug: "charcoal" },
  });
  const sage = await prisma.color.upsert({
    where: { slug: "sage" },
    update: {},
    create: { nameEn: "Sage", nameAr: "مريمية", slug: "sage" },
  });
  const ivory = await prisma.color.upsert({
    where: { slug: "ivory" },
    update: {},
    create: { nameEn: "Ivory", nameAr: "عاجي", slug: "ivory" },
  });

  const sizeM = await prisma.size.upsert({
    where: { slug: "180cm" },
    update: {},
    create: { nameEn: '180 cm', nameAr: "١٨٠ سم", slug: "180cm" },
  });
  const sizeL = await prisma.size.upsert({
    where: { slug: "220cm" },
    update: {},
    create: { nameEn: '220 cm', nameAr: "٢٢٠ سم", slug: "220cm" },
  });
  const sizeS = await prisma.size.upsert({
    where: { slug: "160cm" },
    update: {},
    create: { nameEn: '160 cm', nameAr: "١٦٠ سم", slug: "160cm" },
  });
  const sizeXL = await prisma.size.upsert({
    where: { slug: "200cm" },
    update: {},
    create: { nameEn: '200 cm', nameAr: "٢٠٠ سم", slug: "200cm" },
  });

  const sofa = await prisma.product.upsert({
    where: { slug: "aura-sofa" },
    update: {
      titleEn: "Aura Modular Sofa",
      titleAr: "أريكة أورا المعيارية",
      descriptionEn: "Low profile, deep seat, architectural lines. Built to order in Cairo.",
      descriptionAr: "مقعد عميق وخطوط معمارية. تُصنع حسب الطلب.",
      published: true,
      featured: true,
      primaryCategoryId: catLiving.id,
    },
    create: {
      slug: "aura-sofa",
      titleEn: "Aura Modular Sofa",
      titleAr: "أريكة أورا المعيارية",
      descriptionEn: "Low profile, deep seat, architectural lines. Built to order in Cairo.",
      descriptionAr: "مقعد عميق وخطوط معمارية. تُصنع حسب الطلب.",
      metaTitleEn: "Aura Modular Sofa | Backstage",
      metaTitleAr: "أريكة أورا | باكستيج",
      published: true,
      featured: true,
      primaryCategoryId: catLiving.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: { productId: sofa.id, categoryId: catLiving.id },
    },
    update: {},
    create: { productId: sofa.id, categoryId: catLiving.id },
  });

  const v1 = await prisma.productVariant.upsert({
    where: { sku: "AURA-OAK-SAND-180" },
    update: {},
    create: {
      productId: sofa.id,
      sku: "AURA-OAK-SAND-180",
      materialId: oak.id,
      colorId: sand.id,
      sizeId: sizeM.id,
      priceCents: 4200000,
      compareCents: 4500000,
      enabled: true,
    },
  });

  const v2 = await prisma.productVariant.upsert({
    where: { sku: "AURA-WAL-CHAR-220" },
    update: {},
    create: {
      productId: sofa.id,
      sku: "AURA-WAL-CHAR-220",
      materialId: walnut.id,
      colorId: charcoal.id,
      sizeId: sizeL.id,
      priceCents: 5400000,
      enabled: true,
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: v1.id },
    update: { quantityOnHand: 5 },
    create: { variantId: v1.id, quantityOnHand: 5 },
  });
  await prisma.inventory.upsert({
    where: { variantId: v2.id },
    update: { quantityOnHand: 3 },
    create: { variantId: v2.id, quantityOnHand: 3 },
  });

  await prisma.media.upsert({
    where: { id: "seed-media-sofa-1" },
    update: {},
    create: {
      id: "seed-media-sofa-1",
      productId: sofa.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
      sortOrder: 0,
      altEn: "Modular sofa in warm neutral room",
      altAr: "أريكة معيارية بغرفة دافئة",
    },
  });

  const table = await prisma.product.upsert({
    where: { slug: "lumen-dining-table" },
    update: {
      primaryCategoryId: catDining.id,
    },
    create: {
      slug: "lumen-dining-table",
      titleEn: "Lumen Dining Table",
      titleAr: "طاولة طعام لومن",
      descriptionEn: "Matte ceramic top, sculpted base. Seats six comfortably.",
      descriptionAr: "سطح سيراميك مطفي وقاعدة منحوتة. تتسع لستة أشخاص.",
      published: true,
      primaryCategoryId: catDining.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: { productId: table.id, categoryId: catDining.id },
    },
    update: {},
    create: { productId: table.id, categoryId: catDining.id },
  });

  await prisma.productCategory.deleteMany({
    where: {
      productId: table.id,
      categoryId: catLiving.id,
    },
  });

  const vt = await prisma.productVariant.upsert({
    where: { sku: "LUMEN-EW-SAND-220" },
    update: {},
    create: {
      productId: table.id,
      sku: "LUMEN-EW-SAND-220",
      materialId: oakWood.id,
      colorId: sand.id,
      sizeId: sizeL.id,
      priceCents: 3100000,
      enabled: true,
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: vt.id },
    update: { quantityOnHand: 8 },
    create: { variantId: vt.id, quantityOnHand: 8 },
  });

  await prisma.media.upsert({
    where: { id: "seed-media-table-1" },
    update: {},
    create: {
      id: "seed-media-table-1",
      productId: table.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80",
      sortOrder: 0,
      altEn: "Dining table with sculptural base",
      altAr: "طاولة طعام بقاعدة نحتية",
    },
  });

  const bedside = await prisma.product.upsert({
    where: { slug: "stria-bedside" },
    update: {
      primaryCategoryId: catBedroom.id,
      featured: true,
    },
    create: {
      slug: "stria-bedside",
      titleEn: "Stria Bedside Table",
      titleAr: "طاولة سرير ستريا",
      descriptionEn: "Compact marble top and oak frame — soft-close drawer, cable channel in back.",
      descriptionAr: "سطح رخامي وإطار بلوط — درج بإغلاق هادئ، ممر كابلات من الخلف.",
      metaTitleEn: "Stria Bedside | Backstage",
      metaTitleAr: "طاولة ستريا | باكستيج",
      published: true,
      featured: true,
      primaryCategoryId: catBedroom.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: { productId: bedside.id, categoryId: catBedroom.id },
    },
    update: {},
    create: { productId: bedside.id, categoryId: catBedroom.id },
  });

  const vb1 = await prisma.productVariant.upsert({
    where: { sku: "STRIA-MAR-SAG-160" },
    update: {},
    create: {
      productId: bedside.id,
      sku: "STRIA-MAR-SAG-160",
      materialId: marble.id,
      colorId: sage.id,
      sizeId: sizeS.id,
      priceCents: 1890000,
      compareCents: 2100000,
      enabled: true,
    },
  });
  const vb2 = await prisma.productVariant.upsert({
    where: { sku: "STRIA-OAK-IVY-160" },
    update: {},
    create: {
      productId: bedside.id,
      sku: "STRIA-OAK-IVY-160",
      materialId: oak.id,
      colorId: ivory.id,
      sizeId: sizeS.id,
      priceCents: 1650000,
      enabled: true,
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: vb1.id },
    update: { quantityOnHand: 12 },
    create: { variantId: vb1.id, quantityOnHand: 12 },
  });
  await prisma.inventory.upsert({
    where: { variantId: vb2.id },
    update: { quantityOnHand: 9 },
    create: { variantId: vb2.id, quantityOnHand: 9 },
  });

  await prisma.media.upsert({
    where: { id: "seed-media-bedside-1" },
    update: {},
    create: {
      id: "seed-media-bedside-1",
      productId: bedside.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
      sortOrder: 0,
      altEn: "Minimal bedside table with lamp",
      altAr: "طاولة سرير بسيطة مع مصباح",
    },
  });

  const lamp = await prisma.product.upsert({
    where: { slug: "helio-floor-lamp" },
    update: {
      primaryCategoryId: catLighting.id,
      featured: true,
    },
    create: {
      slug: "helio-floor-lamp",
      titleEn: "Helio Floor Lamp",
      titleAr: "مصباح هيليو الأرضي",
      descriptionEn: "Dim-able LED arc with brushed brass and linen shade. Weighted base for stability.",
      descriptionAr: "قوس LED قابل للتعتيم بنحاس مصقول وظلالة كتان. قاعدة مثقلة للثبات.",
      metaTitleEn: "Helio Floor Lamp | Backstage",
      metaTitleAr: "أرضية هيليو | باكستيج",
      published: true,
      featured: true,
      primaryCategoryId: catLighting.id,
    },
  });

  await prisma.productCategory.upsert({
    where: {
      productId_categoryId: { productId: lamp.id, categoryId: catLighting.id },
    },
    update: {},
    create: { productId: lamp.id, categoryId: catLighting.id },
  });

  const vl1 = await prisma.productVariant.upsert({
    where: { sku: "HELIO-BRS-IVY-180" },
    update: {},
    create: {
      productId: lamp.id,
      sku: "HELIO-BRS-IVY-180",
      materialId: brass.id,
      colorId: ivory.id,
      sizeId: sizeM.id,
      priceCents: 1320000,
      enabled: true,
    },
  });
  const vl2 = await prisma.productVariant.upsert({
    where: { sku: "HELIO-BRS-SAG-200" },
    update: {},
    create: {
      productId: lamp.id,
      sku: "HELIO-BRS-SAG-200",
      materialId: brass.id,
      colorId: sage.id,
      sizeId: sizeXL.id,
      priceCents: 1380000,
      enabled: true,
    },
  });

  await prisma.inventory.upsert({
    where: { variantId: vl1.id },
    update: { quantityOnHand: 15 },
    create: { variantId: vl1.id, quantityOnHand: 15 },
  });
  await prisma.inventory.upsert({
    where: { variantId: vl2.id },
    update: { quantityOnHand: 11 },
    create: { variantId: vl2.id, quantityOnHand: 11 },
  });

  await prisma.media.upsert({
    where: { id: "seed-media-lamp-1" },
    update: {},
    create: {
      id: "seed-media-lamp-1",
      productId: lamp.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80",
      sortOrder: 0,
      altEn: "Arc floor lamp in living space",
      altAr: "مصباح أرضي بقوس في غرفة المعيشة",
    },
  });

  await prisma.backstageArticle.upsert({
    where: { slug: "how-we-price" },
    update: {},
    create: {
      slug: "how-we-price",
      titleEn: "How we price",
      titleAr: "كيف نحدد الأسعار",
      bodyEn:
        "Transparent costing: materials, craftspeople hours, finishing, and logistics. No surprise markups at checkout.",
      bodyAr:
        "تسعير شفاف: المواد وساعات الحرفيين والتشطيب واللوجستيات. دون هامش مفاجئ عند الدفع.",
      published: true,
      sortOrder: 0,
    },
  });

  const proj = await prisma.interiorProject.upsert({
    where: { slug: "jura-penthouse" },
    update: {},
    create: {
      slug: "jura-penthouse",
      titleEn: "Jura Penthouse",
      titleAr: "بنتهاوس جورا",
      bodyEn: "Warm neutrals, oak grain, and quiet light. Cairo skyline as backdrop.",
      bodyAr: "محايد دافئ، حبة البلوط، وإضاءة هادئة. أفق القاهرة خلفية.",
      tags: "penthouse,neutral,oak",
      published: true,
      sortOrder: 0,
    },
  });

  await prisma.media.upsert({
    where: { id: "seed-media-project-1" },
    update: {},
    create: {
      id: "seed-media-project-1",
      projectId: proj.id,
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
      sortOrder: 0,
      altEn: "Living room with skyline",
      altAr: "غرفة معيشة مع الأفق",
    },
  });

  await prisma.quizOutcome.upsert({
    where: { key: "sculptural" },
    update: {},
    create: {
      key: "sculptural",
      titleEn: "Sculptural minimalist",
      titleAr: "بسيط نحتي",
      descriptionEn: "You gravitate toward bold silhouettes and quiet palettes.",
      descriptionAr: "تميل إلى الخطوط الجريئة والألوان الهادئة.",
      imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
      sortOrder: 0,
    },
  });

  await prisma.quizOutcome.upsert({
    where: { key: "layered" },
    update: {},
    create: {
      key: "layered",
      titleEn: "Layered warm modern",
      titleAr: "دافئ عصاري بطبقات",
      descriptionEn: "Texture and light matter as much as form.",
      descriptionAr: "الملمس والضوء يهمان مثل الشكل.",
      sortOrder: 1,
    },
  });

  const demoOrder = await prisma.order.upsert({
    where: { id: "seed-order-1" },
    update: {},
    create: {
      id: "seed-order-1",
      userId: customer.id,
      status: OrderStatus.CONFIRMED,
      paymentMethod: PaymentMethod.COD,
      shippingZoneId: zone.id,
      shippingLine1: "1 Tahrir Square",
      shippingCity: "Cairo",
      shippingPhone: "+201000000000",
      subtotalCents: 4200000,
      shippingCents: 15000,
      totalCents: 4215000,
    },
  });

  await prisma.orderLine.deleteMany({ where: { orderId: demoOrder.id } });
  await prisma.orderLine.create({
    data: {
      orderId: demoOrder.id,
      variantId: v1.id,
      quantity: 1,
      unitPriceCents: 4200000,
    },
  });

  await prisma.orderStatusHistory.deleteMany({ where: { orderId: demoOrder.id } });
  await prisma.orderStatusHistory.createMany({
    data: [
      { orderId: demoOrder.id, fromStatus: null, toStatus: OrderStatus.PLACED },
      { orderId: demoOrder.id, fromStatus: OrderStatus.PLACED, toStatus: OrderStatus.CONFIRMED },
    ],
  });

  await prisma.siteSetting.upsert({
    where: { key: "cod_enabled" },
    update: { value: "true" },
    create: { key: "cod_enabled", value: "true" },
  });

  console.log("Seed complete. Admin: admin@example.com / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
