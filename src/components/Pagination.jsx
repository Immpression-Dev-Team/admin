import '@styles/pagination.css';

export function Pagination({ totalPages, page, onChange }) {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // display a set of page numbers
    const getPageNumbersToDisplay = () => {
        let pagesToDisplay = [];
        const displaySize = (window.innerWidth <= 480) ? 2 : 5;

        // return what it is within 5 pages
        if(totalPages <= displaySize){
            pagesToDisplay = pageNumbers;
        }
        else{
            const lastPage = pageNumbers[pageNumbers.length - 1];

            // display by page set: fist set (page 1 to displaySize), middle set, last set(n-5 to n)
            if(page <= displaySize){
                pagesToDisplay = [...pageNumbers.slice(0, displaySize), '...', lastPage];
            }
            else if(page > displaySize && page <= totalPages - displaySize){
                const start = page - 2
                const end = page + 2;

                pagesToDisplay = [
                    ...pageNumbers.slice(start-1, end), 
                    '...', 
                    lastPage
                ];
            }
            else{
                pagesToDisplay = [...pageNumbers.slice(totalPages-displaySize, totalPages)];
            }
        }

        return pagesToDisplay;
    };

    const pagesToDisplay = getPageNumbersToDisplay();

    return (
        <div className='paginationContainer'>
            {/* render buttons to prev & first page */}
            <button
                className={`page caret`} 
                onClick={() => onChange(1)}
                disabled={page == 1}
            >
                &#171;
            </button>

            <button
                className={`page caret`} 
                onClick={() => onChange(page-1)}
                disabled={page == 1}
            >
                &#8249;
            </button>

            {/* render all / 5 page numbers at a time */}
            {
                pagesToDisplay.map((pageNum, index) => {
                    const buttonType = (pageNum === page) ? "curr" : "";
                    if(pageNum === '...'){
                        return <span key={index}>...</span>;
                    }

                    return (
                        <button
                            key={index} 
                            className={`page ${buttonType}`} 
                            onClick={() => onChange(pageNum)}
                        >
                            {pageNum}
                        </button>
                    );
                })
            }

            {/* render buttons to next & last page */}
            <button
                className={`page caret`} 
                onClick={() => onChange(page+1)}
                disabled={page == totalPages}
            >
                &#8250;
            </button>

            <button
                className={`page caret`} 
                onClick={() => onChange(totalPages)}
                disabled={page == totalPages}
            >
                &#187;
            </button>
        </div>
    );  
}