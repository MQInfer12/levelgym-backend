import Express from "express";
import { PrismaClient } from "@prisma/client";
const app = Express();
const prisma = new PrismaClient();

app.get("/inscripcion", async (req, res) => {
  try {
    const inscripcion = await prisma.inscripcion.findMany({
      include: {
        cliente: true,
        paquete: true
      }
    });
    res.json({
      data: inscripcion,
      message: "inscripciones obtenidos correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener inscripcion",
      error: error.message
    })
  }
});

app.get("/inscripcion/:id", async (req, res) => {
  try {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        cliente: true,
        paquete: true
      }
    });
    res.json({
      data: inscripcion,
      message: "inscripcion obtenida correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener inscripcion",
      error: error.message
    })
  }
});

app.post("/inscripcion", async (req, res) => {
  try {
    const paquete = await prisma.paquete.findUnique({
      where: {
        id: req.body.idPaquete
      }
    });
    const inscripcion = await prisma.inscripcion.create({
      data: {
        clienteId: req.body.idCliente,
        paqueteId: req.body.idPaquete,
        tipoPago: req.body.tipoPago,
        descuento: req.body.descuento,
        fechaInicio: req.body.fechaInicio,
        fechaLimite: req.body.fechaLimite,
        total: paquete.precio - req.body.descuento,
        diasRestantes: paquete.dias,
        empleadoId: req.user.id
      }
    });
    res.json({
      data: inscripcion,
      message: "inscripcion agregado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear inscripcion",
      error: error.message
    })
  }
})

app.put("/inscripcion/:id", async (req, res) => {
  try {
    const inscripcion = await prisma.inscripcion.update({
      where: {
        id: Number(req.params.id)
      },
      data: req.body
    })
    res.json({
      data: inscripcion,
      message: "inscripcion actualizado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar inscripcion",
      error: error.message
    })
  }
})

app.delete("/inscripcion/:id", async (req, res) => {
  try {
    const inscripcion = await prisma.inscripcion.delete({
      where: {
        id: Number(req.params.id)
      }
    })
    res.json({
      data: inscripcion,
      message: "inscripcion eliminada"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar inscripcion",
      error: error.message
    })
  }
});

app.post("/inscripcion/:id",async(req,res)=>{
  try {
    const inscripcion=await prisma.inscripcion.findMany({
      where:{
        id:Number(req.params.id)
      }
    })
    res.json({
      data:inscripcion,
      message:"incripcion obtenido correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message:"Error al obtener el inscripcion",
      error:message.error
    })
  }
})

export default app;