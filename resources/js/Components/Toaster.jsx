import { Toaster as Sonner } from "sonner";

export default function Toaster() {
    return (
        <Sonner
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="light" // or "dark" or "system"
            toastOptions={{
                className: 'my-toast',
                style: {
                    borderRadius: '12px',
                    padding: '16px',
                },
            }}
        />
    );
}
