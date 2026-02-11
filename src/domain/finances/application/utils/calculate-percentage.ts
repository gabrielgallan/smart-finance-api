
type CalculatePartPercentageInput = {
    totalValue: number
    partValue: number
}

type CalculatePartPercentageOutput = number

export function calculatePartPercentage({
    totalValue,
    partValue
}: CalculatePartPercentageInput): CalculatePartPercentageOutput {
    if (totalValue === 0) return 0
    return (partValue / totalValue)
}