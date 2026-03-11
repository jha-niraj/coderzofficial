import { Suspense } from "react";
import { PracticeLayoutWrapper } from "./_components/practice-layout-wrapper";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<div className="flex-1">{children}</div>}>
            <PracticeLayoutWrapper>{children}</PracticeLayoutWrapper>
        </Suspense>
    );
}
