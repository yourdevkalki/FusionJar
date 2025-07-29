"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Play,
  Pause,
  RefreshCw,
  Clock,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
} from "lucide-react";

interface SchedulerStatus {
  isRunning: boolean;
  timestamp: string;
}

export default function SchedulerPage() {
  const { authenticatedFetch } = useAuth();
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/api/scheduler/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error fetching scheduler status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action: string, frequency?: string) => {
    setActionLoading(true);
    try {
      const body = frequency ? { action, frequency } : { action };
      const response = await authenticatedFetch("/api/scheduler/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchStatus();
      }
    } catch (error) {
      console.error("Error executing scheduler action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Investment Scheduler
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and control automated investment executions
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Scheduler Status
              </p>
              <div className="flex items-center mt-2">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    status?.isRunning ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <p className="text-lg font-semibold text-gray-900">
                  {status?.isRunning ? "Running" : "Stopped"}
                </p>
              </div>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {status?.timestamp
                  ? new Date(status.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Next Execution
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {status?.isRunning ? "9:00 AM UTC" : "Scheduler Stopped"}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduler Controls */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-500" />
              Scheduler Controls
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => executeAction("start")}
                  disabled={actionLoading || status?.isRunning}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Scheduler
                </button>
                <button
                  onClick={() => executeAction("stop")}
                  disabled={actionLoading || !status?.isRunning}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Scheduler
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Manual Triggers
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => executeAction("trigger", "daily")}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger Daily
                  </button>
                  <button
                    onClick={() => executeAction("trigger", "weekly")}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Trigger Weekly
                  </button>
                </div>
              </div>

              <button
                onClick={fetchStatus}
                disabled={actionLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-500" />
              Schedule Information
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Daily Investments
                  </p>
                  <p className="text-sm text-gray-600">
                    Executes at 9:00 AM UTC
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">Active</p>
                  <p className="text-xs text-gray-500">Cron: 0 9 * * *</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Weekly Investments
                  </p>
                  <p className="text-sm text-gray-600">
                    Executes Monday 9:00 AM UTC
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">Active</p>
                  <p className="text-xs text-gray-500">Cron: 0 9 * * 1</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Health Check
                  </p>
                  <p className="text-sm text-gray-600">Every hour</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">Active</p>
                  <p className="text-xs text-gray-500">Cron: 0 * * * *</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Rules */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Execution Rules & Safety
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Execution Criteria
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Only processes active investment intents
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Respects minimum time intervals between executions
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Validates fee tolerance before execution
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Records all execution attempts for transparency
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Safety Measures
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  Maximum 20 hours between daily executions
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  Maximum 6 days between weekly executions
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  Automatic failure handling and retry logic
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  Comprehensive logging for audit trails
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Recent Scheduler Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">
              Scheduler activity logs will appear here once the scheduler is
              running.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
