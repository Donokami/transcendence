export enum MuteTime {
  SECOND = 's',
  MINUTE = 'm',
  HOUR = 'h',
  DAY = 'd',
  WEEK = 'w',
}

export const parseMuteTime = (muteTime: string): Date => {
  const time = Number(muteTime.match(/\d+/)[0])

  if (isNaN(time)) throw new Error('Invalid mute time')

  if (time > 10000) throw new Error('Mute time too long')

  const unit = muteTime.match(/[a-z]/)[0]

  switch (unit) {
    case MuteTime.SECOND:
      return new Date(Date.now() + time * 1000)
    case MuteTime.MINUTE:
      return new Date(Date.now() + time * 1000 * 60)
    case MuteTime.HOUR:
      return new Date(Date.now() + time * 1000 * 60 * 60)
    case MuteTime.DAY:
      return new Date(Date.now() + time * 1000 * 60 * 60 * 24)
    case MuteTime.WEEK:
      return new Date(Date.now() + time * 1000 * 60 * 60 * 24 * 7)
    default:
      throw new Error('Invalid mute time')
  }
}
