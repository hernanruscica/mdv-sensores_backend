import AlarmLog from '../models/alarmLogModel.js';


export const registerAlarmLog = async (req, res, next) => {
  try {
    const { alarma_id, usuario_id, canal_id, variables } = req.body;
    const alarmLogId = await AlarmLog.create({ alarma_id, usuario_id, canal_id, variables });    
    req.body.id = alarmLogId;
    res.status(201).json({ message: "Alarm log register", AlarmLog: req.body });    
  } catch (error) {           
    next(error);   
}
};

export const updateAlarmLog = async (req, res, next) => {
  try {
    const alarmLogData = req.body;
    const { id } = req.params;
    alarmLogData.id = id;
    const updatedRows = await AlarmLog.update(alarmLogData);    
    if (updatedRows == 0) {
      return res.status(404).json({ message: 'Alarm log not found' });
    }else{
      return res.status(200).json({ message: 'Alarm log updated successfully' });
    }        
  } catch (error) {
    next(error);
  }
};

export const deleteAlarmLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await AlarmLog.delete(id);
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Alarm Log not found' });
    }
    res.status(200).json({ message: 'Alarm Log deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAlarmLogs = async (req, res, next) => {
  try {
    const AlarmLogs = await AlarmLog.findAll();
    if (AlarmLogs.length == 0) {
      return res.status(400).json({message: 'Alarm logs Not Found'});
    }
    res.status(200).json({ count : AlarmLogs.length, AlarmLogs });
  } catch (error) {
    next(error);
  }
};

export const getAlarmLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alarmLog = await AlarmLog.findById(id);    
    if (!alarmLog) {
      return res.status(400).json({message: 'alarmLog Not Found'});
    }
    res.status(200).json({message: "alarmUser Founded", alarmLog });
  } catch (error) {
    next(error);
  }
};

export const getAlarmLogsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const alarmLogs = await AlarmLog.findAllAlarmLogsByUser(userId);    
    if (!alarmLogs) {
      return res.status(400).json({message: 'Alarm Logs Not Found for that User'});
    }
    res.status(200).json({message: "Alarm Logs Founded", count: alarmLogs.length, alarmLogs });
  } catch (error) {
    next(error);
  }
};

export const getAlarmLogsByChannelId = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const alarmLogs = await AlarmLog.findAllAlarmLogsByChannel(channelId);    
    if (!alarmLogs) {
      return res.status(400).json({message: 'Alarm Logs Not Found for that Channel'});
    }
    res.status(200).json({message: "Alarm Logs Founded", count: alarmLogs.length, alarmLogs });
  } catch (error) {
    next(error);
  }
};
//getAlarmLogsByAlarmId
export const getAlarmLogsByAlarmId = async (req, res, next) => {
  try {
    const { alarmId } = req.params;
    const alarmLogs = await AlarmLog.findAllAlarmLogsByAlarm(alarmId);    
    if (!alarmLogs) {
      return res.status(400).json({message: 'Alarm Logs Not Found for that alarm'});
    }
    res.status(200).json({message: "Alarm Logs Founded", count: alarmLogs.length, alarmLogs });
  } catch (error) {
    next(error);
  }
};