import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const entries = await prisma.dailyEntry.findMany({ orderBy: { date: "desc" } });
  res.json(entries);
});

router.post("/", async (req: Request, res: Response) => {
  const { date, animalName, animalType, quantity, rate, totalAmount, notes } =
    req.body as {
      date: string; animalName: string; animalType: string;
      quantity: number; rate: number; totalAmount: number; notes?: string;
    };
  const entry = await prisma.dailyEntry.create({
    data: { date, animalName, animalType, quantity, rate, totalAmount, notes },
  });
  res.status(201).json(entry);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { date, animalName, animalType, quantity, rate, totalAmount, notes } =
    req.body as {
      date: string; animalName: string; animalType: string;
      quantity: number; rate: number; totalAmount: number; notes?: string;
    };
  const entry = await prisma.dailyEntry.update({
    where: { id: req.params.id },
    data:  { date, animalName, animalType, quantity, rate, totalAmount, notes },
  });
  res.json(entry);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.dailyEntry.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
