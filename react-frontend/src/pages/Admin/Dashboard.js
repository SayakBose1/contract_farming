import React, {
    useState,
    useEffect
} from 'react';
import {
    FaUsers,
    FaHandshake,
    FaCog,
    FaChartBar,
    FaTrash,
    FaUserTie,
    FaTractor
} from 'react-icons/fa';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('farmers');

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/farmers');
            setFarmers(response.data.farmers || []);
        } catch (error) {
            console.error('Error fetching farmers:', error);
            toast.error('Failed to load farmers data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return ( <
            div className = "min-h-screen bg-gray-50 flex items-center justify-center" >
            <
            LoadingSpinner size = "lg" / >
            <
            /div>
        );
    }

    return ( <
        div className = "min-h-screen bg-gray-50 py-8" >
        <
        div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <
        div className = "mb-8" >
        <
        h1 className = "text-3xl font-bold text-gray-900" > Admin Dashboard < /h1> <
        p className = "text-gray-600" > System overview and management < /p> <
        /div>

        { /* Stats Cards */ } <
        div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" >
        <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        div className = "flex items-center" >
        <
        FaTractor className = "h-8 w-8 text-green-600 mr-3" / >
        <
        div >
        <
        p className = "text-2xl font-bold text-gray-900" > {
            farmers.length
        } < /p> <
        p className = "text-gray-600" > Total Farmers < /p> <
        /div> <
        /div> <
        /div>

        <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        div className = "flex items-center" >
        <
        FaUsers className = "h-8 w-8 text-blue-600 mr-3" / >
        <
        div >
        <
        p className = "text-2xl font-bold text-gray-900" > {
            farmers.filter(f => f.is_active).length
        } < /p> <
        p className = "text-gray-600" > Active Farmers < /p> <
        /div> <
        /div> <
        /div>

        <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        div className = "flex items-center" >
        <
        FaUserTie className = "h-8 w-8 text-purple-600 mr-3" / >
        <
        div >
        <
        p className = "text-2xl font-bold text-gray-900" > {
            farmers.filter(f => f.user_type === 'FT').length
        } < /p> <
        p className = "text-gray-600" > Farmer Traders < /p> <
        /div> <
        /div> <
        /div>

        <
        div className = "bg-white p-6 rounded-lg shadow-md" >
        <
        div className = "flex items-center" >
        <
        FaChartBar className = "h-8 w-8 text-orange-600 mr-3" / >
        <
        div >
        <
        p className = "text-2xl font-bold text-gray-900" > {
            farmers.filter(f => f.experience_years > 5).length
        } < /p> <
        p className = "text-gray-600" > Experienced(5 + years) < /p> <
        /div> <
        /div> <
        /div> <
        /div>

        { /* Tab Navigation */ } <
        div className = "bg-white rounded-lg shadow-md mb-6" >
        <
        div className = "border-b border-gray-200" >
        <
        nav className = "-mb-px flex space-x-8 px-6" >
        <
        button onClick = {
            () => setActiveTab('farmers')
        }
        className = {
            `py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'farmers'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
        } >
        Farmers({
            farmers.length
        }) <
        /button> <
        /nav> <
        /div>

        <
        div className = "p-6" > {
            activeTab === 'farmers' && ( <
                div >
                <
                h3 className = "text-lg font-medium text-gray-900 mb-4" > Farmer Management < /h3> <
                div className = "overflow-x-auto" >
                <
                table className = "min-w-full divide-y divide-gray-200" >
                <
                thead className = "bg-gray-50" >
                <
                tr >
                <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Farmer Details <
                /th> <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Type <
                /th> <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Contact <
                /th> <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Experience <
                /th> <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Status <
                /th> <
                th className = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" >
                Location <
                /th> <
                /tr> <
                /thead> <
                tbody className = "bg-white divide-y divide-gray-200" > {
                    farmers.map((farmer) => ( <
                        tr key = {
                            farmer.user_id
                        } >
                        <
                        td className = "px-6 py-4 whitespace-nowrap" >
                        <
                        div className = "flex items-center" >
                        <
                        div className = "flex-shrink-0 h-10 w-10" >
                        <
                        div className = "h-10 w-10 rounded-full bg-green-100 flex items-center justify-center" >
                        <
                        FaTractor className = "h-5 w-5 text-green-600" / >
                        <
                        /div> <
                        /div> <
                        div className = "ml-4" >
                        <
                        div className = "text-sm font-medium text-gray-900" > {
                            farmer.full_name || 'N/A'
                        } <
                        /div> <
                        div className = "text-sm text-gray-500" >
                        ID: {
                            farmer.user_id
                        } | {
                            farmer.gender_display
                        } | Age: {
                            farmer.age || 'N/A'
                        } <
                        /div> <
                        /div> <
                        /div> <
                        /td> <
                        td className = "px-6 py-4 whitespace-nowrap" >
                        <
                        span className = {
                            `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              farmer.user_type === 'F' 
                                ? 'bg-green-100 text-green-800'
                                : farmer.user_type === 'FT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`
                        } > {
                            farmer.user_type_display
                        } <
                        /span> <
                        /td> <
                        td className = "px-6 py-4 whitespace-nowrap" >
                        <
                        div className = "text-sm text-gray-900" > {
                            farmer.mobile_number || 'N/A'
                        } < /div> <
                        div className = "text-sm text-gray-500" > {
                            farmer.email_id || 'N/A'
                        } < /div> <
                        /td> <
                        td className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500" > {
                            farmer.experience_years ? `${farmer.experience_years} years` : 'N/A'
                        } <
                        /td> <
                        td className = "px-6 py-4 whitespace-nowrap" >
                        <
                        span className = {
                            `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              farmer.is_active 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`
                        } > {
                            farmer.is_active ? 'Active' : 'Inactive'
                        } <
                        /span> <
                        /td> <
                        td className = "px-6 py-4 whitespace-nowrap text-sm text-gray-500" >
                        <
                        div className = "max-w-xs truncate" > {
                            farmer.address || 'N/A'
                        } <
                        /div> <
                        div className = "text-xs text-gray-400" >
                        District: {
                            farmer.district_id || 'N/A'
                        } | Block: {
                            farmer.block_id || 'N/A'
                        } <
                        /div> <
                        /td> <
                        /tr>
                    ))
                } <
                /tbody> <
                /table> <
                /div> {
                    farmers.length === 0 && ( <
                        div className = "text-center py-12" >
                        <
                        FaTractor className = "h-16 w-16 text-gray-300 mx-auto mb-4" / >
                        <
                        h3 className = "text-xl font-semibold text-gray-900 mb-2" > No Farmers Found < /h3> <
                        p className = "text-gray-600" > No farmer data is available in the system. < /p> <
                        /div>
                    )
                } <
                /div>
            )
        } <
        /div> <
        /div> <
        /div> <
        /div>
    );
};

export default AdminDashboard;