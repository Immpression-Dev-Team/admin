// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/authContext";

// import ScreenTemplate from '../ScreenTemplate';
// import ListView from "../ListView";
// import TopPanel from "../TopPanel";

// export default function DataDisplay({ apiFunction, type, dataKeys, renderItem, onSearchCallback, filters }) {
//     const { authState } = useAuth();
//     const navigate = useNavigate();

//     const [data, setData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [viewMode, setViewMode] = useState("grid");

//     // load & set data by making the API call 
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!authState || !authState.token) {
//                 console.error("No token found, redirecting to login.");
//                 navigate("/login");
//                 return;
//             }
            
//             setLoading(true);
//             const fetchedData = await apiFunction(authState.token);
//             setData(fetchedData);
//             setFilteredData(fetchedData);
//             setLoading(false);
//         };
        
//         fetchData();
//     }, [authState?.token, apiFunction]);

//     // ✅ Show All Data (Reset Filter)
//     const resetFilter = () => setFilteredData(data);

//     // Apply the filter function
//     const applyFilter = (filterFunction) => {
//         setFilteredData(data.filter(filterFunction));
//     };

//     // Search function
//     const search = (query) => {
//         setFilteredData(onSearchCallback(query, data));
//     };

//     // ✅ Toggle View Mode
//     const toggleViewMode = () => {
//         setViewMode(viewMode === "grid" ? "list" : "grid");
//     };

//     // Render TopPanel dynamically based on type
//     const renderTopPanel = () => {
//         return (
//             <TopPanel
//                 totalItems={data.length}
//                 totalVerified={data.filter(item => item[dataKeys.verified]).length}
//                 totalUnverified={data.filter(item => !item[dataKeys.verified]).length}
//                 onShowAllItems={resetFilter}
//                 onFilterVerified={() => applyFilter(filters.verified)}
//                 onFilterUnverified={() => applyFilter(filters.unverified)}
//                 onSearch={search}
//                 viewMode={viewMode}
//                 toggleViewMode={toggleViewMode}
//             />
//         );
//     };

//     return (
//     <ScreenTemplate>
//         {renderTopPanel()}
//         <div className={`${type}Content`}>
//         {loading ? <p>Loading {type}...</p> : (
//             viewMode === "grid" ? (
//             <div className="grid">
//                 {filteredData.map(renderItem)}
//             </div>
//             ) : (
//             <ListView data={filteredData} type={type} />
//             )
//         )}
//         </div>
//     </ScreenTemplate>
//     );
// }