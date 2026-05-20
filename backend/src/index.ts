import express from "express";
import cors from "cors";
import animalsRouter  from "./routes/animals";
import entriesRouter  from "./routes/entries";
import expensesRouter from "./routes/expenses";
import authRouter     from "./routes/auth";
import { initWhatsApp } from "./services/whatsapp";

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() }),
);

app.use("/api/auth",     authRouter);
app.use("/api/animals",  animalsRouter);
app.use("/api/entries",  entriesRouter);
app.use("/api/expenses", expensesRouter);

app.listen(PORT, () => {
  console.log(`✅  MMS Backend  →  http://localhost:${PORT}`);
  console.log(`    Health:        http://localhost:${PORT}/health`);
  console.log(`    Entries API:   http://localhost:${PORT}/api/entries`);
  console.log(`    Expenses API:  http://localhost:${PORT}/api/expenses`);
  initWhatsApp();
});
