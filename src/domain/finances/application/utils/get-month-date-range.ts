import dayjs from "dayjs"

type GetMonthDateRangeInput = {
    date: Date
}

type GetMonthDateRangeOutput = {
    title: string
    start: Date
    end: Date
}

export function getMonthDateRange({
    date
}: GetMonthDateRangeInput): GetMonthDateRangeOutput {
    const start = dayjs(date).startOf('month').toDate()
    const end = dayjs(date).endOf('month').toDate()

    const title = dayjs(date).format('MMMM YYYY')

    return {
        title,
        start,
        end
    }
}