import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function PageWrapper({ children }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64 mt-16 overflow-auto p-6">
                <Topbar />
                {children}
            </div>
        </div>
    );
}