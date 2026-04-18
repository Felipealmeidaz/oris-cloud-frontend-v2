/**
 * Seed do banco Oris Cloud.
 *
 * Popula as tabelas de catalogo de produto:
 *  - 9 planos vCPU: 4/8/16 vCPUs × 1/7/30 dias
 *  - 3 opcoes de disco: 256GB (padrao), 512GB, 1TB
 *  - Stock inicial: 10 VMs disponiveis
 *  - 1 Plan legado pra fallback de /api/payment/create
 *
 * Executa via: `pnpm exec prisma db seed` (configurado no package.json).
 *
 * Idempotente: usa upsert em todas as inserções, pode rodar múltiplas vezes
 * sem duplicar dados.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface VCpuPlanSeed {
  id: string;
  name: string;
  vCpus: number;
  ramGB: number;
  duration: string;
  days: number;
  price: number;
}

// Tiers da Oris: Basico (g4dn.xlarge), Pro (g4dn.2xlarge), Ultra (g4dn.4xlarge)
const VCPU_PLANS: VCpuPlanSeed[] = [
  // 4 vCPUs / 16GB RAM (g4dn.xlarge)
  { id: "vcpu_4_1d",  name: "Basico Diario",    vCpus: 4,  ramGB: 16, duration: "Diario",  days: 1,  price: 15.0 },
  { id: "vcpu_4_7d",  name: "Basico Semanal",   vCpus: 4,  ramGB: 16, duration: "Semanal", days: 7,  price: 80.0 },
  { id: "vcpu_4_30d", name: "Basico Mensal",    vCpus: 4,  ramGB: 16, duration: "Mensal",  days: 30, price: 280.0 },
  // 8 vCPUs / 32GB RAM (g4dn.2xlarge)
  { id: "vcpu_8_1d",  name: "Pro Diario",       vCpus: 8,  ramGB: 32, duration: "Diario",  days: 1,  price: 25.0 },
  { id: "vcpu_8_7d",  name: "Pro Semanal",      vCpus: 8,  ramGB: 32, duration: "Semanal", days: 7,  price: 140.0 },
  { id: "vcpu_8_30d", name: "Pro Mensal",       vCpus: 8,  ramGB: 32, duration: "Mensal",  days: 30, price: 480.0 },
  // 16 vCPUs / 64GB RAM (g4dn.4xlarge)
  { id: "vcpu_16_1d",  name: "Ultra Diario",    vCpus: 16, ramGB: 64, duration: "Diario",  days: 1,  price: 45.0 },
  { id: "vcpu_16_7d",  name: "Ultra Semanal",   vCpus: 16, ramGB: 64, duration: "Semanal", days: 7,  price: 260.0 },
  { id: "vcpu_16_30d", name: "Ultra Mensal",    vCpus: 16, ramGB: 64, duration: "Mensal",  days: 30, price: 900.0 },
];

interface DiskAddonSeed {
  id: string;
  name: string;
  sizeGB: number;
  price: number;
}

const DISK_ADDONS: DiskAddonSeed[] = [
  { id: "disk_256", name: "256GB (Padrao)", sizeGB: 256,  price: 0.0 },
  { id: "disk_512", name: "512GB",          sizeGB: 512,  price: 20.0 },
  { id: "disk_1tb", name: "1TB",            sizeGB: 1024, price: 40.0 },
];

async function main() {
  console.log("Seed iniciado");

  // 1. Plan legado (fallback do /api/payment/create)
  await prisma.plan.upsert({
    where: { name: "Basico" },
    update: { price: 280.0, duration: "Mensal", active: true },
    create: {
      id: "plan_basic_monthly",
      name: "Basico",
      price: 280.0,
      duration: "Mensal",
      active: true,
    },
  });
  console.log("  ✓ Plan legado Basico");

  // 2. vcpu_plans
  for (const plan of VCPU_PLANS) {
    await prisma.vCpuPlan.upsert({
      where: { vCpus_days: { vCpus: plan.vCpus, days: plan.days } },
      update: {
        name: plan.name,
        ramGB: plan.ramGB,
        duration: plan.duration,
        price: plan.price,
        active: true,
      },
      create: { ...plan, active: true },
    });
  }
  console.log(`  ✓ ${VCPU_PLANS.length} vcpu_plans (4/8/16 vCPUs × 1/7/30 dias)`);

  // 3. disk_addons
  for (const addon of DISK_ADDONS) {
    await prisma.diskAddon.upsert({
      where: { name: addon.name },
      update: { sizeGB: addon.sizeGB, price: addon.price, active: true },
      create: { ...addon, active: true },
    });
  }
  console.log(`  ✓ ${DISK_ADDONS.length} disk_addons (256/512/1024 GB)`);

  // 4. Stock inicial: 10 VMs disponiveis
  await prisma.stock.upsert({
    where: { id: "stock_main" },
    update: { total: 10, available: 10, reserved: 0 },
    create: { id: "stock_main", total: 10, available: 10, reserved: 0 },
  });
  console.log("  ✓ Stock inicial (10/10/0)");

  console.log("Seed concluido com sucesso");
}

main()
  .catch((err) => {
    console.error("Seed falhou:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
