import { Hasher } from "@/domain/finances/application/cryptography/hasher";
import { compare, hash } from "bcryptjs";

export class HasherStup implements Hasher {
    async generate(plain: string) {
        const hashed = await hash(plain, 8)

        return hashed
    }

    async compare(plain: string, hash: string) {
        return await compare(plain, hash)
    }
}