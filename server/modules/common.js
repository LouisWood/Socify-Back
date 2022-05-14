const parseDate = dateToParse => {
    let parsedDate = ''

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const currentDay = currentDate.getDate()

    const date = new Date (dateToParse)
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    const hoursString = hours < 10 ? `0${hours}` : hours.toString()
    const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString()

    if (year === currentYear && month === currentMonth && day === currentDay)
        parsedDate = `Aujourd'hui à ${hoursString}:${minutesString}`
    else if (year === currentYear && month === currentMonth && (day + 1) === currentDay)
        parsedDate = `Hier à ${hoursString}:${minutesString}`
    else
        parsedDate = `${day}/${month}/${year}`

    return parsedDate
}

module.exports = { parseDate }