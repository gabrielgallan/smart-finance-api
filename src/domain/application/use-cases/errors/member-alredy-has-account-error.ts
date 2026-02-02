export class MemberAlreadyHasAccountError extends Error {
    constructor() {
        super('Member already has account')
    }
}