"use client";

import { Suspense } from "react";
import ResetPassword from "./_components/resetpassword";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">Loading...</div>}>
            <div>
                <ResetPassword />
            </div>
        </Suspense>
    );
}