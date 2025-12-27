import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import PersonalDashboard from "../pages/dashboard/PersonalDashboard";
import CommunityList from "../pages/community/CommunityList";
import TaskBoard from "../pages/tasks/TaskBoard";
import SprintDashboard from "../pages/sprints/SprintDashboard";
import EpicList from "../pages/epics/EpicList";
import EpicDetails from "../pages/epics/EpicDetails";
import SprintDetails from "../pages/sprints/SprintDetails";
import AIInsights from "../pages/ai/AIInsights";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import LandingPage from "../pages/LandingPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Static Routes – MUST come BEFORE dynamic routes */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/personal"
                    element={
                        <ProtectedRoute>
                            <PersonalDashboard />
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

                {/* Dynamic Routes – MUST come AFTER static ones */}
                <Route
                    path="/epics/:epicId"
                    element={
                        <ProtectedRoute>
                            <EpicDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sprints/:sprintId"
                    element={
                        <ProtectedRoute>
                            <SprintDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}