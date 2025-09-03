import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import prisma from "./prisma"

const app = express()

app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())

app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

export default app;