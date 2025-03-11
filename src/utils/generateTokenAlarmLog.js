import jwt from 'jsonwebtoken';

const generateTokenAlarmLog =  (alarmLogId = '' , userId = '', alarmId = '', channelId = '', dataloggerId = '' ) => {
  const token =  jwt.sign({ alarmLogId , userId, alarmId, channelId, dataloggerId}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });  
  console.log('datos en generateToken',alarmLogId, userId, alarmId, channelId, dataloggerId, token);
  return token;
};

export default generateTokenAlarmLog;
