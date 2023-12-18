import express from "express";
import { PrismaClient } from "@prisma/client";
const app = express();
const prisma = new PrismaClient();

app.post("/asistencia/:id", async (req, res) => {
  const ultimaAsistencia = await prisma.asistencia.findMany({
    where: {
      inscripcionId: Number(req.params.id),
    },
    orderBy: {
      id: "desc",
    },
    include: {
      inscripcion: true,
    },
    take: 1,
  });

  if (ultimaAsistencia.length) {
    const asistencia = ultimaAsistencia[0];

    /* COMPROBAR SI YA NO LE QUEDAN DÍAS */
    if (asistencia.inscripcion.diasRestantes === 0) {
      return res.json({
        status: 2,
        message: "Al cliente ya no le quedan días restantes",
      });
    }

    /* COMPROBAR LA FECHA LÍMITE */
    const limite = new Date(asistencia.inscripcion.fechaLimite);
    const ahora = new Date();
    ahora.setTime(0, 0, 0, 0);
    limite.setTime(0, 0, 0, 0);
    if (ahora.getTime() > limite.getTime()) {
      return res.json({
        status: 2,
        message: "Ya pasó la fecha límite del cliente",
      });
    }

    /* COMPROBAR SI ASISTIÓ HOY */
    const fecha = new Date(asistencia.fecha);
    const hoy = new Date();
    if (
      fecha.getDate() === hoy.getDate() &&
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    ) {
      return res.json({
        status: 3,
        message: "El cliente ya asistió hoy",
      });
    }
  }

  await prisma.asistencia.create({
    data: {
      inscripcionId: Number(req.params.id),
    },
  });

  await prisma.inscripcion.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      diasRestantes: {
        decrement: 1,
      },
    },
  });

  res.json({
    status: 1,
    message: "Asistencia registrada correctamente",
  });
});

export default app;
