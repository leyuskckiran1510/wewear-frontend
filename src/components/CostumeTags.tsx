import React, { useEffect, useState } from "react";
import ENV from "@/config";

type Props = React.HTMLAttributes <
    HTMLImageElement | HTMLVideoElement | HTMLPreElement >
    &
    {
        src: string;
    };

export const Media: React.FC < Props > = ({ src, ...rest }) => {
    const fullSrc =
        src.startsWith("http://") || src.startsWith("https://") ?
        src :
        `${ENV.BASE_URL}${src}`;

    const [contentType, setContentType] = useState < string > ("");
    const [textContent, setTextContent] = useState < string > ("");
    const [blobUrl, setBlobUrl] = useState < string > ("");

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch(fullSrc);
                if (!res.ok) throw new Error("Failed to fetch media");
                const type = res.headers.get("Content-Type") || "";
                setContentType(type);

                if (type.startsWith("image/") || type.startsWith("video/")) {
                    const blob = await res.blob();
                    setBlobUrl(URL.createObjectURL(blob));
                } else {
                    const text = await res.text();
                    setTextContent(text);
                }
            } catch (err) {
                setTextContent("Failed to load media.");
            }
        };

        fetchMedia();

        // Cleanup blob URLs
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [fullSrc]);

    if (contentType.startsWith("image/") && blobUrl) {
        return (
            <img
        src={blobUrl}
        alt=""
        style={{ maxWidth: "100%" }}
        {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
      />
        );
    }

    if (contentType.startsWith("video/") && blobUrl) {
        return (
            <video
        src={blobUrl}
        controls
        style={{ maxWidth: "100%" }}
        {...(rest as React.VideoHTMLAttributes<HTMLVideoElement>)}
      />
        );
    }

    if (textContent) {
        return (
            <pre
        style={{
          maxWidth: "100%",
          overflowX: "auto",
          background: "#f4f4f4",
          padding: "10px",
          whiteSpace: "pre-wrap",
        }}
        {...(rest as React.HTMLAttributes<HTMLPreElement>)}
      >
        {textContent}
      </pre>
        );
    }

    return <div>Loading media…</div>;
};