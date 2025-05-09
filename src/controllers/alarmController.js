import { pool } from '../config/database.js';
import Alarm from '../models/alarmModel.js';
import AlarmUser from '../models/alarmUserModel.js';
import Channel from "../models/channelModel.js";

export const registerAlarm = async (req, res, next) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { canal_id, nombre, descripcion, nombre_variables, condicion, periodo_tiempo, usuario_id, tipo_alarma } = req.body;

    // 1. Verificar si existe el canal
    const responseChannel = await Channel.findById(canal_id);
    if (!responseChannel) {
      throw new Error('Canal no encontrado');
    }

    const tabla = responseChannel.datalogger_nombre_tabla;
    const columna = responseChannel.nombre_columna;

    // 2. Crear la alarma
    const alarmId = await Alarm.create({ 
      canal_id, 
      tabla, 
      columna, 
      nombre, 
      descripcion, 
      nombre_variables, 
      condicion, 
      periodo_tiempo, 
      tipo_alarma 
    });    

    if (!alarmId) {
      throw new Error('Error al crear la alarma');
    }

    // 3. Crear la relación alarma-usuario
    const alarmUserData = {
      alarma_id: alarmId, 
      usuario_id: usuario_id
    }

    const responseAlarmUser = await AlarmUser.create(alarmUserData);
    if (!responseAlarmUser) {
      throw new Error('Error al crear la relación alarma-usuario');
    }

    // Si todo salió bien, hacer commit
    await connection.commit();

    // Preparar respuesta
    const createdAlarm = {
      id: alarmId,
      canal_id,
      tabla,
      columna,
      nombre,
      descripcion,
      nombre_variables,
      condicion,
      periodo_tiempo,
      tipo_alarma,
      usuario_id
    };

    res.status(201).json({ 
      message: "Alarm created successfully", 
      success: true, 
      alarm: createdAlarm 
    });

  } catch (error) {
    // Si algo falló, hacer rollback
    await connection.rollback();
    
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  } finally {
    // Siempre liberar la conexión
    connection.release();
  }
};

export const updateAlarm = async (req, res, next) => {
  try {
    const alarmData = req.body;
    const { id } = req.params;
    alarmData.id = id;
    //console.log(alarmData)
    const updatedRows = await Alarm.update(alarmData);
    if (updatedRows === 0) {
      return res.status(200).json({ message: 'Alarma no encontrada', success: false });
    }
    res.status(201).json({ message: 'Alarma actualizada correctamente', success: true, alarm: alarmData });
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
    if (alarms?.length == 0) {
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
//
export const getAlarmsByLocationId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alarms = await Alarm.findAllByLocationId(id);    
    
    if (alarms?.length == 0) {
      return res.status(200).json({message: 'alarms Not Found', alarms: []});
    }

    // Eliminar duplicados usando Set y un campo único (por ejemplo, id)
    const uniqueAlarms = [...new Map(alarms.map(alarm => [alarm.id, alarm])).values()];
    
    res.status(200).json({
      message: "alarms Founded", 
      count: uniqueAlarms.length, 
      alarms: uniqueAlarms 
    });
  } catch (error) {
    next(error);
  }
};