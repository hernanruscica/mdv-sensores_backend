import jwt from 'jsonwebtoken';

const generateTokenAlarmLog = (alarmLogId = '' , userId = '', alarmId = '', channelId = '' ) => {
  const token = jwt.sign({ alarmLogId , userId, alarmId, channelId}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });  
  console.log('datos en generateToken',alarmLogId, userId, token);
  return token;
};

export default generateTokenAlarmLog;
