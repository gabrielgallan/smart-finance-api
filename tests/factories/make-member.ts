import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member, MemberProps } from "@/domain/enterprise/entites/member";
import { Hash } from "@/domain/enterprise/entites/value-objects/hash";
import { faker } from '@faker-js/faker'

export async function makeMember(
    override: Partial<MemberProps> = {},
    id?: UniqueEntityID
) {
    const member = Member.create({
      name: faker.person.fullName(),
      age: faker.number.int({ min: 14, max: 90 }),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      password: await Hash.crate(faker.string.hexadecimal({
        length: 10
      })),
      ...override
    }, id)

    return member
}