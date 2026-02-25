import { ExternalAccountProvider } from "@prisma/client"

export class PrismaAccountProviderMapper {
  static toPrisma(provider: string): ExternalAccountProvider {
    const map: Record<string, ExternalAccountProvider> = {
      github: ExternalAccountProvider.GITHUB,
    }

    const prismaProvider = map[provider.toLowerCase()]

    if (!prismaProvider) {
      throw new Error(`Invalid external account provider: ${provider}`)
    }

    return prismaProvider
  }

  static toDomain(provider: ExternalAccountProvider): string {
    const map: Record<ExternalAccountProvider, string> = {
      [ExternalAccountProvider.GITHUB]: 'github',
    }

    const domainProvider = map[provider]

    if (!domainProvider) {
      throw new Error(`Unknown Prisma provider: ${provider}`)
    }

    return domainProvider
  }
}