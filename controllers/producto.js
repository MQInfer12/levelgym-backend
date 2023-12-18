import express from "express";
import { PrismaClient } from "@prisma/client"
const app = express();
const prisma = new PrismaClient();

app.get("/producto", async (req,res) => {
  try {
    const producto = await prisma.producto.findMany({});
    res.json({
      data: producto,
      message: "Productos obtenidos correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los productos", error: error.message
    })
  }
})
app.post("/producto", async (req, res) => {
  try {
    const producto = await prisma.producto.create({
      data: req.body
    })
    res.json({
      data: producto,
      message: "Producto creado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear la producto",
      error: error.message
    })
  }
})
app.put("/producto/:id", async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: {
        id: Number(req.params.id)
      },
      data: req.body
    })
    res.json(
      {
        data: producto,
        message: "Producto actualizado correctamente"
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar producto",
      error: error.message
    })
  }
})
app.delete("/producto/:id", async (req, res) => {
  try {
    const producto = await prisma.producto.delete({
      where: {
        id: Number(req.params.id)
      }
    })
    res.json({
      data: producto,
      message: "Producto eliminado correctamente"
    }
    );
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar producto",
      error: error.message
    })
  }
})

export default app;