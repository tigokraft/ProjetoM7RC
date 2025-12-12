import { ScheduleItem as ScheduleItemType } from "@/types/calendar";
import ScheduleItem from "./ScheduleItem";

interface ScheduleListProps {
    selectedDate: number;
    schedules: ScheduleItemType[];
}

export default function ScheduleList({ selectedDate, schedules }: ScheduleListProps) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-0 pt-4">
                Schedule for October {selectedDate}, 2024
            </h3>
            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-[#15202c] rounded-xl shadow-sm overflow-hidden">
                {schedules.map((schedule) => (
                    <ScheduleItem
                        key={schedule.id}
                        subject={schedule.subject}
                        time={schedule.time}
                        location={schedule.location}
                        icon={schedule.icon}
                    />
                ))}
            </div>
        </div>
    );
}
