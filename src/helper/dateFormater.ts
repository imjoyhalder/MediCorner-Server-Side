import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AppError } from "../errors/AppError";

dayjs.extend(customParseFormat);

export const parseExpiryDate = (value: string): Date | undefined => {
    if (!value) return undefined;

    const formats = ["DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY"];

    const parsed = dayjs(value, formats, true); // strict mode

    if (!parsed.isValid()) {
        throw new AppError(400, "Invalid expiry date format");
    }


    if (parsed.isSame(dayjs(), "day") || parsed.isBefore(dayjs(), "day")) {
        throw new AppError(400, "Expiry date must be a future date");
    }

    return parsed.toDate();
};
