"use client";

import { Plus } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import CreateSpaceSheet from './create-space-sheet';

interface CreateSpaceButtonProps {
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export default function CreateSpaceButton({ variant = 'default', size = 'default', className }: CreateSpaceButtonProps) {
    return (
        <CreateSpaceSheet
            trigger={
                <Button variant={variant} size={size} className={className}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Space
                </Button>
            }
        />
    );
}