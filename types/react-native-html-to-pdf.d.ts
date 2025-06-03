declare module 'react-native-html-to-pdf' {
    interface RNHTMLtoPDFOptions {
        html: string;
        fileName?: string;
        directory?: string;
        base64?: boolean;
    }

    interface RNHTMLtoPDFResponse {
        filePath: string;
        base64?: string;
    }

    const RNHTMLtoPDF: {
        convert(options: RNHTMLtoPDFOptions): Promise<RNHTMLtoPDFResponse>;
    };

    export default RNHTMLtoPDF;
} 