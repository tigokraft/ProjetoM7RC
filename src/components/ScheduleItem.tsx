interface ScheduleItemProps {
    subject: string;
    time: string;
    location: string;
    icon: string;
}

export default function ScheduleItem({ subject, time, location, icon }: ScheduleItemProps) {
    return (
        <div className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between hover:bg-[#F2F2F2] transition-colors">
            <div className="flex items-center gap-4">
                <div className="text-[#07396E] flex items-center justify-center rounded-lg bg-[#FDB515]/20 shrink-0 size-12">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#000000] text-base font-medium leading-normal line-clamp-1">
                        {subject}
                    </p>
                    <p className="text-[#07396E] text-sm font-normal leading-normal line-clamp-2">
                        {time}
                    </p>
                </div>
            </div>
            <div className="shrink-0">
                <p className="text-gray-600 text-sm font-normal leading-normal">
                    {location}
                </p>
            </div>
        </div>
    );
}
