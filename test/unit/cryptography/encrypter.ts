import { Encrypter } from "@/domain/finances/application/cryptography/encrypter";

export class EncrypterStub implements Encrypter {
    async encrypt(payload: Record<string, unknown>) {
        return JSON.stringify(payload)
    }
}