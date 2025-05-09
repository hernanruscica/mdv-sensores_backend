import {pool} from '../config/database.js';

import Location from '../models/locationModel.js';
import locationUserModel from '../models/locationUserModel.js';
import AddressModel from '../models/addressModel.js';

export const registerLocation = async (req, res, next) => {
  /* Recibe los campos para crear una ubicacion y el usuario que la crea
   * 1. Crea la direccion en la tabla direcciones y obtiene el id
   * 2. Crea la ubicacion en la tabla ubicaciones y obtiene el id
   * 3. Crea la relacion entre el usuario y la ubicacion en la tabla usuarios_ubicaciones
   */
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Crear dirección
    const { 
      // Datos de ubicación
      nombre = 'Sin nombre',
      descripcion = 'Sin descripción',
      foto = 'default.jpg',
      telefono = '0000000000',
      email = 'no-email@example.com',
      //Usuario al que se le asigna la ubicacion
      usuarios_id = 1,
      // Datos de dirección
      calle = 'Sin calle',
      numero = '0',
      localidad = 'Sin localidad',
      partido = 'Sin partido',
      provincia = 'Sin provincia',
      codigo_postal = '0000',
      latitud = '0',
      longitud = '0'
    } = req.body;

    const addressData = {
      calle, numero, localidad, partido, provincia, 
      codigo_postal, latitud, longitud
    };

    const direcciones_id = await AddressModel.create(addressData);
    if (!direcciones_id) {
      throw new Error('Error al crear la dirección');
    }

    // 2. Crear ubicación
    const locationData = { 
      nombre, descripcion, foto, telefono, 
      email, direcciones_id 
    };

    const locationId = await Location.create(locationData);
    if (!locationId) {
      // Si falla, revertir la creación de la dirección
      await connection.rollback();
      return res.status(500).json({
        message: 'Error al crear la ubicación'
      });
    }

    // 3. Crear relación usuario-ubicación
    const locationUserData = { 
      usuarios_id, 
      ubicaciones_id: locationId, 
      roles_id: 9 // Rol por defecto
    };

    const userLocationId = await locationUserModel.create(locationUserData);
    if (userLocationId <= 0) {
      // Si falla, revertir todo
      await connection.rollback();
      return res.status(500).json({
        message: 'Error al asociar usuario con ubicación'
      });
    }

    // Si todo sale bien, confirmar la transacción
    await connection.commit();

    // Preparar respuesta
    const response = {
      id: locationId,
      ...locationData,
      direccion: addressData,
      usuario_id: usuarios_id
    };

    res.status(201).json({ 
      success: true,
      message: "Location created successfully", 
      location: response 
    });

  } catch (error) {    
    // Revertir todos los cambios si algo falla
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una ubicación con esa dirección',
        error: error.message
      });
    }

    next(error);
  } finally {
    connection.release();
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
