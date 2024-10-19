import AlarmModel from '../models/alarmModel.js';
import DataModel from '../models/dataModel.js';
import AlarmUserModel from '../models/alarmUserModel.js';
import AlarmLogModel from '../models/alarmLogModel.js';
import { evaluate } from 'mathjs';
import { calculatePorcentageOn } from '../utils/MathUtils.js';
import { sendMessage } from '../utils/mail.js';


class AlarmService {
  async checkAlarms() {
    
    const alarms = await AlarmModel.findAll();    
    //if there is any alarm, do nothing
    if (alarms?.length == 0){
        console.log('No alarms');
        return;
    }         

    
    for (let alarm of alarms){                  
        //console.log(alarm.nombre, alarm.tabla, alarm.columna, alarm.periodo_tiempo, alarm.nombre_variables, alarm.condicion);
        
        
        switch (alarm.tipo_alarma) {
            case "PORCENTAJE_ENCENDIDO":
                //console.log("getporcentageson and evaluates the condition");
                const tableName = alarm.tabla;
                const columnPrefix = alarm.columna;
                const timePeriod = alarm.periodo_tiempo;
                const currentData = await DataModel.findDataFromDigitalChannel(tableName, columnPrefix, timePeriod );
                const rangePorcentageSecs = timePeriod * 60;
                const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs);
                if (dataPorcentagesOn?.length > 0){
                    //the last data
                    const currentPorcentage = dataPorcentagesOn[dataPorcentagesOn.length - 1].porcentaje_encendido;
                    let variables = {};
                    variables['porcentaje_encendido'] = currentPorcentage;
                    try {
                        const isTriggered = evaluate(alarm.condicion, variables);
                        //console.log(alarm.nombre, alarm.condicion, variables, isTriggered);   
                        if (isTriggered) {
                            this.triggerAlarm(alarm, variables);
                        }else{
                            this.resetAlarm(alarm, variables);
                        }                   
                    } catch (error) {
                        console.error('Error al evaluar la condición:', error);
                        console.error('Condición:', alarm.condicion);
                        console.error('Variables:', variables);                        
                    }
                }
                break;
            case "FALLO_COMUNICACION":
                //console.log("controlando alarma de fallo de comunicacion...");
                const tableNameFail = alarm.tabla;
                const currentDataFail = await DataModel.findLastDataFromTable(tableNameFail);
                const now = Date.now();
                const lastDate = new Date(currentDataFail[0].fecha).getTime();  
                const variablesNamesFail = alarm.nombre_variables.split(',');     
                const variablesFails = {};

                for (let index in variablesNamesFail){
                    //console.log(variablesNamesFail[index]);
                    const currentName = variablesNamesFail[index];
                    if (index == 0){
                        //fecha
                        variablesFails[currentName] = parseInt(lastDate) /60 /1000 ;
                    }else{
                        if (index == 1){
                            //fecha actual
                            variablesFails[currentName] = parseInt(now) /60 /1000 ;
                        }
                    }
                }
                try {
                    const isTriggered = evaluate(alarm.condicion, variablesFails);
                    //console.log(alarm.nombre, alarm.condicion, variables, isTriggered);   
                    //console.log(`diference in minutes : ${variablesFails.fecha_actual - variablesFails.fecha}`);
                    const timeWithoutComunication = (variablesFails.fecha_actual - variablesFails.fecha).toFixed(1);
                    if (isTriggered) {
                        //console.log('se disparo la alarma de fallo de conexion');
                        this.triggerAlarm(alarm, {minutos_sin_conexion: timeWithoutComunication});
                    }else{
                        //console.log('No se disparo la alarma de fallo de conexion')
                        this.resetAlarm(alarm, {minutos_sin_conexion: timeWithoutComunication});
                    }                   
                } catch (error) {
                    console.error('Error al evaluar la condición:', error);
                    console.error('Condición:', alarm.condicion);
                    console.error('Variables:', variablesFails);                        
                }                
                
                break;

            default:
                console.log(`Unhandled nombre_variables: ${alarm.nombre_variables}`);
                break;
            }   
    }   
  }

  async triggerAlarm(alarm, variables) {
    console.log(`Alarm evaluation positive: ${alarm.nombre}`);
    if (alarm.disparada == 0){        
        //Tengo que actualizar disparada en alarma BD
        
        alarm.disparada = 1;
        const affectedRows = await AlarmModel.updateTrigger(alarm.id, alarm.disparada);
        console.log(affectedRows == 1 ? 'Alarm trigger updated OK: DISPARADA' : 'Error updating alarm trigger');    


        const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);    
        //console.log(usersAffected);        

        if (usersAffected.length > 0){
            for (let user of usersAffected){
                console.log(`Alarma ${alarm.nombre} DISPARADA con ${JSON.stringify(variables)} para el  usuario con correo: ${user.email} con id: ${user.id}`);
                //alarma_id, usuario_id, canal_id, variables
                const alarmLog = {
                    alarma_id: alarm.id,
                    usuario_id: user.id,
                    canal_id: alarm.canal_id,
                    variables: JSON.stringify(variables),
                    disparada: 1
                }
                const results = await AlarmLogModel.create(alarmLog)
                console.log(results>0 ? `Log inserted Ok with id: ${results}`: 'Error inserting log');
                

                try {                
                        
                    const emailToSend = user.email;
                    const results = await sendMessage(alarm, variables, emailToSend);
                    //console.log(results);
                    if (results == true){
                        console.log('Email alarm sended OK !');                        
                    }else{
                        console.log('Error sending alarm email');
                    }
                   
                
                } catch (error) {
                    console.error('Error sending email alarm', error);
                }
                
            }
        }
    }else{
        console.log(`la alarma ${alarm.nombre} sigue disparada...\n`);
    }
  }
  async resetAlarm(alarm, variables) {
    console.log(`Alarm evaluation negative ${alarm.nombre}`);
    if (alarm.disparada == 1){

        alarm.disparada = 0;
        const affectedRows = await AlarmModel.updateTrigger(alarm.id, alarm.disparada);
        console.log(affectedRows == 1 ? 'Alarm trigger updated OK: NO DISPARADA' : 'Error updating alarm trigger');         


        const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);  
        //console.log(usersAffected);  
        if (usersAffected.length > 0){
            for (let user of usersAffected){
                console.log(`Alarma ${alarm.nombre} RESETEADA con ${JSON.stringify(variables)} para el  usuario con correo: ${user.email} con id: ${user.id}`);
                const alarmLog = {
                    alarma_id: alarm.id,
                    usuario_id: user.id,
                    canal_id: alarm.canal_id,
                    variables: JSON.stringify(variables),
                    disparada: 0
                }
                const results = await AlarmLogModel.create(alarmLog)
                console.log(results>0 ? `Log inserted Ok with id: ${results}`: 'Error inserting log');

                try {                    
                    const emailToSend = user.email;
                    const results = await sendMessage(alarm, variables, emailToSend);                    
                    //console.log(results);
                    if (results == true){
                        console.log('Email alarm sended OK !');                        
                    }else{
                        console.log('Error sending alarm email');
                }
                } catch (error) {
                    console.error('Error sending email alarm', error);
                }
            }
        }
    }
  }
}

export default new AlarmService();