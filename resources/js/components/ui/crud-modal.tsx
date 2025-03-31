import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface CrudModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
    isProcessing?: boolean;
    onSubmit?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    preventCloseOnClickOutside?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
    'sm': 'sm:max-w-[425px]',
    'md': 'sm:max-w-[550px]',
    'lg': 'sm:max-w-[650px]',
    'xl': 'sm:max-w-[800px]',
    '2xl': 'sm:max-w-[1000px]',
    'full': 'sm:max-w-[90vw] sm:h-[90vh]'
};

export default function CrudModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    isProcessing = false,
    onSubmit,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    preventCloseOnClickOutside = false
}: CrudModalProps) {
    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent 
                className={`${sizeClasses[size]} ${size === 'full' ? 'flex flex-col' : ''}`}
                aria-describedby={description ? 'modal-description' : undefined}
                onPointerDownOutside={(e) => {
                    if (preventCloseOnClickOutside) {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    if (preventCloseOnClickOutside) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription id="modal-description">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                
                <div className={`py-4 ${size === 'full' ? 'flex-1 overflow-auto' : ''}`}>
                    {children}
                </div>
                
                {footer ? (
                    footer
                ) : onSubmit ? (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            {cancelLabel}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={onSubmit} 
                            disabled={isProcessing}
                        >
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
