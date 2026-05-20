import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const expenses = await prisma.expense.findMany({ orderBy: { date: "desc" } });
  res.json(expenses);
});

router.post("/", async (req: Request, res: Response) => {
  const { date, category, amount, workerName, note } = req.body as {
    date: string; category: string; amount: number; workerName?: string; note?: string;
  };
  const expense = await prisma.expense.create({
    data: { date, category, amount, workerName, note },
  });
  res.status(201).json(expense);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { date, category, amount, workerName, note } = req.body as {
    date: string; category: string; amount: number; workerName?: string; note?: string;
  };
  const expense = await prisma.expense.update({
    where: { id: req.params.id },
    data:  { date, category, amount, workerName, note },
  });
  res.json(expense);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
