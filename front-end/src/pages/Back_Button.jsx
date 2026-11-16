import { Link, useNavigate } from "react-router-dom";

/* Referenced https://markhorn.dev/blog/arrow-buttons for implementation */

const BackButton = props => {
    const navigate = useNavigate();

    return(
        <button 
            onClick={() => navigate(-1)}
            className="group not-prose inline-flex items-center gap-1 pl-2 pr-0.5 py-1 rounded-md font-bold bg-inherit border text-current hover:text-black hover:dark:text-white border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 hover:dark:bg-zinc-800 transition-colors duration-300 ease-in-out">
            
            <svg viewBox="0 0 24 24" className="size-5 stroke-[3px] fill-none stroke-current opacity-50 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                <line x1="5" y1="12" x2="19" y2="12" className="scale-x-0 translate-x-[10px] group-hover:translate-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"/>
                <polyline points="12 5 19 12 12 19" className="-translate-x-2 group-hover:translate-x-0 transition-transform duration-300 ease-in-out"/>
            </svg>
        </button>
    )
}