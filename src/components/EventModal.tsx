"use client";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventName: string;
    eventTime: string;
    eventLocation: string;
    eventDescription?: string;
}

export default function EventModal({
    isOpen,
    onClose,
    eventName,
    eventTime,
    eventLocation,
    eventDescription
}: EventModalProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                <div className="bg-white rounded-xl shadow-2xl p-6 mx-4 animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-[#009EE2] to-[#07396E] p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white text-2xl">
                                    event
                                </span>
                            </div>
                            <h3 className="text-[#07396E] text-xl font-bold leading-tight">
                                Detalhes do Evento
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-[#07396E] transition-colors p-1 hover:bg-[#F2F2F2] rounded-lg"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-[#000000] text-lg font-semibold mb-2">
                                {eventName}
                            </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[#07396E]">
                            <span className="material-symbols-outlined text-xl">schedule</span>
                            <span className="text-sm font-medium">{eventTime}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#07396E]">
                            <span className="material-symbols-outlined text-xl">location_on</span>
                            <span className="text-sm font-medium">{eventLocation}</span>
                        </div>

                        {eventDescription && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h5 className="text-[#07396E] text-sm font-bold mb-2">
                                    Observações:
                                </h5>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {eventDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gradient-to-br from-[#009EE2] to-[#07396E] text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
