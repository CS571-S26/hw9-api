import { CS571DefaultPublicConfig } from "@cs571/api-framework";

export default interface HW9PublicConfig extends CS571DefaultPublicConfig {
    IS_REMOTELY_HOSTED: boolean;
    PASSWORDS_LOC: string;
}