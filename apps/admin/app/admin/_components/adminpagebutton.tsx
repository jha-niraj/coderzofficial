"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AdminPageButton() {
    const [activeTab, setActiveTab] = useState("pending");

    const handleClick = (tab: string) => {
        setActiveTab(tab);
    };

    return (
        <div className="flex space-x-2 mb-4">
            <Button
                variant={activeTab === "pending" ? "default" : "outline"}
                className={`flex-1 rounded-full transition-colors duration-300 ${activeTab === "pending"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                onClick={() => handleClick("pending")}
            >
                Pending
            </Button>
            <Button
                variant={activeTab === "today" ? "default" : "outline"}
                className={`flex-1 rounded-full transition-colors duration-300 ${activeTab === "today"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "text-indigo-600 hover:bg-indigo-50"
                    }`}
                onClick={() => handleClick("today")}
            >
                Today
            </Button>
        </div>
    );
}