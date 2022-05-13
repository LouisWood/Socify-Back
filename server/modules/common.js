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

    if (year === currentYear && month === currentMonth && day === currentDay)
        parsedDate = `Aujourd'hui à ${hours}:${minutes}`
    else if (year === currentYear && month === currentMonth && (day + 1) === currentDay)
        parsedDate = `Hier à ${hours}:${minutes}`
    else
        parsedDate = `${day}/${month}/${year}`

    return parsedDate
}

module.exports = { parseDate }