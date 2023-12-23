import Express from "express";
import { PrismaClient } from "@prisma/client";
import excel from "exceljs";
const app = Express();
const prisma = new PrismaClient();

app.get("/excel", async (req, res) => {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        cliente: { select: { nombre: true } },
        empleado: { select: { nombre: true } },
        paquete: { select: { nombre: true, precio: true } },
      },
    });

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Hoja de inscripcion");

    // Agregar título en la fila 1
    worksheet.addRow(["Reporte de Inscripciones"]).font = { bold: true };

    worksheet.columns = [
      { header: "ID", key: "id", width: 5 },
      { header: "Cliente", key: "clienteNombre", width: 20 },
      { header: "Detalle", key: "detalleDescuento", width: 20 },
      { header: "Empleado", key: "empleadoNombre", width: 20 },
      { header: "Paquete", key: "paqueteNombre", width: 20 },
      { header: "Precio paquete", key: "precioPaquete", width: 20 },
      { header: "Descuento", key: "descuento", width: 10 },
      { header: "Tipo de Pago", key: "tipoPago", width: 10 },
      { header: "Total", key: "total", width: 10 },
    ];

    inscripciones.forEach((inscripcion) => {
      worksheet.addRow({
        ...inscripcion,
        clienteNombre: inscripcion.cliente.nombre,
        empleadoNombre: inscripcion.empleado.nombre,
        paqueteNombre: inscripcion.paquete.nombre,
        precioPaquete: inscripcion.paquete.precio,
      });
    });
    worksheet.addRow([]);
    const totalSum = inscripciones.reduce(
      (sum, inscripcion) => sum + inscripcion.total,
      0
    );
    const totalRow = worksheet.addRow([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      totalSum,
    ]);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inscripciones.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    res.status(500).send("Error interno del servidor");
  }
});
app.get("/exceladministrador", async (req, res) => {
  try {
    const empleado = await prisma.empleado.findMany({
      include: {
        Inscripcion: {
          include: {
            cliente: true,
            paquete: true,
          },
        },
        Venta: {
          include: {
            DetalleVenta: {
              include: {
                producto: true,
              },
            },
          },
        },
        Almacen: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!empleado || empleado.length === 0) {
      return res.status(404).send("Empleado no encontrado");
    }

    let sumaTotal = 0;
    let nomeEmpleado = "";
    let turnoEmple = "";

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Inscripciones");
    worksheet.addRow(["Tabla de inscripciones"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet.columns = [
      { header: "ID", key: "idIncrip", width: 10 },
      { header: "Cliente", key: "clienteNombre", width: 30 },
      { header: "Fecha inscripcion", key: "fechaIn", width: 30 },
      { header: "Detalle", key: "detalleDescuento", width: 30 },
      { header: "Paquete", key: "paqueteNombre", width: 20 },
      { header: "Precio paquete", key: "precioPaquete", width: 20 },
      { header: "Descuento", key: "descuentoIncripcion", width: 10 },
      { header: "Tipo de Pago", key: "tipoPagoIncripcion", width: 15 },
      { header: "Total", key: "totaInscription", width: 10 },
    ];

    empleado.forEach((empleadoItem) => {
      empleadoItem.Inscripcion.forEach((inscripcion, i) => {
        worksheet.addRow({
          ...empleadoItem,
          idIncrip: i + 1,
          clienteNombre: inscripcion.cliente?.nombre || "",
          paqueteNombre: inscripcion.paquete?.nombre || "",
          precioPaquete: inscripcion.paquete?.precio + " Bs" || 0,
          descuentoIncripcion: inscripcion.descuento + " Bs" || 0,
          tipoPagoIncripcion: inscripcion.tipoPago || "",
          fechaIn: inscripcion.fechaInicio || "",
          totaInscription: inscripcion.total + " Bs" || 0,
        });

        sumaTotal += inscripcion.total || 0;
      });
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      sumaTotal + " Bs",
    ]);

    const empleadoNombre = worksheet.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleado = worksheet.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    ////////////////////////////////////////////////////////////
    const worksheet2 = workbook.addWorksheet("Ventas");
    worksheet2.addRow(["Tabla de ventas"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet2.columns = [
      { header: "ID", key: "idproduc", width: 10 },
      { header: "Producto", key: "productoNombre", width: 30 },
      { header: "Cantidad inicial", key: "cantidadInicial", width: 15 },
      { header: "Ingreso a almacen", key: "Ingreso almacen", width: 15 },
      { header: "Cantidad Vendida", key: "cantidadVendida", width: 30 },
      { header: "Precio unitario", key: "precioUnitario", width: 20 },
      { header: "Precio total", key: "precioTotal", width: 20 },
      { header: "Cantidad actual", key: "cantidadActual", width: 10 },
    ];

    let sumaVenta = 0;
    empleado.forEach((empleadoItem) => {
      empleadoItem.Venta.forEach((venta, i) => {
        venta.DetalleVenta.forEach((detalle) => {
          worksheet2.addRow({
            ...empleadoItem,
            idproduc: i + 1,
            productoNombre: detalle.producto.nombre || "",
            cantidadInicial: detalle.cantidad + detalle.producto.cantidad || 0,
            cantidadVendida: detalle.cantidad || 0,
            precioUnitario: detalle.producto.precio + " Bs" || 0,
            precioTotal: detalle.total + " Bs" || "",
            cantidadActual: detalle.producto.cantidad || 0,
          });
          sumaVenta += detalle.total || 0;
        });
      });
    });

    worksheet2.addRow([]);
    const totalRows = worksheet2.addRow([
      "Total",
      "",
      "",
      "",
      "",
      "",
      sumaVenta + " Bs",
    ]);

    const empleadoNombrse = worksheet2.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleados = worksheet2.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    ///////////////////////////////////////
    const worksheet3 = workbook.addWorksheet("Almacen");
    worksheet3.addRow(["Tabla de almacen"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet3.columns = [
      { header: "ID", key: "idAlmac", width: 10 },
      { header: "Producto", key: "productoNombre", width: 30 },
      { header: "Cantidad", key: "cantidadInicial", width: 15 },
      { header: "Ingreso a almacen", key: "ingresoAlmacen", width: 15 },
      { header: "Cantidad actual", key: "cantidadActual", width: 30 },
      { header: "Precio total", key: "precioTotal", width: 20 },
    ];

    let sumaAlmacen = 0;
    empleado.forEach((empleadoItem) => {
      empleadoItem.Almacen.forEach((almacen, i) => {
        worksheet3.addRow({
          idAlmac: i + 1,
          productoNombre: almacen.producto.nombre || "",
          cantidadInicial: almacen.producto.cantidad || 0,
          ingresoAlmacen: almacen.cantidadAumentada || 0,
          cantidadActual:
            almacen.cantidadAumentada + almacen.producto.cantidad || 0,
          precioTotal: almacen.totalCompra + " Bs" || "",
        });
        sumaAlmacen += almacen.totalCompra || 0;
      });
    });

    worksheet3.addRow([]);
    const totalRowsAlmacen = worksheet3.addRow([
      "Total",
      "",
      "",
      "",
      "",
      sumaAlmacen + " Bs",
    ]);

    const empleadoNombrseAlmacen = worksheet3.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleadosAlmacen = worksheet3.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const worksheet4 = workbook.addWorksheet("Total ganancia");
    worksheet4.addRow(["Tabla de ganancia"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet4.columns = [
      { header: "ID", key: "idTotalganancia", width: 10 },
      { header: "Inscripcion", key: "inscripcion", width: 30 },
      { header: "Ventas", key: "ventasTotal", width: 15 },
      { header: "Almacen", key: "almacenTotal", width: 15 },
      { header: "Total", key: "totalGanancia", width: 30 },
    ];

    const totalgana = sumaVenta + sumaTotal - sumaAlmacen;
    worksheet4.addRow({
      idTotalganancia: 1,
      inscripcion: sumaTotal + " Bs",
      ventasTotal: sumaVenta + " Bs",
      almacenTotal: sumaAlmacen + " Bs",
      totalGanancia: totalgana + " Bs",
    });
    worksheet4.addRow([]);
    const empleadoTotal = worksheet4.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoTotal = worksheet4.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    totalRows.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    totalRowsAlmacen.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inscripcion.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    res.status(500).send("Error interno del servidor");
  }
});
app.post("/excelempleado/:id", async (req, res) => {
  try {
    const fechaActual = req.body.fecha;
    const fechaCompleta = new Date(
      `${fechaActual}T00:00:00.000Z`
    ).toISOString();
    const fechaVenta = fechaCompleta;
    const empleado = await prisma.empleado.findMany({
      where: {
        id: Number(req.params.id),
      },
      include: {
        Inscripcion: {
          where: {
            fechaInicio: fechaActual,
          },
          include: {
            cliente: true,
            paquete: true,
          },
        },
        Venta: {
          where: {
            fecha: {
              gte: fechaVenta,
            },
          },
          include: {
            DetalleVenta: {
              include: {
                producto: true,
              },
            },
          },
        },
        Almacen: {
          where: {
            fecha: {
              gte: fechaVenta,
            },
          },
          include: {
            producto: true,
          },
        },
      },
    });

    if (!empleado || empleado.length === 0) {
      return res.status(404).send("Empleado no encontrado");
    }

    let sumaTotal = 0;
    let nomeEmpleado = "";
    let turnoEmple = "";

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Inscripciones");
    worksheet.addRow(["Tabla de inscripciones"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet.columns = [
      { header: "ID", key: "idIncrip", width: 10 },
      { header: "Cliente", key: "clienteNombre", width: 30 },
      { header: "Fecha inscripcion", key: "fechaIn", width: 30 },
      { header: "Detalle", key: "detalleDescuento", width: 30 },
      { header: "Paquete", key: "paqueteNombre", width: 20 },
      { header: "Precio paquete", key: "precioPaquete", width: 20 },
      { header: "Descuento", key: "descuentoIncripcion", width: 10 },
      { header: "Tipo de Pago", key: "tipoPagoIncripcion", width: 15 },
      { header: "Total", key: "totaInscription", width: 10 },
    ];

    empleado.forEach((empleadoItem) => {
      empleadoItem.Inscripcion.forEach((inscripcion, i) => {
        worksheet.addRow({
          ...empleadoItem,
          idIncrip: i + 1,
          clienteNombre: inscripcion.cliente?.nombre || "",
          paqueteNombre: inscripcion.paquete?.nombre || "",
          precioPaquete: inscripcion.paquete?.precio + " Bs" || 0,
          descuentoIncripcion: inscripcion.descuento + " Bs" || 0,
          tipoPagoIncripcion: inscripcion.tipoPago || "",
          fechaIn: inscripcion.fechaInicio || "",
          totaInscription: inscripcion.total + " Bs" || 0,
        });

        sumaTotal += inscripcion.total || 0;
      });
    });

    worksheet.addRow([]);
    const totalRow = worksheet.addRow([
      "Total",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      sumaTotal + " Bs",
    ]);

    const empleadoNombre = worksheet.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleado = worksheet.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    ////////////////////////////////////////////////////////////
    const worksheet2 = workbook.addWorksheet("Ventas");
    worksheet2.addRow(["Tabla de ventas"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet2.columns = [
      { header: "ID", key: "idproduc", width: 10 },
      { header: "Producto", key: "productoNombre", width: 30 },
      { header: "Cantidad inicial", key: "cantidadInicial", width: 15 },
      { header: "Ingreso a almacen", key: "Ingreso almacen", width: 15 },
      { header: "Cantidad Vendida", key: "cantidadVendida", width: 30 },
      { header: "Precio unitario", key: "precioUnitario", width: 20 },
      { header: "Precio total", key: "precioTotal", width: 20 },
      { header: "Cantidad actual", key: "cantidadActual", width: 10 },
    ];

    let sumaVenta = 0;
    empleado.forEach((empleadoItem) => {
      empleadoItem.Venta.forEach((venta, i) => {
        venta.DetalleVenta.forEach((detalle) => {
          worksheet2.addRow({
            ...empleadoItem,
            idproduc: i + 1,
            productoNombre: detalle.producto.nombre || "",
            cantidadInicial: detalle.cantidad + detalle.producto.cantidad || 0,
            cantidadVendida: detalle.cantidad || 0,
            precioUnitario: detalle.producto.precio + " Bs" || 0,
            precioTotal: detalle.total + " Bs" || "",
            cantidadActual: detalle.producto.cantidad || 0,
          });
          sumaVenta += detalle.total || 0;
        });
      });
    });

    worksheet2.addRow([]);
    const totalRows = worksheet2.addRow([
      "Total",
      "",
      "",
      "",
      "",
      "",
      sumaVenta + " Bs",
    ]);

    const empleadoNombrse = worksheet2.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleados = worksheet2.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    ///////////////////////////////////////
    const worksheet3 = workbook.addWorksheet("Almacen");
    worksheet3.addRow(["Tabla de almacen"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet3.columns = [
      { header: "ID", key: "idAlmac", width: 10 },
      { header: "Producto", key: "productoNombre", width: 30 },
      { header: "Cantidad", key: "cantidadInicial", width: 15 },
      { header: "Ingreso a almacen", key: "ingresoAlmacen", width: 15 },
      { header: "Cantidad actual", key: "cantidadActual", width: 30 },
      { header: "Precio total", key: "precioTotal", width: 20 },
    ];

    let sumaAlmacen = 0;
    empleado.forEach((empleadoItem) => {
      empleadoItem.Almacen.forEach((almacen, i) => {
        worksheet3.addRow({
          idAlmac: i + 1,
          productoNombre: almacen.producto.nombre || "",
          cantidadInicial: almacen.producto.cantidad || 0,
          ingresoAlmacen: almacen.cantidadAumentada || 0,
          cantidadActual:
            almacen.cantidadAumentada + almacen.producto.cantidad || 0,
          precioTotal: almacen.totalCompra + " Bs" || "",
        });
        sumaAlmacen += almacen.totalCompra || 0;
      });
    });

    worksheet3.addRow([]);
    const totalRowsAlmacen = worksheet3.addRow([
      "Total",
      "",
      "",
      "",
      "",
      sumaAlmacen + " Bs",
    ]);

    const empleadoNombrseAlmacen = worksheet3.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoEmpleadosAlmacen = worksheet3.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const worksheet4 = workbook.addWorksheet("Total ganancia");
    worksheet4.addRow(["Tabla de ganancia"]).font = { bold: true };
    empleado.forEach((empleadoItem) => {
      nomeEmpleado = empleadoItem.nombre;
      turnoEmple = empleadoItem.turno;
    });
    worksheet4.columns = [
      { header: "ID", key: "idTotalganancia", width: 10 },
      { header: "Inscripcion", key: "inscripcion", width: 30 },
      { header: "Ventas", key: "ventasTotal", width: 15 },
      { header: "Almacen", key: "almacenTotal", width: 15 },
      { header: "Total", key: "totalGanancia", width: 30 },
    ];

    const totalgana = sumaVenta + sumaTotal - sumaAlmacen;
    worksheet4.addRow({
      idTotalganancia: 1,
      inscripcion: sumaTotal + " Bs",
      ventasTotal: sumaVenta + " Bs",
      almacenTotal: sumaAlmacen + " Bs",
      totalGanancia: totalgana + " Bs",
    });
    worksheet4.addRow([]);
    const empleadoTotal = worksheet4.addRow([
      "Nombre: ",
      nomeEmpleado,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    const turnoTotal = worksheet4.addRow([
      "Turno: ",
      turnoEmple,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    totalRows.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };
    totalRowsAlmacen.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" },
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inscripcion.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar el archivo Excel:", error);
    res.status(500).send("Error interno del servidor");
  }
});
export default app;
