export abstract class Hasher {
    abstract generate(value: string): Promise<string>
    abstract compare(toCompare: string, hash: string): Promise<boolean>
}