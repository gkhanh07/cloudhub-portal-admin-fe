'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

const ProgressBarComponent = () => {
    return (
        <ProgressBar
            height="3px"
            color="#29D"
            options={{ showSpinner: false }}
            shallowRouting
        />
    );
};

export default ProgressBarComponent;
