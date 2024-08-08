import Address from '../models/addressModel.js';


export const registerAddress = async (req, res, next) => {
  try {
    const { calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud } = req.body;
    const addressId = await Address.create({ calle, numero, localidad, partido, provincia, codigo_postal, latitud, longitud });    
    req.body.id = addressId;
    res.status(201).json({ message: "Address created", Address: req.body });
  } catch (error) {           
    next(error); // Pasa el error al middleware de manejo de errores  
}
};

export const updateAddress = async (req, res, next) => {
  try {
    const addressData = req.body;
    const { id } = req.params;
    addressData.id = id;
    const updatedRows = await Address.update(addressData);
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await Address.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll();
    if (addresses.length == 0) {
      return res.status(400).json({message: 'addresses Not Found'});
    }
    res.status(200).json({ count : addresses.length, addresses });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);    
    if (!address) {
      return res.status(400).json({message: 'Address Not Found'});
    }
    res.status(200).json({message: "Address Founded", address });
  } catch (error) {
    next(error);
  }
};
