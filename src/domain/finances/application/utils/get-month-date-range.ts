import { DateInterval } from "@/core/types/repositories/date-interval"
import dayjs from "dayjs"

type GetMonthDateRangeInput = {
    date: Date
}

type GetMonthDateRangeOutput = {
    title: string
    interval: DateInterval
}

export function getMonthDateRange({
    date
}: GetMonthDateRangeInput): GetMonthDateRangeOutput {
    const startDate = dayjs(date).startOf('month').toDate()
    const endDate = dayjs(date).endOf('month').toDate()

    const title = dayjs(date).format('MMMM YYYY')

    return {
        title,
        interval: {
            startDate,
            endDate
        }
    }
}