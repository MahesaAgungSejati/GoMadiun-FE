import { useEffect, useState } from "react";

const useSnap = () => {
    const [snap, setSnap] = useState(null);

    useEffect(() => {
        const myMidtransClientKey = process.env.REACT_APP_MY_MIDTRANS_CLIENT_KEY;
        const script = document.createElement('script');
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute('data-client-key', myMidtransClientKey);
        script.onload = () => {
            setSnap(window.snap)
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const snapEmbed = (snap_token, embedId, action) => {
        if (snap) {
            snap.embed(snap_token, {
                embedId,

                onSuccess: function (result) {
                    action.onSuccess();
                    removeQueryParameters();
                },
                onPending: function (result) {
                    action.onPending('Pending');
                    removeQueryParameters();
                },
                onClose: function () {
                    action.onClose();
                    removeQueryParameters();
                }
            })
        }
    }

    const removeQueryParameters = () => {
        const url = new URL(window.location);
        url.search = ''; 
        window.history.replaceState({}, document.title, url.pathname);
    };

    return {snapEmbed}
}

export default useSnap;