"use client";

import dynamic from "next/dynamic";

const AuthDialog = dynamic(() => import("./auth-dialog").then(mod => ({ default: mod.AuthDialog })), {
    ssr: false,
    loading: () => null
});

export function AuthDialogWrapper() {
    return <AuthDialog />;
}