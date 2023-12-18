import express from "express"
import { PrismaClient } from "@prisma/client"
const app = express();
const prisma = new PrismaClient();

app.get("/paquete", async (req, res) => {
  try {
    const paquete = await prisma.paquete.findMany({});
    res.json({
      data: paquete,
      message: "paquete obtenido correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al obetener los paquetes",
      error: error.message
    })
  }
})
app.post("/paquete", async (req, res) => {
  try {
    const paquete = await prisma.paquete.create({
      data: req.body
    })
    res.json({
      data: paquete,
      message: "paquete agregado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear paquete",
      error: error.message
    })
  }
})
app.put("/paquete/:id", async (req, res) => {
  try {
    const paquete = await prisma.paquete.update({
      where: {
        id: Number(req.params.id)
      },
      data: req.body
    })
    res.json(
      {
        data: paquete,
        message: "paquete actualizado correctamente"
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar paquete",
      error: error.message
    })
  }
})
app.delete("/paquete/:id", async (req, res) => {
  try {
    const paquete = await prisma.paquete.delete({
      where: {
        id: Number(req.params.id)
      }
    })
    res.json({
      data: paquete,
      message: "paquete delete correctamente"
    }
    );
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar paquete",
      error: error.message
    })
  }
})

export default app;