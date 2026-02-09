
type CalculatePartPercentageInput = {
    totalValue: number
    partValue: number
}

type CalculatePartPercentageOutput = number

export function calculatePartPercentage({
    totalValue,
    partValue
}: CalculatePartPercentageInput): CalculatePartPercentageOutput {
    return (partValue / totalValue) * 100
}