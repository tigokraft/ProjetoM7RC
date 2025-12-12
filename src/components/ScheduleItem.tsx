interface ScheduleItemProps {
    subject: string;
    time: string;
    location: string;
    icon: string;
}

export default function ScheduleItem({ subject, time, location, icon }: ScheduleItemProps) {
    return (
        <div className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between">
            <div className="flex items-center gap-4">
                <div className="text-[#111418] dark:text-white flex items-center justify-center rounded-lg bg-background-light dark:bg-[#232f3b] shrink-0 size-12">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#111418] dark:text-white text-base font-medium leading-normal line-clamp-1">
                        {subject}
                    </p>
                    <p className="text-[#617589] dark:text-[#a0b3c6] text-sm font-normal leading-normal line-clamp-2">
                        {time}
                    </p>
                </div>
            </div>
            <div className="shrink-0">
                <p className="text-[#617589] dark:text-[#a0b3c6] text-sm font-normal leading-normal">
                    {location}
                </p>
            </div>
        </div>
    );
}
