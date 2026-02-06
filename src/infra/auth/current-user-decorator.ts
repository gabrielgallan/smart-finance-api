import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "./jwt.strategy";

export const CurrentUser = createParamDecorator(
    (never: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest()

        return request.user as UserPayload
    }
)