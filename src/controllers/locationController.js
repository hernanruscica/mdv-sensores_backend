import Location from '../models/locationModel.js';
import locationUserModel from '../models/locationUserModel.js';

export const registerLocation = async (req, res, next) => {
  try {
    const { nombre, descripcion, foto, telefono, email, direcciones_id, usuarios_id } = req.body;
    const locationId = await Location.create({ nombre, descripcion, foto, telefono, email, direcciones_id });    
    req.body.id = locationId;

    const locationUserData = { usuarios_id, ubicaciones_id: locationId, roles_id : 9 }    
    const userLocationId = await locationUserModel.create(locationUserData);
    if (userLocationId>0){
      res.status(201).json({ message: "Location created", location: req.body });
    }else{
      console.log(userLocationId);
    }
  } catch (error) {    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(500).json({message: 'Ya existe una ubicacion con esa direccion', error: error});
    } else {      
    next(error); // Pasa el error al middleware de manejo de errores
  }
}
};

export const updateLocation = async (req, res, next) => {
  try {
    const locationData = req.body;
    const { id } = req.params;
    locationData.id = id;
    const updatedRows = await Location.update(locationData);

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await Location.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.findAll();
    if (locations.length == 0) {
      return res.status(400).json({message: 'Locations Not Found'});
    }
    res.status(200).json({ count : locations.length, locations });
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);    
    if (!location) {
      return res.status(400).json({message: 'location Not Found'});
    }
    res.status(200).json({message: "location Founded", location });
  } catch (error) {
    next(error);
  }
};
