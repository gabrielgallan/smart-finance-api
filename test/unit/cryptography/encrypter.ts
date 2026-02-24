import { Encrypter } from "@/domain/identity/application/cryptography/encrypter";

export class EncrypterStub implements Encrypter {
    async encrypt(payload: Record<string, unknown>) {
        return JSON.stringify(payload)
    }
}