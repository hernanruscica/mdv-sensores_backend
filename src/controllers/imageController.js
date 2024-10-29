import path from "path";
import { fileURLToPath } from 'url';

export const uploadImage = (req, res, next) => {
    try {
        // Verifica si se subió la imagen correctamente
        /*
        if (!req.file) {
          return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
        }
        
        // Devuelve la información de la imagen
        
        res.status(200).json({ 
          message: 'Imagen subida correctamente', 
          file: req.file 
          });
          */
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