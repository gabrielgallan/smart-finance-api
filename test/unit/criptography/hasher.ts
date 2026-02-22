import { Hasher } from "@/domain/finances/application/criptography/hasher";
import { compare, hash } from "bcryptjs";

export class BcriptjsHasher implements Hasher {
    async generate(value: string) {
        const valueHash = await hash(value, 6)

        return valueHash
    }

    async compare(toCompare: string, hash: string) {
        return await compare(toCompare, hash)
    }
}