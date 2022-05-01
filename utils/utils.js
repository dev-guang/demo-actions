module.exports.isLastDayOfMonth = (date = new Date()) => {
    return date.getUTCDay() > (new Date(date.getTime() + 24 * 60 * 60 * 1000)).getUTCDay()
}