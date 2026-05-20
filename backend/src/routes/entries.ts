import { Router, Response } from "express";
import { prisma } from "../db/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  const entries = await prisma.dailyEntry.findMany({
    where: { phone: req.phone },
    orderBy: { date: "desc" },
  });
  res.json(entries);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const { date, animalName, animalType, session, quantity, rate, totalAmount, notes } =
    req.body as {
      date: string; animalName: string; animalType: string; session: string;
      quantity: number; rate: number; totalAmount: number; notes?: string;
    };
  const entry = await prisma.dailyEntry.create({
    data: { phone: req.phone!, date, animalName, animalType, session: session ?? "morning", quantity, rate, totalAmount, notes },
  });
  res.status(201).json(entry);
});

router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { date, animalName, animalType, session, quantity, rate, totalAmount, notes } =
    req.body as {
      date: string; animalName: string; animalType: string; session: string;
      quantity: number; rate: number; totalAmount: number; notes?: string;
    };
  const entry = await prisma.dailyEntry.update({
    where: { id: req.params.id, phone: req.phone },
    data:  { date, animalName, animalType, session: session ?? "morning", quantity, rate, totalAmount, notes },
  });
  res.json(entry);
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await prisma.dailyEntry.delete({ where: { id: req.params.id, phone: req.phone } });
  res.json({ success: true });
});

export default router;
