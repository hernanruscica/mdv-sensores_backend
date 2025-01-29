import jwt from 'jsonwebtoken';

const generateTokenAlarmLog = (alarmLogId = '' , userId = '' ) => {
  console.log(alarmLogId, userId);
  return jwt.sign({ alarmLogId , userId}, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateTokenAlarmLog;
