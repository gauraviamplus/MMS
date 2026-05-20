import { Router, Response } from "express";
import { prisma } from "../db/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  const expenses = await prisma.expense.findMany({
    where: { phone: req.phone },
    orderBy: { date: "desc" },
  });
  res.json(expenses);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const { date, category, amount, workerName, note } = req.body as {
    date: string; category: string; amount: number; workerName?: string; note?: string;
  };
  const expense = await prisma.expense.create({
    data: { phone: req.phone!, date, category, amount, workerName, note },
  });
  res.status(201).json(expense);
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { date, category, amount, workerName, note } = req.body as {
    date: string; category: string; amount: number; workerName?: string; note?: string;
  };
  const expense = await prisma.expense.update({
    where: { id: req.params.id, phone: req.phone },
    data:  { date, category, amount, workerName, note },
  });
  res.json(expense);
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await prisma.expense.delete({ where: { id: req.params.id, phone: req.phone } });
  res.json({ success: true });
});

export default router;
