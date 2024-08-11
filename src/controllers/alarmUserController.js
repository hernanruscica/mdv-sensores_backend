import AlarmUser from '../models/alarmUserModel.js';


export const registerAlarmUser = async (req, res, next) => {
  try {
    const { alarma_id, usuario_id } = req.body;
    const alarmUserId = await AlarmUser.create({ alarma_id, usuario_id });    
    req.body.id = alarmUserId;
    if (alarmUserId !== -1) {
      res.status(201).json({ message: "Alarm added to User", alarmUser: req.body });
    }else{
      res.status(409).json({message: "User already asigned to that alarm", alarmUser: req.body});
    }
  } catch (error) {           
    next(error);   
}
};

export const updateAlarmUser = async (req, res, next) => {
  try {
    const alarmData = req.body;
    const { id } = req.params;
    alarmData.id = id;
    const updatedRows = await AlarmUser.update(alarmData);
    if (updatedRows <= 0) {
      if (updatedRows == 0) {
        return res.status(404).json({ message: 'Alarm on User not found' });
      }else{
        return res.status(409).json({ message: 'User already asigned to that alarm' });
      }
    }
    res.status(200).json({ message: 'Alarm on User updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAlarmUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRows = await AlarmUser.delete(id);

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Alarm on User not found' });
    }

    res.status(200).json({ message: 'Alarm on User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllAlarmUser = async (req, res, next) => {
  try {
    const alarmUsers = await AlarmUser.findAll();
    if (alarmUsers.length == 0) {
      return res.status(400).json({message: 'Alarms on User Not Found'});
    }
    res.status(200).json({ count : alarmUsers.length, alarmUsers });
  } catch (error) {
    next(error);
  }
};

export const getAlarmUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alarmUser = await AlarmUser.findById(id);    
    if (!alarmUser) {
      return res.status(400).json({message: 'alarmUser Not Found'});
    }
    res.status(200).json({message: "alarmUser Founded", alarmUser });
  } catch (error) {
    next(error);
  }
};

export const getUsersByAlarmId = async (req, res, next) => {
  try {
    const { alarmId } = req.params;
    const alarmUser = await AlarmUser.findUsersByAlarmId(alarmId);    
    if (!alarmUser) {
      return res.status(400).json({message: 'Users Not Found for that alarm'});
    }
    res.status(200).json({message: "Users Founded", alarmUser });
  } catch (error) {
    next(error);
  }
};