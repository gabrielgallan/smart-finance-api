import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member, MemberProps } from "@/domain/finances/enterprise/entities/member";
import { faker } from "@faker-js/faker";
import { HasherStup } from "test/unit/cryptography/hasher";

const hasher = new HasherStup()

export async function makeMember(
    override: Partial<MemberProps> = {},
    id?: UniqueEntityID
) {
    const member = Member.create({
      name: faker.person.fullName(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      password: await hasher.generate((faker.string.hexadecimal({
        length: 10
      }))),
      ...override
    }, id)

    return member
}