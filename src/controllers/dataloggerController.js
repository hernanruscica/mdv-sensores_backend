import Datalogger from '../models/dataloggerModel.js'

export const getDataloggerById = async (req, res) => {
    try {
        const { id } = req.params;
        const datalogger = await Datalogger.findById(id);
        if (!datalogger) {
            return res.status(400).json({message: 'Datalogger Not Found'});
          }
          res.status(200).json({message: "Datalogger Founded", datalogger });
    } catch (error) {
        next(error);
    }
};

export const getAllDataloggers = async (req, res, next) => {
    try {
      const dataloggers = await Datalogger.findAll();
      if (dataloggers.length == 0) {
        return res.status(400).json({message: 'Dataloggers Not Found'});
      }
      res.status(200).json({ count : dataloggers.length, dataloggers });
    } catch (error) {
      next(error);
    }
  };

  export const registerDatalogger = async (req, res, next) => {
    try {
        const { direccion_mac, nombre, descripcion, foto, nombre_tabla, ubicacion_id } = req.body;      
        const insertedId = await Datalogger.create({direccion_mac, nombre, descripcion, foto, nombre_tabla, ubicacion_id});
        req.body.id = insertedId;        
        res.status(201).json({message: "Datalogger created", datalogger: req.body});
    } catch (error) {
        next(error);
    }
  }

  export const updateDatalogger = async (req, res, next) => {
    try {
      const dataloggerData = req.body;
      const { id } = req.params;
      dataloggerData.id = id;
      const updatedRows = await Datalogger.update(dataloggerData);
  
      if (updatedRows === 0) {
        return res.status(404).json({ message: 'Datalogger not found' });
      }
  
      res.status(200).json({ message: 'Datalogger updated successfully' });
    } catch (error) {
      next(error);
    }
  };
  
  export const deleteDatalogger = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedRows = await Datalogger.delete(id);
  
      if (deletedRows === 0) {
        return res.status(404).json({ message: 'Datalogger not found' });
      }
  
      res.status(200).json({ message: 'Datalogger deleted successfully' });
    } catch (error) {
      next(error);
    }
  };