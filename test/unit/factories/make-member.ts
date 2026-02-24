import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Member, MemberProps } from "@/domain/finances/enterprise/entities/member";

export async function makeMember(
  override: Partial<MemberProps> = {},
  id?: UniqueEntityID
) {
  const member = Member.create({
    ...override
  }, id)

  return member
}