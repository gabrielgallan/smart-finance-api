import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member, MemberProps } from "@/domain/finances/enterprise/entites/member";
import { Hash } from "@/domain/finances/enterprise/entites/value-objects/hash";
import { faker } from "@faker-js/faker";

export async function makeMember(
    override: Partial<MemberProps> = {},
    id?: UniqueEntityID
) {
    const member = Member.create({
      name: faker.person.fullName(),
      birthDate: new Date(2005, 9, 31),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      password: await Hash.create(faker.string.hexadecimal({
        length: 10
      })),
      ...override
    }, id)

    return member
}