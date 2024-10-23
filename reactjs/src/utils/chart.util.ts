export const generateXLabelsDay = () => {
    const hoursArray = [];

    for (let i = 0; i < 24; i++) {
        let hour = i % 12 || 12;
        if (hour === 12 && i < 12) {
            hour = 0;
        }
        const amPm = i < 12 ? "AM" : "PM";
        hoursArray.push(`${hour.toString().padStart(2, "0")}:00 ${amPm}`);
    }

    return hoursArray;
};
