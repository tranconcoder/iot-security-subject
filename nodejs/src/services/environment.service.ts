import dayjs, { Dayjs } from "dayjs";
import { EnvironmentModel } from "../config/database/schema/environment.schema";
import { Date } from "../types/date";

export default class EnvironmentServices {
    public static async getInfo(date: Date) {
        let start: Dayjs, end: Dayjs;
        console.log(date);

        // Query by fullDate
        switch (true) {
            case Boolean(date.day && date.month):
                const fullDate = dayjs(
                    `${date.year}-${date.month}-${date.day}`
                );
                start = fullDate.startOf("day");
                end = fullDate.endOf("day");
                break;
            case !!date.month:
                // Query by month
                const monthDate = dayjs(`${date.year}-${date.month}-01`);
                start = monthDate.startOf("month");
                end = monthDate.endOf("month");
                break;
            default:
                // Query by year
                const yearDate = dayjs(`${date.year}-01-01`);
                start = yearDate.startOf("year");
                end = yearDate.endOf("year");
        }

        const environmentData = await EnvironmentModel.find({
            created_at: {
                $gte: start,
                $lte: end,
            },
        });

        return environmentData;
    }
}
