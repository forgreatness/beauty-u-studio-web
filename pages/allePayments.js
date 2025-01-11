import { useEffect } from 'react';
import Layout from '../components/page-layout.js';

export default function AllePaymentsPage() {
    useEffect(() => {
        let retryAttempts = 0; // Limit retries
        const maxRetries = 10; // Maximum retry attempts
        const retryDelay = 300; // Delay between retries in milliseconds

        const initializeCherryWidget = () => {
            if (typeof window._hw !== 'undefined') {
                // Initialize the Cherry widget
                window._hw(
                    "init",
                    {
                        debug: false,
                        variables: {
                            slug: 'beautyu-studio', // Replace with your Cherry slug
                            name: 'BeautyUStudio Spa', // Replace with your business name
                            alle: true,
                        },
                        styles: {
                            primaryColor: '#735366', // Customize as needed
                            secondaryColor: '#F5D69B', // Customize as needed
                            fontFamily: 'Open Sans', // Customize as needed
                        },
                    },
                    ['all', 'hero', 'howitworks', 'testimony', 'faq', 'calculator']
                );
                console.log('Cherry widget initialized successfully.');
            } else if (retryAttempts < maxRetries) {
                // Retry initialization if _hw is not ready
                retryAttempts++;
                // console.warn(Cherry widget not ready. Retrying... (${retryAttempts}/${maxRetries}));
                setTimeout(initializeCherryWidget, retryDelay);
            } else {
                console.error('Failed to initialize Cherry widget after maximum retries.');
            }
        };

        const loadCherryWidgetScript = () => {
            if (typeof window._cherryScriptLoaded === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://files.withcherry.com/widgets/widget.js';
                script.async = true;

                script.onload = () => {
                    console.log('Cherry widget script loaded.');
                    initializeCherryWidget(); // Try to initialize after script loads
                };

                script.onerror = () => {
                    console.error('Failed to load the Cherry widget script.');
                };

                document.head.appendChild(script);
                window._cherryScriptLoaded = true; // Prevent duplicate loads
            } else {
                // Script already loaded, just initialize
                initializeCherryWidget();
            }
        };

        if (typeof window !== 'undefined') {
            loadCherryWidgetScript();
        }
    }, []);

    return (
        <Layout>
            <div id="all"></div> {/* Container for the Cherry widget */}
        </Layout>
    );
}