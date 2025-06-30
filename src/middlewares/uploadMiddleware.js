// src/middlewares/uploadMiddleware.js
import multer from "multer";

// Usamos memoria (no disco) para no guardar archivos en el servidor
const storage = multer.memoryStorage();

export const upload = multer({ storage });
