import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/promocion", async (req, res) => {
  try {
    const primeraPromocion = await prisma.promociones.findFirst({});
    res.json({
      data: primeraPromocion,
      message: "Promoción obtenida correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la promoción",
      error: error.message,
    });
  }
});
app.post("/promocion", async (req, res) => {
  try {
    const existingPromocion = await prisma.promociones.findFirst({});

    if (existingPromocion) {
      return res.status(400).json({
        message:
          "Ya existe una promoción. No se permiten múltiples promociones.",
      });
    }
    const nuevaPromocion = await prisma.promociones.create({
      data: req.body,
    });

    res.json({
      data: nuevaPromocion,
      message: "Promoción creada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la promoción",
      error: error.message,
    });
  }
});

app.put("/promocion/:id", async (req, res) => {
  try {
    const promociones = await prisma.promociones.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: promociones,
      message: "promocion actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar promocion",
      error: error.message,
    });
  }
});
app.delete("/promocion/:id", async (req, res) => {
  try {
    const promociones = await prisma.promociones.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: promociones,
      message: "promocion eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar promocion",
      error: error.message,
    });
  }
});

export default app;
