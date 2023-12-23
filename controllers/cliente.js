import Express from "express";
import { PrismaClient } from "@prisma/client";
const app = Express();
const prisma = new PrismaClient();

app.get("/cliente", async (req, res) => {
  try {
    const cliente = await prisma.cliente.findMany({
      orderBy: {
        id: "desc"
      }
    });
    res.json({
      data: cliente,
      message: "cliente obtenido con correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cliente",
      error: error.message
    })
  }
});


app.post("/cliente", async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({
      data: req.body
    })
    res.json({
      data: cliente,
      message: "cliente agregado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear cliente",
      error: error.message
    })
  }
})

app.put("/cliente/:id", async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: {
        id: Number(req.params.id)
      },
      data: req.body
    })
    res.json({
      data: cliente,
      message: "cliente actualizado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar cliente",
      error: error.message
    })
  }
})

app.delete("/cliente/:id", async (req, res) => {
  try {
    const cliente = await prisma.cliente.delete({
      where: {
        id: Number(req.params.id)
      }
    })
    res.json({
      data: cliente,
      message: "cliente eliminado"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar cliente",
      error: error.message
    })
  }
})
app.post("/cliente/:id",async(req,res)=>{
  try {
    const cliente=await prisma.cliente.findMany({
      where:{
        id:Number(req.params.id)
      }
    })
    res.json({
      data:cliente,
      message:"cliente obtenido correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message:"Error al obtener el cliente",
      error:message.error
    })
  }
})

export default app;