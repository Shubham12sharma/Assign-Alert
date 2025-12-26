import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import CommunityList from "../pages/community/CommunityList";
import TaskBoard from "../pages/tasks/TaskBoard";
import EpicList from "../pages/epics/EpicList";
import AIInsights from "../pages/ai/AIInsights";
import ProtectedRoute from "./ProtectedRoute";
import SprintDashboard from "../pages/sprints/SprintDashboard";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/communities"
                    element={
                        <ProtectedRoute>
                            <CommunityList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <TaskBoard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sprints"
                    element={
                        <ProtectedRoute>
                            <SprintDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/epics"
                    element={
                        <ProtectedRoute>
                            <EpicList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ai"
                    element={
                        <ProtectedRoute>
                            <AIInsights />
                        </ProtectedRoute>
                    }
                />
                {/* <Route path="/epics/:epicId" element={<EpicDetails />} /> */}

                {/* Default Route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
