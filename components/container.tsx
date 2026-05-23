"use client";

interface ContainerProps {
    children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
    return (
        <div className="p-4 mt-6">
            {children}
        </div>
    );
}