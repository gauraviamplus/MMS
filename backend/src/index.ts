import express from "express";
import cors from "cors";
import animalsRouter from "./routes/animals";
import entriesRouter from "./routes/entries";

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() }),
);

app.use("/api/animals", animalsRouter);
app.use("/api/entries", entriesRouter);

app.listen(PORT, () => {
  console.log(`✅  MMS Backend  →  http://localhost:${PORT}`);
  console.log(`    Health:       http://localhost:${PORT}/health`);
  console.log(`    Animals API:  http://localhost:${PORT}/api/animals`);
  console.log(`    Entries API:  http://localhost:${PORT}/api/entries`);
});
