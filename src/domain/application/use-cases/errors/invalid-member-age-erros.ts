export class InvalidMemberAgeError extends Error {
    constructor() {
        super('Member must be over 14 years old to register')
    }
}