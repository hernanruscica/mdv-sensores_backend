import LocationUser from '../models/locationUserModel.js';


export const registerLocationUser = async (req, res, next) => {
  try {
    const { usuarios_id, ubicaciones_id, roles_id } = req.body;
    const locationUserId = await LocationUser.create({ usuarios_id, ubicaciones_id, roles_id });    
    req.body.id = locationUserId;
    if (locationUserId !== -1) {
      res.status(201).json({ message: "Location added to User", locationUser: req.body });
    }else{
      res.status(409).json({message: "User already asigned to that location", locationUser: req.body});
    }
  } catch (error) {           
    next(error);   
}
};

export const updateLocationUser = async (req, res, next) => {
  try {
    const locationData = req.body;
    const { id } = req.params;
    locationData.id = id;
    const updatedRows = await LocationUser.update(locationData);
    
    if (updatedRows <= 0) {
      if (updatedRows == 0) {
        return res.status(404).json({ message: 'Location on User not found' });
      }else{
        return res.status(409).json({ message: updatedRows == -1 ? 'User already asigned to that Location' : 'same roles for that user on that location' });
      }
    }
    res.status(200).json({ message: 'Location on User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteLocationUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await LocationUser.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Location on User not found' });
    }

    res.status(200).json({ message: 'Location on User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllLocationsUser = async (req, res, next) => {
  try {
    const locationsUsers = await LocationUser.findAll();
    if (locationsUsers.length == 0) {
      return res.status(400).json({message: 'locations on Users Not Found'});
    }
    res.status(200).json({ count : locationsUsers.length, locationsUsers });
  } catch (error) {
    next(error);
  }
};


export const getLocationsUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const locationUserData = await LocationUser.findById(id);    
    if (!locationUserData) {
      return res.status(400).json({message: 'Location on User Not Found'});
    }
    res.status(200).json({message: "Location on User Founded", locationUserData });
  } catch (error) {
    next(error);
  }
};

export const getLocationsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const locationUserData = await LocationUser.findLocationsByUserId(userId);    
    if (!locationUserData) {
      return res.status(400).json({message: 'Location on User Not Found'});
    }
    res.status(200).json({message: "Location on User Founded", count: locationUserData.length, locationUserData: locationUserData });
  } catch (error) {
    next(error);
  }
};
//findUsersByLocationId
export const getUsersByLocationId = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const userLocationData = await LocationUser.findUsersByLocationId(locationId);    
    if (!userLocationData) {
      return res.status(400).json({message: 'Users Not Found for that Location'});
    }
    res.status(200).json({message: "Users Founded", userLocationData });
  } catch (error) {
    next(error);
  }
};