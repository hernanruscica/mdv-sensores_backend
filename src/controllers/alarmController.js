import Alarm from '../models/alarmModel.js';


export const registerAlarm = async (req, res, next) => {
  try {
    const { canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado } = req.body;
    const alarmId = await Alarm.create({ canal_id, tabla, columna, nombre, descripcion, max, min, periodo_tiempo, estado });    
    req.body.id = alarmId;
    res.status(201).json({ message: "Alarm created", alarm: req.body });
  } catch (error) {           
    next(error); // Pasa el error al middleware de manejo de errores  
}
};

export const updateAlarm = async (req, res, next) => {
  try {
    const alarmData = req.body;
    const { id } = req.params;
    alarmData.id = id;
    const updatedRows = await Alarm.update(alarmData);
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Alarm not found' });
    }
    res.status(200).json({ message: 'Alarm updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAlarm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await Alarm.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    res.status(200).json({ message: 'Alarm deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAlarms = async (req, res, next) => {
  try {
    const alarms = await Alarm.findAll();
    if (alarms.length == 0) {
      return res.status(400).json({message: 'Alarms Not Found'});
    }
    res.status(200).json({ count : alarms.length, alarms });
  } catch (error) {
    next(error);
  }
};

export const getAlarmById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alarm = await Alarm.findById(id);    
    if (!alarm) {
      return res.status(400).json({message: 'alarm Not Found'});
    }
    res.status(200).json({message: "alarm Founded", alarm });
  } catch (error) {
    next(error);
  }
};
