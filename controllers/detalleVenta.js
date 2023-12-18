import express from "express";
import { PrismaClient } from "@prisma/client"
const app = express();
const prisma = new PrismaClient();

app.get("/detalleVenta", async (req,res) => {
  try {
    const detalleVenta = await prisma.detalleVenta.findMany({});
    res.json({
      data: detalleVenta,
      message: "Detalle venta obtenido correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener detalle de la venta", error: error.message
    })
  }
})
app.post("/detalleVenta", async (req, res) => {
  try {
    const detalleVenta = await prisma.detalleVenta.create({
      data: req.body
    })
    res.json({
      data: detalleVenta,
      message: "Detalle de la venta creado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el detalle de la venta",
      error: error.message
    })
  }
})


export default app;