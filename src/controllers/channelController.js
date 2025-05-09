import Channel from '../models/channelModel.js';
import LocationUser from '../models/locationUserModel.js';
import Datalogger from '../models/dataloggerModel.js';
import Data from '../models/dataModel.js';

export const registerChannel = async (req, res, next) => {
  try {
    const { datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador } = req.body;
    const channelId = await Channel.create({ datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador });    
    req.body.id = channelId;
    if (channelId > 0){
      res.status(201).json({ message: "Canal creado correctamente", success: true, channel: req.body });
    }
  } catch (error) {           
    next(error); // Pasa el error al middleware de manejo de errores  
}
};

export const updateChannel = async (req, res, next) => {
  try {
    const channelData = req.body;
    const { id } = req.params;
    channelData.id = id;
    const updatedRows = await Channel.update(channelData);
    if (updatedRows === 0) {
      return res.status(200).json({ message: 'Canal no encontrado', success: false });
    }
    res.status(201).json({ message: 'Canal actualizado correctamente', success: true, channel: channelData });
  } catch (error) {
    next(error);
  }
};

export const deleteChannel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await Channel.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.status(200).json({ message: 'Channel deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await Channel.findAll();
    if (channels.length == 0) {
      return res.status(400).json({message: 'Channels Not Found'});
    }
    
    const updatedChannels = await Promise.all(
      channels.map(async (channel) => {
        const totalTimeCurrentChannel = await Data.findTotalOnTimeFromColumn(channel.nombre_tabla, channel.nombre_columna);         
        return {
          ...channel,
          ...totalTimeCurrentChannel[0],  
        };
      })
    );

    res.status(200).json({ count : channels.length, channels: updatedChannels });
  } catch (error) {
    next(error);
  }
};

export const getChannelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);    
    if (!channel) {
      return res.status(400).json({message: 'channel Not Found'});
    }
   
    //const totalTimeCurrentChannel = await Data.findTotalOnTimeFromColumn(channel.nombre_tabla, channel.nombre_columna); 
    // console.log(totalTimeCurrentChannel, channel);
    res.status(200).json({message: "channel Founded", channel });
  } catch (error) {
    next(error);
  }
};

export const getAllChannelsByDatalogger = async (req, res, next) => {
  try {
    const { dataloggerId } = req.params;
    const channels = await Channel.findByDataloggerId(dataloggerId);
    if (channels.length == 0) {
      return res.status(400).json({message: 'channels Not Found'});
    }
    res.status(200).json({ count : channels.length, channels });
  } catch (error) {
    next(error);
  }
};
//getAllChannelsByUser 
export const getAllChannelsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const locationsByUser = await LocationUser.findLocationsByUserId(userId);
    const locationsIdsByUser = locationsByUser.map(locationByUser => locationByUser.ubicaciones_id);    
    
    const dataloggers = await Promise.all(
      locationsIdsByUser.map(async (locationId) => {
        const currentDataloggers = await Datalogger.findByLocationId(locationId);        
        return currentDataloggers;
      })
    );    
    const filteredDataloggers = dataloggers.filter(Boolean);    
    const flattenedDataloggers = filteredDataloggers.flat();
    const dataloggersIdsByUser = flattenedDataloggers.map(dataloggerByUser => dataloggerByUser.id);
    //console.log(dataloggersIdsByUser); 
    
    const channels = await Promise.all(
      dataloggersIdsByUser.map(async (dataloggerId) => {        
        const currentChannels = await Channel.findByDataloggerId(dataloggerId);
    
        // Usamos Promise.all para esperar que todas las promesas dentro del map se resuelvan
        const updatedChannels = await Promise.all(
          currentChannels.map(async (channel) => {
            const totalTimeCurrentChannel = await Data.findTotalOnTimeFromColumn(channel.nombre_tabla, channel.nombre_columna); 
            //console.log(channel.nombre_tabla, channel.nombre_columna)
            return {
              ...channel,
              ...totalTimeCurrentChannel[0],  // Combina los atributos del channel y totalTimeCurrentChannel[0]
            };
          })
        );
        
        return updatedChannels; // Retorna el array actualizado con los canales
      })
    );
           
     
     const filteredChannels = channels.filter(Boolean);     
     const flattenedChannels = filteredChannels.flat();

/*
    if (channels.length == 0) {
      return res.status(400).json({message: 'channels Not Found'});
    }
      */
    res.status(200).json({message: 'channels Founded', 
                          count : flattenedChannels.length, 
                          channels: flattenedChannels });
  } catch (error) {
    next(error);
  }
};