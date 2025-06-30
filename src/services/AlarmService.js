import AlarmModel from '../models/alarmModel.js';
import DataModel from '../models/dataModel.js';
import AlarmUserModel from '../models/alarmUserModel.js';
import AlarmLogModel from '../models/alarmLogModel.js';
import { evaluate } from 'mathjs';
import { calculatePorcentageOn } from '../utils/MathUtils.js';
import { sendMessage, testMessage } from '../utils/mail.js';
import generateTokenAlarmLog from '../utils/generateTokenAlarmLog.js';
import { v4 as uuidv4 } from 'uuid';

class AlarmService {
  async checkAlarms() {
    const alarms = await AlarmModel.findAll();
    if (!alarms?.length) {
      console.log('No alarms');
      return;
    }

    for (let alarm of alarms) {
      const { isTriggered, mensaje } = await this.evaluateAlarm(alarm);
      if (isTriggered === null) continue;

      if (isTriggered) {
        await this.triggerAlarm(alarm, mensaje);
      } else {
        await this.resetAlarm(alarm, mensaje);
      }
    }
  }

  async evaluateAlarm(alarm) {
    try {
      switch (alarm.tipo_alarma) {
        case "PORCENTAJE_ENCENDIDO": {
          const tableName = alarm.tabla;
          const columnPrefix = alarm.columna;
          const timePeriod = alarm.periodo_tiempo;
          const variable01 = 60;
          const currentData = await DataModel.findDataFromDigitalChannel(tableName, columnPrefix, timePeriod);
          
          const rangePorcentageSecs = timePeriod * 60;
          const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs);

          if (!dataPorcentagesOn?.length) return { isTriggered: null, mensaje: '' };

          const currentPorcentage = dataPorcentagesOn[dataPorcentagesOn.length - 1].porcentaje_encendido;
          const variablesAndValues = { valor01: currentPorcentage, variable01: variable01 };

          const isTriggered = this.evaluateAlarmCondition(alarm.condicion, variablesAndValues);
          
          const mensaje = `Porcentaje de encendido actual: ${currentPorcentage}%. Umbral: ${variable01}%. Periodo: ${timePeriod} minutos.`;

          return { isTriggered, mensaje };
        }
        case "FALLO_COMUNICACION": {
          const tableName = alarm.tabla;
          const response = await DataModel.findLastDataFromTable(tableName);
          const currentData = response[0]?.fecha_local;

          const variable01 = 15 * 60 * 1000;
          const now = Date.now() ; //const now = Date.now() -3  * 60 * 60 * 1000; para el servidor de render
          const lastDate = new Date(currentData).getTime();   
          
          const variablesAndValues = { valor01: now - lastDate, variable01: variable01 };
          const isTriggered = this.evaluateAlarmCondition(alarm.condicion, variablesAndValues);
          
          const minutos = ((now - lastDate) / 60 / 1000).toFixed(0);
          const mensaje = `Última comunicación hace ${minutos} minutos. Umbral: ${(variable01 / 60 / 1000)} minutos.`;

          return { isTriggered, mensaje };
        }
        case "FUNCIONAMIENTO_SIMULTANEO": {
          const tableName = alarm.tabla;         
          
          const columnPrefix = alarm.columna.split(',').map(col => col.trim());     
          const column01 = columnPrefix[0];
          const column02 = columnPrefix[1];
         
          //const timePeriod = alarm.periodo_tiempo;
          const variable01 = alarm.variable01;
          const variable02 = alarm.variable02;

          const response = await DataModel.findLastDataFromTable(tableName);
          const lastRegister = response[0];
          if (!lastRegister) {
            console.log(`No data found for table ${tableName}`);
            return { isTriggered: null, mensaje: '' };
          } 
          //console.log('lastRegister:', lastRegister);
          const currentData01 = parseInt(lastRegister[`${column01}_tiempo`]);          
          const currentData02 = parseInt(lastRegister[`${column02}_tiempo`]);   
          const currentData03 = 1;       

          console.log(currentData01, currentData02);
          
          const variablesAndValues = { valor01: currentData01, variable01: variable01, 
                                       valor02: currentData02, variable02: variable02, valor03: currentData03};
          
          const isTriggered = this.evaluateAlarmCondition('((valor01 > variable01 & valor02 > variable02) | (valor01 > variable01 & valor03 == 2) | (valor02 > variable02 & valor03 == 1))', variablesAndValues);
                    
          const mensaje = `Se encendieron los dos compresores.`;

          return { isTriggered, mensaje };
        }
        default:
          console.log(`Unhandled tipo_alarma: ${alarm.tipo_alarma}`);
          return { isTriggered: null, mensaje: '' };
      }
    } catch (error) {
      console.error('Error evaluando alarma:', error);
      return { isTriggered: null, mensaje: '' };
    }
  }

  evaluateAlarmCondition(condition, variablesAndValues) {
    try {
      console.log('\nEvaluando condición de la alarma:',condition);
      console.log('Variables and values:', variablesAndValues);      
      return evaluate(condition, variablesAndValues);
    } catch (error) {
      console.error('Error al evaluar la condición:', error);
      console.error('Condición:',condition);
      console.error('Variables y valores:', variablesAndValues);
      return false;
    }
  }

  /**
   * Envía correos a los usuarios afectados y devuelve un array con el resultado de cada envío.
   */
  async notifyUsers(alarm, mensaje, users, disparada) {
    const results = [];
    for (const user of users) {
      try {
        const token = generateTokenAlarmLog(null, user.id, alarm.id, alarm.canal_id, alarm.datalogger_id);
        const emailToSend = user.email;
        const sendOk = await sendMessage(alarm, mensaje, emailToSend, token);
        results.push({
          user,
          sendOk,
          token,
          disparada
        });
        console.log(sendOk ? `Email sent OK to ${emailToSend}` : `Error sending email to ${emailToSend}`);
      } catch (error) {
        results.push({
          user,
          sendOk: false,
          token: null,
          disparada
        });
        console.error(`Error sending email to ${user.email}:`, error);
      }
    }
    return results;
  }

  
  async logAlarmNotifications(alarm, mensaje, notifications) {
    console.log('notifications:', notifications);
    const eventId = uuidv4();
    for (const notif of notifications) {
      const alarmLog = {
        id: eventId,
        alarma_id: alarm.id,
        usuario_id: notif.user.id,
        canal_id: alarm.canal_id,
        mensaje: mensaje,
        disparada: notif.disparada,
        email_enviado: notif.sendOk ? 1 : 0 
      };
      console.log('Alarm Log data on logAlarmNotificatins:', alarmLog);
      const insertedId = await AlarmLogModel.create(alarmLog);
      console.log('insertedId on alarmaLogs on logAlarmNotificatins', insertedId);
      console.log(insertedId > 0 ? `Alarm Log inserted Ok with id: ${insertedId}` : 'Error inserting log');
    }
  }

  async triggerAlarm(alarm, mensaje) {
    console.log(`Alarm evaluation positive: ${alarm.nombre}`);
    if (alarm.disparada == 0) {
      alarm.disparada = 1;
      await AlarmModel.updateTrigger(alarm.id, alarm.disparada);

      const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);
      if (usersAffected.length > 0) {
        const notifications = await this.notifyUsers(alarm, mensaje, usersAffected, 1);
        await this.logAlarmNotifications(alarm, mensaje, notifications);
      }
    } else {
      console.log(`la alarma ${alarm.nombre} sigue disparada...\n`);
    }
  }

  async resetAlarm(alarm, mensaje) {
    console.log(`Alarm evaluation negative ${alarm.nombre}`);
    if (alarm.disparada == 1) {
      alarm.disparada = 0;
      await AlarmModel.updateTrigger(alarm.id, alarm.disparada);

      const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);
      if (usersAffected.length > 0) {
        const notifications = await this.notifyUsers(alarm, mensaje, usersAffected, 0);
        await this.logAlarmNotifications(alarm, mensaje, notifications);
      }
    }
  }
}

export default new AlarmService();