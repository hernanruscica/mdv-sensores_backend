import Channel from '../models/channelModel.js';


export const registerChannel = async (req, res, next) => {
  try {
    const { datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador } = req.body;
    const channelId = await Channel.create({ datalogger_id, nombre, descripcion, nombre_columna, tiempo_a_promediar, foto, multiplicador });    
    req.body.id = channelId;
    res.status(201).json({ message: "channel created", channel: req.body });
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
      return res.status(404).json({ message: 'channel not found' });
    }
    res.status(200).json({ message: 'channel updated successfully' });
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
    res.status(200).json({ count : channels.length, channels });
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
    res.status(200).json({message: "channel Founded", channel });
  } catch (error) {
    next(error);
  }
};
