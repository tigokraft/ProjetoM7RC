export default function SearchBar() {
    return (
        <div className="w-full">
            <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-[#617589] dark:text-[#a0b3c6] flex border-none bg-white dark:bg-[#15202c] items-center justify-center pl-4 rounded-l-lg border-r-0">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-[#15202c] focus:border-none h-full placeholder:text-[#617589] dark:placeholder:text-[#a0b3c6] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                        placeholder="Search for a subject..."
                        type="text"
                    />
                </div>
            </label>
        </div>
    );
}
