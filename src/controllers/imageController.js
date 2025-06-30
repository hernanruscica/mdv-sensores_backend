// src/controllers/imageController.js
import cloudinary from "../config/cloudinaryConfig.js";

// Función para convertir buffer a base64
const bufferToBase64 = (buffer) => {
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const base64Image = bufferToBase64(req.file.buffer);

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "mdv_sensores", 
    });

    console.log(`foto subida:${result.display_name}.${result.format}`);
    req.body.foto = `${result.display_name}.${result.format}`;
    next();
/*
    return res.status(200).json({
      message: "Imagen subida correctamente",
      url: result.secure_url,
      public_id: result.public_id,
    });
    */
  } catch (error) {
    next(error);
  }
};

/*
import path from "path";
import { fileURLToPath } from 'url';

export const uploadImage = (req, res, next) => {
    try {
        // Verifica si se subió la imagen correctamente
        
        if (!req.file) {
          return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
        }
        
        // Devuelve la información de la imagen
        
        res.status(200).json({ 
          message: 'Imagen subida correctamente', 
          file: req.file 
          });
          
          req.body.foto = (req.file) ? req.file.filename : req.body.foto;
      
          next();
    
          } catch (error) {
            //res.status(500).json({ message: 'Error al subir la imagen', error });
            next(error);
          };
    
        };
    
    export const getImage = (req, res, next) => {
        // Obtén el nombre del archivo actual y el directorio actual
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
    
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, '../uploads', imageName);
      
        res.sendFile(imagePath, (err) => {
          if (err) {
            //res.status(404).json({ message: 'Imagen no encontrada' });
            next(err);
          }
        });
    };
*/
