'use client';

import { useState } from "react";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

const BlogsFilters = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    return (
        <div>
            <button
                onClick={toggleMenu}
                className="bg-gradient-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-2 py-[7px] text-sm rounded-xs cursor-pointer font-semibold text-white lg:flex items-center justify-center gap-2 hidden h-10"
                aria-label="Toggle menu"
            >
                <HiOutlineMenuAlt3 className="h-4 w-4" />
                Filters
            </button>
        </div>
    );
}

export default BlogsFilters;