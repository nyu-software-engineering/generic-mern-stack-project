import { useNavigate } from "react-router-dom";

/* Referenced https://markhorn.dev/blog/arrow-buttons and edited for style and functionality for implementation */

const BackButton = props => {
    const navigate = useNavigate();

    return(
        <button 
            onClick={() => navigate(-1)}
            className="not-prose inline-flex items-center gap-1 pl-2 pr-0.5 py-1 ml-4 rounded-md font-bold bg-inherit border text-black dark:text-white border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800">
            
            <svg viewBox="0 0 32 32" className="size-5 stroke-[3px] fill-none stroke-current opacity-100">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 5 12 12 19"/>
            </svg>
        </button>
    )
}
export default BackButton
