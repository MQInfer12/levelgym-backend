import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/almacen", async (req, res) => {
  try {
    const almacen = await prisma.almacen.findMany({
      include: {
        producto: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });
    res.json({
      data: almacen,
      message: "Datos del almacen obtenidos correctamente",
    });
  } catch (error) {
    res.sta(500).json({
      message: "Error al obtener los datos del almacen",
      error: error.message,
    });
  }
});
app.post("/almacen", async (req, res) => {
  try {
    const almacen = await prisma.almacen.create({
      data: {
        ...req.body,
        empleadoId: req.user.id,
      },
    });
    await prisma.producto.update({
      where: {
        id: Number(req.body.productoId),
      },
      data: {
        cantidad: {
          increment: Number(req.body.cantidadAumentada),
        },
      },
    });
    res.json({
      data: almacen,
      message: "Datos agregados al almacen correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar datos al almacen",
      error: error.message,
    });
  }
});
app.put("/almacen/:id", async (req, res) => {
  try {
    const almacen = await prisma.almacen.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: almacen,
      message: "Dato editado del almacen correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al editar datos del almacen",
      error: error.message,
    });
  }
});
app.delete("/almacen/:id", async (req, res) => {
  try {
    const almacen = await prisma.almacen.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: almacen,
      message: "Dato eliminado de almacen correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar datos del almacen",
      error: error.message,
    });
  }
});

export default app;
