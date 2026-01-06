import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, Filter, Briefcase, AlertCircle, Settings } from "lucide-react";
import axios from "axios";
import moment from "moment";
import { AppContext } from "../context/AppContext";

const Notifications = () => {
    const { backendUrl, userToken, isLogin } = useContext(AppContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, job_match, application_status, system
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogin) {
            navigate("/candidate-login");
            return;
        }
        fetchNotifications();
    }, [userToken, isLogin]);

    const fetchNotifications = async () => {
        if (!userToken) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/user/notifications`, {
                headers: { token: userToken },
            });
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(
                `${backendUrl}/user/notifications/${notificationId}/read`,
                {},
                { headers: { token: userToken } }
            );
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(
                `${backendUrl}/user/notifications/all/read`,
                {},
                { headers: { token: userToken } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(
                `${backendUrl}/user/notifications/${notificationId}`,
                { headers: { token: userToken } }
            );
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.jobId?._id) {
            navigate(`/apply-job/${notification.jobId._id}`);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "job_match":
                return <Briefcase className="w-5 h-5 text-blue-500" />;
            case "application_status":
                return <AlertCircle className="w-5 h-5 text-green-500" />;
            case "system":
                return <Settings className="w-5 h-5 text-gray-500" />;
            default:
                return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "job_match":
                return "Job Match";
            case "application_status":
                return "Application Update";
            case "system":
                return "System";
            default:
                return "Notification";
        }
    };

    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(n => n.type === filter);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isLogin) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Bell className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                            <p className="text-sm text-gray-500">
                                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { key: "all", label: "All" },
                        { key: "job_match", label: "Job Matches" },
                        { key: "application_status", label: "Applications" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === key
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-600">No notifications</h3>
                            <p className="text-gray-400 mt-1">
                                {filter === "all"
                                    ? "You're all caught up!"
                                    : `No ${getTypeLabel(filter).toLowerCase()} notifications`}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-blue-50/50" : ""
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {getTypeIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-gray-400">
                                                {moment(notification.createdAt).fromNow()}
                                            </span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs text-gray-400">
                                                {getTypeLabel(notification.type)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
