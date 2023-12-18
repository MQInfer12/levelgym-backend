import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from 'cors';
import cliente from "./controllers/cliente.js";
import almacen from "./controllers/almacen.js";
import detalleVenta from "./controllers/detalleVenta.js";
import empleado from "./controllers/empleado.js";
import paquete from "./controllers/paquete.js";
import producto from "./controllers/producto.js";
import venta from "./controllers/venta.js";
import inscripcion  from "./controllers/inscripcion.js";
import asistencia  from "./controllers/asistencia.js";
import auth, { authenticateToken } from './controllers/auth.js';

const app = express();
const port = 3000;

dotenv.config();
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.all("*", authenticateToken);

app.use(auth);
app.use(cliente);
app.use(almacen);
app.use(detalleVenta);
app.use(empleado);
app.use(paquete);
app.use(producto);
app.use(venta);
app.use(inscripcion);
app.use(asistencia);
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
