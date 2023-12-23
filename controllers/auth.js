import Express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const app = Express();
const prisma = new PrismaClient();

app.delete("/logout", async (req, res) => {
  await prisma.empleado.update({
    where: {
      refreshToken: req.body.token,
    },
    data: {
      refreshToken: null,
    },
  });
  res.send({
    message: "Sesión cerrada correctamente",
  });
});

app.get("/me", (req, res) => {
  res.json({
    message: "Datos del usuario obtenidos correctamente",
    data: req.user,
  });
});

app.post("/token", async (req, res) => {
  const refresh_token = req.body.token;
  if (!refresh_token) return res.sendStatus(401);
  const user = await prisma.empleado.findUnique({
    where: {
      refreshToken: refresh_token,
    },
  });
  if (!user) return res.sendStatus(403);
  jwt.verify(refresh_token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    delete user.iat;
    const access_token = generarToken(user);
    res.json({
      message: "Token refrescado correctamente",
      data: {
        access_token,
      },
    });
  });
});

app.post("/login", async (req, res) => {
  const { usuario, password } = req.body;
  const user = await prisma.empleado.findUnique({
    where: {
      usuario: usuario,
    },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.json({
      error: "Credenciales inválidas",
    });
  }
  delete user.refreshToken;
  const token = generarToken(user);
  const refresh_token = generateRefreshToken(user);
  await prisma.empleado.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: refresh_token,
    },
  });
  res.json({
    message: "Autenticado correctamente",
    data: {
      access_token: token,
      refresh_token: refresh_token,
    },
  });
});

function generarToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: "1440m" });
}

export function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_SECRET);
}

export function authenticateToken(req, res, next) {
  if (
    req.path === "/login" ||
    req.path === "/token" ||
    req.path === "/logout" ||
    req.path === "/admin" ||
    req.path === "/promocion" ||
    req.path === "/venta"
  )
    return next();
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "No has iniciado sesión",
    });
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export default app;
