export default function Header() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b-2 border-solid border-b-[#009EE2] px-10 py-4 bg-[#07396E] shadow-md">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 text-white">
                    <div className="size-6 text-[#FDB515]">
                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7v-5z"></path>
                        </svg>
                    </div>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        Calendário Escolar
                    </h2>
                </div>
            </div>
            <div className="flex flex-1 justify-end gap-4">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#009EE2] hover:bg-[#0088c4] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors">
                    <span className="material-symbols-outlined text-lg">settings</span>
                </button>
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#FDB515]"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADoFMxUBXqh2Ma8CEiytBaZ_-DCKKc7uoFu41DWmuhL0X9-24HufLDpqi2-kBigVcs712Nj0xeZ8jIOsKzbguKyR7lLyuufXpouY5oHzctsUmUqaH6yobwYWPjyfvlP9rz4Rwq15JHKW1u9aTPPePxXMv4boB763zLSSCynrytQJAuHyDay5xEV0RhrNMWBrFsyCBJbLX2or8ExwH74FwBLzLNCN1ijEfVA_XOYERtSFFO4IjiLcq_WO3A2hcB7Aft-jEvyPf3t94')"
                    }}
                ></div>
            </div>
        </header>
    );
}
