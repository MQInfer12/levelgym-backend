import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const app = express();
const prisma = new PrismaClient();

app.get("/admin", async (req, res) => {
  try {
    let empleado = await prisma.empleado.create({
      data: {
        nombre: "jose",
        password: await bcrypt.hash(req.body.password, 10),
        usuario: "jose",
        turno: "Tarde",
      },
    });
    res.json({
      data: empleado,
      message: "Empleado agregado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear empleado",
      error: error.message,
    });
  }
});

app.get("/empleado", async (req, res) => {
  try {
    const empleado = await prisma.empleado.findMany({
      select: {
        id: true,
        nombre: true,
        usuario: true,
        turno: true,
        activo: true,
      },
    });
    res.json({
      data: empleado,
      message: "Empleado obtenido correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener empleado",
      error: error.message,
    });
  }
});

app.post("/empleado", async (req, res) => {
  try {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    let empleado = await prisma.empleado.create({
      data: {
        ...req.body,
        password: hashedPassword,
      },
    });
    res.json({
      data: empleado,
      message: "Empleado agregado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear empleado",
      error: error.message,
    });
  }
});
app.put("/empleado/:id", async (req, res) => {
  try {
    const empleado = await prisma.empleado.update({
      where: {
        id: Number(req.params.id),
      },
      data: req.body,
    });
    res.json({
      data: empleado,
      message: "Empleado actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar empleado",
      error: error.message,
    });
  }
});
app.delete("/empleado/:id", async (req, res) => {
  try {
    const empleado = await prisma.empleado.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.json({
      data: empleado,
      message: "Empleado delete correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar empleado",
      error: error.message,
    });
  }
});

export default app;
