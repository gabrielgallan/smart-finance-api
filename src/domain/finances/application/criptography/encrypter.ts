export abstract class Encrypter {
    abstract encrypt(value: string): Promise<void>
}