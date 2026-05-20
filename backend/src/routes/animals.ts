import { Router, Request, Response } from "express";
import { prisma } from "../db/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const animals = await prisma.animal.findMany({ orderBy: { createdAt: "asc" } });
  res.json(animals);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, type, age } = req.body as { name: string; type: string; age: number };
  const animal = await prisma.animal.create({ data: { name, type, age } });
  res.status(201).json(animal);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { name, type, age } = req.body as { name: string; type: string; age: number };
  const animal = await prisma.animal.update({
    where: { id: req.params.id },
    data:  { name, type, age },
  });
  res.json(animal);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.animal.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
