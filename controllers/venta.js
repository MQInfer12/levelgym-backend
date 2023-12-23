import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.get("/venta", async (req, res) => {
  try {
    const venta = await prisma.venta.findMany({
      include: {
        DetalleVenta: true,
        empleado: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });
    res.json({
      data: venta,
      message: "ventas obtenidas correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las ventas",
      error: error.message,
    });
  }
});
app.get("/venta/:id", async (req, res) => {
  try {
    const venta = await prisma.venta.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        DetalleVenta: {
          include: {
            producto: true,
          },
        },
        empleado: true,
      },
    });
    res.json({
      data: venta,
      message: "venta obtenida correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las venta",
      error: error.message,
    });
  }
});
app.post("/venta", async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        id: {
          in: req.body.productos.map((producto) => producto.id),
        },
      },
    });
    let flag = false;
    req.body.productos.forEach((producto) => {
      const productoExistente = productos.find(
        (prod) => prod.id === producto.id
      );
      if (producto.cantidad > productoExistente.cantidad) {
        flag = true;
        res.json({
          message: "Error",
          error:
            "la cantidad de " +
            productoExistente.nombre +
            " no puede ser mayor a la existente",
        });
      }
    });
    if (flag) return;
    const total = productos.reduce((suma, producto) => {
      const productoVendido = req.body.productos.find(
        (prod) => prod.id === producto.id
      );
      const totalProducto = producto.precio * productoVendido.cantidad;
      suma += totalProducto;
      return suma;
    }, 0);
    const venta = await prisma.venta.create({
      data: {
        empleadoId: req.body.empleado,
        total: total,
        DetalleVenta: {
          createMany: {
            data: req.body.productos.map((producto) => ({
              cantidad: producto.cantidad,
              precioVendido: producto.precioVendido,
              productoId: producto.id,
              total: producto.precioVendido * producto.cantidad,
            })),
          },
        },
      },
    });
    req.body.productos.forEach(async (producto) => {
      await prisma.producto.update({
        where: {
          id: producto.id,
        },
        data: {
          cantidad: {
            decrement: producto.cantidad,
          },
        },
      });
    });
    res.json({
      message: "Vendido correctamente",
      data: venta,
    });
  } catch (e) {
    res.status(500).json({
      message: "Error",
      error: e.message,
    });
  }
});

export default app;
