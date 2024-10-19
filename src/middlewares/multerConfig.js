import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuración de Multer para almacenar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    //const uploadPath = path.join(__dirname, '/uploads'); // Guarda las imágenes en la carpeta 'uploads'
    //const uploadPath = path.join(__dirname, '/uploads');
    const uploadPath = './var/data';
    // console.log('dirname de la upload path', __dirname)

    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Asignar nombre único
  }
});

const upload = multer({ storage: storage });

export default upload;
